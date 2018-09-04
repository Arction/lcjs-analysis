import { DataGenerator } from '../dataGenerator'
import { Point, DataHost } from '../dataHost'

export interface ProgressiveFunctionOptions {
    samplingFunction?: ( x: number ) => number,
    sampleCount?: number,
    minX?: number,
    maxX?: number
}

/**
 * A progressive function data generator.
 * Generates point data that has progressive X axis and the value for Y axis is created from the user given function.
 */
export class ProgressiveFunctionGenerator extends DataGenerator<Point, ProgressiveFunctionOptions> {
    constructor( args?: ProgressiveFunctionOptions ) {
        super( args )
    }

    /**
     * Returns a new Progressive function generator with the new sampling function.
     * @param handler A function that is sampled to generate the data.
     */
    setSamplingFunction( handler: ( x: number ) => number ) {
        return new ProgressiveFunctionGenerator( this.options ?
            { ...this.options, samplingFunction: handler }
            :
            { samplingFunction: handler } )
    }

    /**
     * Returns a new Progressive function generator with the new sample count.
     * @param sampleCount How many samples to take from the function.
     */
    setSampleCount( sampleCount: number ) {
        return new ProgressiveFunctionGenerator( this.options ?
            { ...this.options, sampleCount }
            :
            { sampleCount } )
    }

    /**
     * Returns a new Progressive function generator with the new minX.
     * @param minX Starting X value for the sampling.
     */
    setMinX( minX: number ) {
        return new ProgressiveFunctionGenerator( this.options ? { ...this.options, minX } : { minX } )
    }

    /**
     * Returns a new Progressive function generator with the new maxX.
     * @param maxX The value of X that is the last point sampled.
     */
    setMaxX( maxX: number ) {
        return new ProgressiveFunctionGenerator( this.options ? { ...this.options, maxX } : { maxX } )
    }

    generator( args: ProgressiveFunctionOptions ) {
        const genData: Point[] = []
        let sampler
        if ( typeof args.samplingFunction !== 'function' ) {
            sampler = ( X: number ) => Math.pow( X, 2 )
        } else {
            sampler = args.samplingFunction
        }
        const sampleCount = typeof args.sampleCount === 'number' ? args.sampleCount : 1
        const minX = typeof args.minX === 'number' ? args.minX : 0
        const maxX = typeof args.maxX === 'number' ? args.maxX : 100
        const nPoints = sampleCount - 1
        const step = ( maxX - minX ) / ( nPoints )
        let x = minX
        for ( let i = 0; i <= nPoints; i++ ) {
            const point = {
                x,
                y: sampler( x )
            }
            x = x + step
            if ( x > maxX ) {
                x = maxX
            }
            genData.push( point )
        }
        return new DataHost<Point>( Promise.resolve( genData ), this.infiniteReset )
    }

    infiniteReset( dataToReset: Point, data: Point[] ): Point {
        return { x: dataToReset.x + data.length, y: dataToReset.y }
    }
}
