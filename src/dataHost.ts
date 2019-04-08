import { Stream, StreamOptions, StreamContinueHandler } from './stream'

/**
 * Represents a xy point
 */
export interface Point {
    /**
     * X Coordinate
     */
    x: number,
    /**
     * Y Coordinate
     */
    y: number
}
/**
 * OHLC data
 * timestamp, open, high, low, close
 */
export type OHLCData = [number, number, number, number, number]

/**
 * A base class for a data host that is capable to store the data and provide it as
 * a stream or a promise.
 * @param T Data type of the hosted data
 */
export class DataHost<T> {
    private data: T[] = []
    private derivativeDataHosts: DataHost<T>[] = []
    protected frozenData?: T[]
    private promisesToResolve: ( ( value?: T[] | PromiseLike<T[]> | undefined ) => void )[] = []
    private streamsToPush: Stream<T>[] = []
    private readonly infiniteResetHandler: ( dataToReset: T, data: T[] ) => T
    private streamOptions: Readonly<StreamOptions>

    constructor( infiniteResetHandler: ( dataToReset: T, data: T[] ) => T, streamOptions: StreamOptions ) {
        this.infiniteReset = this.infiniteReset.bind( this )
        this.infiniteResetHandler = infiniteResetHandler
        const opts = {
            interval: streamOptions.interval,
            batchSize: streamOptions.batchSize,
            repeat: streamOptions.repeat !== undefined ? streamOptions.repeat : false
        }
        this.streamOptions = Object.freeze( opts )
    }

    /**
     * Returns a new stream of the data that the host stores.
     * Consecutive calls always return a new instance of same data.
     */
    toStream(): Stream<T> {
        const stream = new Stream<T>( this.streamOptions, this.infiniteReset )
        if ( this.frozenData ) {
            stream.push( this.frozenData )
        } else {
            this.streamsToPush.push( stream )
        }
        return stream
    }

    /**
     * Returns the data as a promise.
     * Consecutive calls always return a new instance of same data.
     */
    toPromise(): Promise<T[]> {
        let pr
        if ( this.frozenData ) {
            pr = Promise.resolve( this.frozenData )
        } else {
            pr = new Promise<T[]>( resolve => { this.promisesToResolve.push( resolve ) } )
        }
        return pr
    }

    /**
     * Handles resetting the data when used as infinite stream of data.
     * Used to recalculate the point when it is moved to end of stream.
     * @param data Data to reset
     */
    private infiniteReset( data: T ): T {
        return this.infiniteResetHandler( data, this.frozenData ? this.frozenData : [] )
    }

    /**
     * Push data to to the data host. Data is only accepted while the data host is not frozen.
     * @param data Data to add to the data host.
     */
    push( data: T[] | T ) {
        if ( !this.frozenData ) {
            if ( Array.isArray( data ) ) {
                for ( const d of data ) {
                    this.data.push( d )
                }
            } else {
                this.data.push( data as T )
            }
        }
    }

    /**
     * Set the data to use as data source. Discards old data.
     * @param newData New data to use.
     */
    setData( newData: T[] ) {
        this.data = newData
    }

    /**
     * Freeze the data host data.
     * After freezing the data the data can be accessed by toStream and toPromise.
     */
    freeze() {
        if ( !this.frozenData ) {
            this.frozenData = this.data
            setTimeout( () => {
                this.promisesToResolve.forEach( p => p( this.frozenData ) )
                this.promisesToResolve = []
            }, 0 )
            setTimeout( () => {
                this.streamsToPush.forEach( s => s.push( this.frozenData || [] ) )
                this.streamsToPush = []
            }, 0 )
            setTimeout( () => {
                this.handleDerivativeDataHosts()
            }, 0 )
            this.data = []
        }
    }

    /**
     * Return how many points of data this data host has.
     */
    getPointCount() {
        return this.frozenData ? this.frozenData.length : 0
    }

    /**
     * Handle DataHosts that have been created based of this data host.
     * Those data hosts should get same data as the base data host.
     */
    private handleDerivativeDataHosts() {
        if ( this.frozenData && this.derivativeDataHosts.length > 0 ) {
            this.derivativeDataHosts.forEach( host => {
                if ( this.frozenData ) {
                    host.setData( this.frozenData )
                }
                host.freeze()
            } )
            this.derivativeDataHosts = []
        }
    }

    /**
     * Returns a new data host with the new interval and same data that the original host had.
     * @param interval New interval delay for the stream
     */
    setStreamInterval( interval: number ) {
        const dataHost = new DataHost<T>( this.infiniteResetHandler, { ...this.streamOptions, interval } )
        this.derivativeDataHosts.push( dataHost )
        this.handleDerivativeDataHosts()
        return dataHost
    }

    /**
     * Returns a new data host with the new batch size and same data that the original host had.
     * @param batchSize New batch size for the stream
     */
    setStreamBatchSize( batchSize: number ) {
        const dataHost = new DataHost<T>( this.infiniteResetHandler, { ...this.streamOptions, batchSize } )
        this.derivativeDataHosts.push( dataHost )
        this.handleDerivativeDataHosts()
        return dataHost
    }

    /**
     * Returns a new data host with the new repeat and same data that the original host had.
     * @param repeat New repeat for the stream
     */
    setStreamRepeat( repeat: boolean | number | StreamContinueHandler ) {
        const dataHost = new DataHost<T>( this.infiniteResetHandler, { ...this.streamOptions, repeat } )
        this.derivativeDataHosts.push( dataHost )
        this.handleDerivativeDataHosts()
        return dataHost
    }
}
