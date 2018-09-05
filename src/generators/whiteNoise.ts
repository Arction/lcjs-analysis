import { DataGenerator } from '../dataGenerator'
import { Point } from '../dataHost'
import { DataHost } from '../dataHost'

/**
 * Options for White noise generator.
 */
export interface WhiteNoiseGeneratorOptions {
    /**
     * How many points of data to generate.
     */
    numberOfPoints?: number
}

/**
 * A white noise data generator.
 * Generates white noise.
 */
export class WhiteNoiseGenerator extends DataGenerator<Point, WhiteNoiseGeneratorOptions> {
    constructor( args?: WhiteNoiseGeneratorOptions ) {
        super( args )
    }

    /**
     * Returns a new Data generator with the new numberOfPoints.
     * @param numberOfPoints How many points of data to generate
     */
    setNumberOfPoints( numberOfPoints: number ) {
        return new WhiteNoiseGenerator( this.options ? { ...this.options, numberOfPoints } : { numberOfPoints } )
    }

    generator( args: WhiteNoiseGeneratorOptions ) {
        const genData: Point[] = []
        const numberOfPoints = args.numberOfPoints || 10000

        for ( let i = 0; i < numberOfPoints; i++ ) {
            const point = {
                x: i,
                y: ( Math.random() - 0.5 ) * 2
            }
            genData.push( point )
        }
        return new DataHost<Point>( Promise.resolve( genData ), this.infiniteReset )
    }

    infiniteReset( dataToReset: Point, data: Point[] ): Point {
        return { x: dataToReset.x + data[data.length - 1].x, y: dataToReset.y + data[data.length - 1].y }
    }
}
