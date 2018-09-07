import { DataHost } from './dataHost'

/**
 * Abstract base class for all data generators.
 * Defines a generate function that is used to create new instances of data host.
 */
export abstract class DataGenerator<T, K> {
    /**
     * Generator options
     */
    protected options: Readonly<K>
    constructor( args?: K ) {
        this.options = args || {} as K
    }

    /**
     * Generate new instance of DataHost with unique data
     */
    generate(): DataHost<T> {
        const dataHost = new DataHost<T>( this.infiniteReset )
        const points = this.getPointCount()
        this.generateChunks( 0, points, dataHost )
        return dataHost
    }

    private generateChunks( baseIndex: number, total: number, dataHost: DataHost<T> ) {
        let lastPoint = {} as T
        const startTime = Date.now()
        for ( let i = 0; Date.now() - startTime < 15 && baseIndex < total; i++ ) {
            baseIndex++;
            lastPoint = this.generator( baseIndex, lastPoint )
            dataHost.push( lastPoint )
        }
        if ( baseIndex < total ) {
            const nextChunk = this.generateChunks.bind( this, baseIndex, total, dataHost )
            setTimeout( nextChunk, 0 )
        } else {
            dataHost.freeze()
        }
    }

    /**
     * Abstract function to return how many points the generator should generate.
     */
    abstract getPointCount(): number

    /**
     * Abstract function for all generators to override.
     * Used to create the random data for the data host
     * @param args Generator arguments
     */
    abstract generator( index: number, lastPoint: T ): T

    /**
     * Handles resetting the data when used as infinite stream of data.
     * Used to recalculate the point when it is moved to end of stream.
     * @param dataToReset Data to reset
     * @param data All of the data
     */
    abstract infiniteReset( dataToReset: T, data: T[] ): T
}
