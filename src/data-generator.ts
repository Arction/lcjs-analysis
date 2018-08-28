import { Stream, StreamOptions } from './stream'

export interface Point {
    x: number,
    y: number
}

export abstract class DataGenerator<T, K> {
    protected readonly data: Promise<T[]>
    protected readonly options: K

    constructor( args: K ) {
        this.options = args
        this.data = this.generator( args || {} )
        this.infiniteReset = this.infiniteReset.bind( this )
    }

    toStream( options?: StreamOptions<T> ): Stream<T> {
        const alteredOptions = { ...options, infiniteReset: this.infiniteReset }
        return new Stream<T>( this.data, alteredOptions )
    }

    toPromise(): Promise<T[]> {
        return this.data
    }

    abstract generator( args: K ): Promise<T[]>

    abstract infiniteReset( data: T[], lenght: number ): T[]
}
