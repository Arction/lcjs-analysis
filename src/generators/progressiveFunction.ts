import { DataGenerator } from '../dataGenerator'
import { Point, DataHost } from '../dataHost'

/**
 * Options for progressive function generator.
 */
export interface ProgressiveFunctionOptions {
    /**
     * A function that is sampled to generate the data.
     */
    samplingFunction: ( x: number ) => number,
    /**
     * How many samples to take.
     */
    sampleCount: number,
    /**
     * The minimum X value that the function is sampled with.
     */
    minX: number,
    /**
     * The maximum X value that the function is sampled with.
     */
    maxX: number
}

/**
 * Create a new Progressive Function generator with default values.
 * The generator samples a given function x times between given X range.
 */
export function createProgressiveFunctionGenerator() {
    return new ProgressiveFunctionGenerator( {
        samplingFunction: ( x ) => x * x,
        sampleCount: 100,
        minX: 0,
        maxX: 100
    } )
}

/**
 * A progressive function data generator.
 * Generates point data that has progressive X axis and the value for Y axis is created from the user given function.
 */
class ProgressiveFunctionGenerator extends DataGenerator<Point, ProgressiveFunctionOptions> {
    private readonly numberOfPoints: number
    private readonly step: number
    private x = this.options.minX
    constructor( args: ProgressiveFunctionOptions ) {
        super( args )

        const opts = {
            samplingFunction: args.samplingFunction,
            sampleCount: args.sampleCount,
            minX: args.minX,
            maxX: args.maxX
        }

        this.numberOfPoints = opts.sampleCount - 1
        this.step = ( opts.maxX - opts.minX ) / this.numberOfPoints

        this.options = Object.freeze( opts )
    }

    /**
     * Returns a new Progressive function generator with the new sampling function.
     * @param handler A function that is sampled to generate the data.
     */
    setSamplingFunction( handler: ( x: number ) => number ) {
        return new ProgressiveFunctionGenerator( { ...this.options, samplingFunction: handler } )
    }

    /**
     * Returns a new Progressive function generator with the new sample count.
     * @param sampleCount How many samples to take from the function.
     */
    setSampleCount( sampleCount: number ) {
        return new ProgressiveFunctionGenerator( { ...this.options, sampleCount } )
    }

    /**
     * Returns a new Progressive function generator with the new minX.
     * @param minX Starting X value for the sampling.
     */
    setMinX( minX: number ) {
        return new ProgressiveFunctionGenerator( { ...this.options, minX } )
    }

    /**
     * Returns a new Progressive function generator with the new maxX.
     * @param maxX The value of X that is the last point sampled.
     */
    setMaxX( maxX: number ) {
        return new ProgressiveFunctionGenerator( { ...this.options, maxX } )
    }

    /**
     * Returns how many points of data the generator should generate.
     */
    getPointCount() {
        return this.numberOfPoints
    }

    generator() {
        const point = {
            x: this.x,
            y: this.options.samplingFunction( this.x )
        }
        this.x = this.x + this.step
        if ( this.x > this.options.maxX ) {
            this.x = this.options.maxX
        }
        return point
    }

    infiniteReset( dataToReset: Point, data: Point[] ): Point {
        return { x: dataToReset.x + data.length, y: dataToReset.y }
    }
}
