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
    protected readonly data: Promise<T[]>

    constructor( data: Promise<T[]> ) {
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
        return new Stream<T>( this.data, alteredOptions )
    }

    /**
     * Returns the data as a promise.
     * Consecutive calls always return a new instance of same data.
     */
    toPromise(): Promise<T[]> {
        return this.data
    }

    /**
     * Handles resetting the data when used as infinite stream of data.
     * Allows the stream to continue from beginning with corrected values for e.g. XY data X is offset by
     * the lenght of data at each reset.
     * @param data Data to reset
     * @param offset The offset to use when resetting, basically data length.
     */
    abstract infiniteReset( data: T[], offset?: number ): T[]
}

/**
 * A data host that can provide Point data stream and promise.
 */
export class PointDataHost extends DataHost<Point> {
    constructor( data: Promise<Point[]> ) {
        super( data )
    }

    infiniteReset( data: Point[], offset?: number ): Point[] {
        const nOffset = offset || data.length
        return data.map( val => ( { x: val.x + nOffset, y: val.y } ) )
    }
}
