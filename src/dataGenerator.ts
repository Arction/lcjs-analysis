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
    constructor( args: K ) {
        this.options = args
    }

    /**
     * Generate new instance of DataHost with unique data.
     * Data is added to the DataHost asynchronously.
     */
    generate(): DataHost<T> {
        const dataHost = new DataHost<T>( this.infiniteReset, {
            interval: 500,
            batchSize: 10,
            repeat: false
        } )
        const points = this.getPointCount()
        const nextChunk = this.generateChunks.bind( this, 0, points, dataHost )
        setTimeout( nextChunk, 0 )
        return dataHost
    }

    /**
     * Generate the random data in chunks that can take x ms per chunk.
     * @param baseIndex The current index for the generator.
     * @param total How many data points to generate.
     * @param dataHost The data host to push the data to.
     */
    private generateChunks( baseIndex: number, total: number, dataHost: DataHost<T> ) {
        let lastPoint = {} as T
        const startTime = Date.now()
        // Generate data until elapsed time is more than 15 ms or we have generated enough data.
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
     * Used to create the random data for the data host.
     * @param args Generator arguments
     */
    abstract generator( index: number, lastPoint: T ): T

    /**
     * Handles resetting the data when used as infinite stream of data.
     * Used to recalculate the point when it is moved to end of stream.
     * @param dataToReset Data to reset
     * @param data All of the data
     */
    abstract infiniteReset( dataToReset: T, data: ReadonlyArray<T> ): T
}
