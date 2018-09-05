import { DataGenerator } from '../dataGenerator'
import { DataHost } from '../dataHost'

/**
 * Options for Sampled data generator.
 */
export interface SampledDataGeneratorOptions<T> {
    /**
     * The input data to sample as per the sampling frequency.
     */
    inputData?: T[],
    /**
     * How often to sample the data. (Hz)
     */
    samplingFrequency?: number
}

/**
 * Structure for the sampled point.
 */
export interface SampledPoint<T> {
    /**
     * The timestamp for this data point.
     */
    timestamp: number,
    /**
     * The value from the input array that has been sampled.
     */
    data: T
}

/**
 * A sampled data generator.
 * Samples given data with specific frequency.
 */
export class SampledDataGenerator<T> extends DataGenerator<SampledPoint<T>, SampledDataGeneratorOptions<T>> {
    constructor( args?: SampledDataGeneratorOptions<T> ) {
        super( args )
    }

    /**
     * Returns a new Data generator with new the new array of data as sampling target.
     * @param inputData Array of data to sample.
     */
    setInputData( inputData: T[] ) {
        return new SampledDataGenerator( this.options ? { ...this.options, inputData } : { inputData } )
    }

    /**
     * Returns a new Data generator with the new sampling frequency.
     * @param samplingFrequency Set the frequency that the data is sampled from the input array.
     */
    setSamplingFrequency( samplingFrequency: number ) {
        return new SampledDataGenerator( this.options ? { ...this.options, samplingFrequency } : { samplingFrequency } )
    }

    generator( args: SampledDataGeneratorOptions<T> ) {
        const genData: SampledPoint<T>[] = []
        const inputData = args.inputData || []
        const interval = 1 / ( args.samplingFrequency || 10 )

        for ( let i = 0; i < inputData.length; i++ ) {
            const point: SampledPoint<T> = {
                timestamp: i * interval,
                data: inputData[i]
            }
            genData.push( point )
        }
        return new DataHost<SampledPoint<T>>( Promise.resolve( genData ), this.infiniteReset )
    }

    infiniteReset( dataToReset: SampledPoint<T>, data: SampledPoint<T>[] ): SampledPoint<T> {
        return dataToReset
    }
}
