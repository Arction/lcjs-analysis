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

    setSamplingFunction( handler: ( x: number ) => number ) {
        return new ProgressiveFunctionGenerator( this.options ?
            { ...this.options, samplingFunction: handler }
            :
            { samplingFunction: handler } )
    }

    setSamplingCount( sampleCount: number ) {
        return new ProgressiveFunctionGenerator( this.options ?
            { ...this.options, sampleCount }
            :
            { sampleCount } )
    }

    setMinX( minX: number ) {
        return new ProgressiveFunctionGenerator( this.options ? { ...this.options, minX } : { minX } )
    }

    setMaxX( maxX: number ) {
        return new ProgressiveFunctionGenerator( this.options ? { ...this.options, maxX } : { maxX } )
    }

    generator( args: ProgressiveFunctionOptions ) {
        const genData: Point[] = []
        if ( typeof args.samplingFunction !== 'function' ) {
            throw new Error( 'A sampling function is required' )
        }
        const sampler = args.samplingFunction
        const sampleCount = typeof args.sampleCount === 'number' ? args.sampleCount : 1
        const minX = typeof args.minX === 'number' ? args.minX : 0
        const maxX = typeof args.maxX === 'number' ? args.maxX : 100
        const step = ( maxX - minX ) / ( sampleCount - 1 )

        let x = minX
        for ( let i = 0; i <= sampleCount; i++ ) {
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
