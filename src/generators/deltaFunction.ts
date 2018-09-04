import { DataGenerator, CommonGeneratorOptions } from '../dataGenerator'
import { Point, DataHost } from '../dataHost'

/**
 * Options for the Delta function generator.
 */
export interface DeltaFunctionOptions extends CommonGeneratorOptions {
    /**
     * How many points there has to be between spikes.
     */
    minGap?: number,
    /**
     * How many points there can be between spikes.
     */
    maxGap?: number,
    /**
     * The minium spike height.
     */
    minAmplitude?: number,
    /**
     * The maximum spike height.
     */
    maxAmplitude?: number,
    /**
     * The probability of a spike to generate on each step.
     */
    probability?: number
}

/**
 * A Delta function generator.
 * Generates random spikes in otherwise flat data. Generated data is between 0 and 1.
 */
export class DeltaFunctionGenerator extends DataGenerator<Point, DeltaFunctionOptions> {
    constructor( args?: DeltaFunctionOptions ) {
        super( args )
    }

    /**
     * Returns a new Data generator with the new numberOfPoints.
     * @param numberOfPoints How many points of data to generate.
     */
    setNumberOfPoints( numberOfPoints: number ) {
        return new DeltaFunctionGenerator( this.options ? { ...this.options, numberOfPoints } : { numberOfPoints } )
    }

    /**
     * Returns a new Data generator with the new minGap.
     * @param minGap How many points there has to be between spikes.
     */
    setMinGap( minGap: number ) {
        return new DeltaFunctionGenerator( this.options ? { ...this.options, minGap } : { minGap } )
    }

    /**
     * Returns a new Data generator with the new maxGap.
     * @param maxGap How many points there can be between spikes.
     */
    setMaxGap( maxGap: number ) {
        return new DeltaFunctionGenerator( this.options ? { ...this.options, maxGap } : { maxGap } )
    }

    /**
     * Returns a new Data generator with the new minAmplitude.
     * @param minAmplitude The minium spike height.
     */
    setMinAmplitude( minAmplitude: number ) {
        return new DeltaFunctionGenerator( this.options ? { ...this.options, minAmplitude } : { minAmplitude } )
    }

    /**
     * Returns a new Data generator with the new maxAmplitude.
     * @param maxAmplitude The maximum spike height.
     */
    setMaxAmplitude( maxAmplitude: number ) {
        return new DeltaFunctionGenerator( this.options ? { ...this.options, maxAmplitude } : { maxAmplitude } )
    }

    /**
     * Returns a new Data generator with the new probability.
     * @param probability The probability of a spike to generate on each step.
     */
    setProbability( probability: number ) {
        return new DeltaFunctionGenerator( this.options ? { ...this.options, probability } : { probability } )
    }

    generator( args: DeltaFunctionOptions ) {
        const genData: Point[] = []
        const numberOfPoints = args.numberOfPoints || 10000
        const minAmplitude = args.minAmplitude !== undefined ? Math.min( Math.max( args.minAmplitude, 0 ), 1 ) : 0.3
        const maxAmplitude = args.maxAmplitude !== undefined ? Math.max( Math.min( args.maxAmplitude, 1 ), 0 ) : 1
        const minGap = args.minGap !== undefined ? args.minGap : -1
        const maxGap = args.maxGap !== undefined ? args.maxGap : -1
        const probability = args.probability !== undefined ? args.probability : 0.02

        let lastSpike = 0
        for ( let i = 0; i < numberOfPoints; i++ ) {
            const sinceLast = i - lastSpike
            const value = { x: i, y: 0 }
            if ( sinceLast > minGap || minGap === -1 ) {
                if ( sinceLast < maxGap || maxGap === -1 ) {
                    // Create random spike randomly.
                    const doSpike = Math.random() > ( 1 - probability )
                    if ( doSpike ) {
                        value.y = Math.random() * ( maxAmplitude - minAmplitude ) + minAmplitude
                        lastSpike = i
                    }
                } else if ( sinceLast >= maxGap ) {
                    // Always create a spike if we are above the max gap.
                    value.y = Math.random() * ( maxAmplitude - minAmplitude ) + minAmplitude
                    lastSpike = i
                }
            }
            genData.push( value )
        }
        return new DataHost<Point>( Promise.resolve( genData ), this.infiniteReset )
    }

    infiniteReset( dataToReset: Point, data: Point[] ): Point {
        return { x: dataToReset.x + data.length, y: dataToReset.y }
    }
}
