import { Stream, StreamOptions } from './stream'

export abstract class DataGenerator<T, K> {
    protected readonly data: Promise<T[]>

    constructor( args: K ) {
        this.data = this.generator( args || {} )
    }

    toStream( options?: StreamOptions<T> ): Stream<T> {
        return new Stream<T>( this.data, options || {} )
    }

    toPromise(): Promise<T[]> {
        return this.data
    }

    abstract generator( args: K ): Promise<T[]>
}
