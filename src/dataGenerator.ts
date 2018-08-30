import { DataHost } from './dataHost'

/**
 * Abstract base class for all data generators.
 * Defines a generate function that is used to create new instances of data host.
 */
export abstract class DataGenerator<T, K> {
    /**
     * Generator options
     */
    protected readonly options: K
    constructor( args: K ) {
        this.options = args
    }

    /**
     * Generate new instance of DataHost with unique data
     */
    generate(): Promise<DataHost<T>> {
        return this.generator( this.options )
    }

    /**
     * Abstract function for all generators to override.
     * Used to create the random data for the data host
     * @param args Generator arguments
     */
    abstract generator( args: K ): Promise<DataHost<T>>
}
