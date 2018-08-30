import { Stream, StreamOptions } from './stream'

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
export abstract class DataHost<T> {
    protected readonly data: T[]

    constructor( data: T[] ) {
        this.data = data
        this.infiniteReset = this.infiniteReset.bind( this )
    }

    /**
     * Returns a new stream of the data that the host stores.
     * Consecutive calls always return a new instance of same data.
     * @param options Options for the stream
     */
    toStream( options?: StreamOptions<T> ): Stream<T> {
        const alteredOptions = { ...options, infiniteReset: this.infiniteReset }
        const stream = new Stream<T>( alteredOptions )
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
    abstract infiniteReset( data: T ): T
}

/**
 * A data host that can provide Point data stream and promise.
 */
export class PointDataHost extends DataHost<Point> {
    constructor( data: Point[] ) {
        super( data )
    }

    infiniteReset( data: Point ): Point {
        return { x: data.x + this.data.length, y: data.y }
    }
}
