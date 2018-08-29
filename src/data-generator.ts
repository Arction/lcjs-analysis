import { Stream, StreamOptions } from './stream'

export interface Point {
    x: number,
    y: number
}

export abstract class DataGenerator<T, K> {
    protected readonly options: K
    constructor( args: K ) {
        this.options = args
    }

    generate(): DataHost<T> {
        return this.generator( this.options )
    }

    abstract generator( args: K ): DataHost<T>
}

export abstract class DataHost<T> {
    protected readonly data: Promise<T[]>

    constructor( data: Promise<T[]> ) {
        this.data = data
        this.infiniteReset = this.infiniteReset.bind( this )
    }

    toStream( options?: StreamOptions<T> ): Stream<T> {
        const alteredOptions = { ...options, infiniteReset: this.infiniteReset }
        return new Stream<T>( this.data, alteredOptions )
    }

    toPromise(): Promise<T[]> {
        return this.data
    }

    abstract infiniteReset( data: T[], lenght?: number ): T[]
}

export class PointDataHost extends DataHost<Point> {
    constructor( data: Promise<Point[]> ) {
        super( data )
    }

    infiniteReset( data: Point[], offset?: number ): Point[] {
        const nOffset = offset || data.length
        return data.map( val => ( { x: val.x + nOffset, y: val.y } ) )
    }
}
