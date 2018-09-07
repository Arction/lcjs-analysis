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
 */
export class DataHost<T> {
    private data: T[] = []
    private derivativeDataHosts: DataHost<T>[] = []
    protected frozenData?: ReadonlyArray<T>
    private ready: boolean = false
    private promisesToResolve: ( ( value?: T[] | PromiseLike<T[]> | undefined ) => void )[] = []
    private streamsToPush: Stream<T>[] = []
    private readonly infiniteResetHandler: ( dataToReset: T, data: T[] ) => T
    private streamOptions: Readonly<StreamOptions>

    constructor( infiniteResetHandler: ( dataToReset: T, data: T[] ) => T, streamOptions?: StreamOptions ) {
        this.infiniteReset = this.infiniteReset.bind( this )
        this.infiniteResetHandler = infiniteResetHandler
        const streamOpts = streamOptions || {}
        const opts = {
            interval: streamOpts.interval || 1000,
            batchSize: streamOpts.batchSize || 10,
            repeat: streamOpts.repeat !== undefined ? streamOpts.repeat : false
        }
        this.streamOptions = Object.freeze( opts )
    }

    /**
     * Returns a new stream of the data that the host stores.
     * Consecutive calls always return a new instance of same data.
     */
    toStream(): Stream<T> {
        const stream = new Stream<T>( this.streamOptions, this.infiniteReset )
        if ( this.ready && this.frozenData ) {
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
    toPromise(): Promise<ReadonlyArray<T>> {
        let pr
        if ( this.ready && this.frozenData ) {
            pr = Promise.resolve( this.frozenData )
        } else {
            pr = new Promise<ReadonlyArray<T>>( resolve => { this.promisesToResolve.push( resolve ) } )
        }
        return pr
    }

    /**
     * Handles resetting the data when used as infinite stream of data.
     * Used to recalculate the point when it is moved to end of stream.
     * @param data Data to reset
     */
    infiniteReset( data: T ): T {
        return this.infiniteResetHandler( data, this.data || [] )
    }

    push( data: T[] | T | ReadonlyArray<T> ) {
        if ( !this.ready ) {
            if ( Array.isArray( data ) || Object.isFrozen( data ) ) {
                this.data = this.data.concat( data )
            } else {
                this.data.push( data as T )
            }
        }
    }

    freeze() {
        this.promisesToResolve.forEach( p => p( this.data ) )
        this.promisesToResolve = []
        this.streamsToPush.forEach( s => s.push( this.data ) )
        this.streamsToPush = []
        this.ready = true
        this.frozenData = Object.freeze( this.data )
        this.data = []
    }

    getPointCount() {
        return this.frozenData ? this.frozenData.length : 0
    }

    private handleDerivativeDataHosts() {
        if ( this.ready && this.frozenData ) {
            this.derivativeDataHosts.forEach( host => {
                if ( this.frozenData ) {
                    host.push( this.frozenData )
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
    setStreamInterval( interval?: number ) {
        const dataHost = new DataHost<T>( this.infiniteResetHandler, { ...this.streamOptions, interval } )
        this.derivativeDataHosts.push( dataHost )
        this.handleDerivativeDataHosts()
        return dataHost
    }

    /**
     * Returns a new data host with the new batch size and same data that the original host had.
     * @param batchSize New batch size for the stream
     */
    setStreamBatchSize( batchSize?: number ) {
        const dataHost = new DataHost<T>( this.infiniteResetHandler, { ...this.streamOptions, batchSize } )
        this.derivativeDataHosts.push( dataHost )
        this.handleDerivativeDataHosts()
        return dataHost
    }

    /**
     * Returns a new data host with the new repeat and same data that the original host had.
     * @param repeat New repeat for the stream
     */
    setStreamRepeat( repeat?: boolean | number | StreamContinueHandler ) {
        const dataHost = new DataHost<T>( this.infiniteResetHandler, { ...this.streamOptions, repeat } )
        this.derivativeDataHosts.push( dataHost )
        this.handleDerivativeDataHosts()
        return dataHost
    }
}
