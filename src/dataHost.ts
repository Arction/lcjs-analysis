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
 * A base class for a data host that is capable to store the data and provide it as
 * a stream or a promise.
 */
export class DataHost<T> {
    protected readonly data: T[]
    private readonly infiniteResetHandler: ( dataToReset: T, data: T[] ) => T
    private streamOptions: StreamOptions

    constructor( data: T[], infiniteResetHandler: ( dataToReset: T, data: T[] ) => T, streamOptions?: StreamOptions ) {
        this.data = data
        this.infiniteReset = this.infiniteReset.bind( this )
        this.infiniteResetHandler = infiniteResetHandler
        const streamOpts = streamOptions || {}
        this.streamOptions = {
            interval: streamOpts.interval || 1000,
            batchSize: streamOpts.batchSize || 10,
            repeat: streamOpts.repeat || true
        }
    }

    /**
     * Returns a new stream of the data that the host stores.
     * Consecutive calls always return a new instance of same data.
     */
    toStream(): Stream<T> {
        const stream = new Stream<T>( this.streamOptions, this.infiniteReset )
        stream.push( this.data )
        return stream
    }

    /**
     * Returns the data as a promise.
     * Consecutive calls always return a new instance of same data.
     */
    toPromise(): Promise<T[]> {
        return Promise.resolve( this.data )
    }

    /**
     * Handles resetting the data when used as infinite stream of data.
     * Used to recalculate the point when it is moved to end of stream.
     * @param data Data to reset
     */
    infiniteReset( data: T ): T {
        return this.infiniteResetHandler( data, this.data )
    }

    /**
     * Returns a new data host with the new interval and same data that the original host had.
     * @param interval New interval delay for the stream
     */
    setStreamInterval( interval?: number ) {
        return new DataHost<T>( this.data,
            this.infiniteResetHandler,
            this.streamOptions ? { ...this.streamOptions, interval } : { interval }
        )
    }

    /**
     * Returns a new data host with the new batch size and same data that the original host had.
     * @param batchSize New batch size for the stream
     */
    setStreamBatchSize( batchSize?: number ) {
        return new DataHost<T>( this.data,
            this.infiniteResetHandler,
            this.streamOptions ? { ...this.streamOptions, batchSize } : { batchSize }
        )
    }

    /**
     * Returns a new data host with the new repeat and same data that the original host had.
     * @param repeat New repeat for the stream
     */
    setStreamRepeat( repeat?: boolean | number | StreamContinueHandler ) {
        return new DataHost<T>( this.data,
            this.infiniteResetHandler,
            this.streamOptions ? { ...this.streamOptions, repeat } : { repeat }
        )
    }
}
