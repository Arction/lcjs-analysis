import { DataGenerator } from '../dataGenerator'
import { Point } from '../dataHost'
import { DataHost } from '../dataHost'

/**
 * Options for trace generator.
 */
export interface TraceGeneratorOptions {
    /**
     * How many points of data to generate.
     */
    numberOfPoints?: number
}

/**
 * A trace data generator.
 * Generates random points that can go to any direction from the previous point.
 */
export class TraceGenerator extends DataGenerator<Point, TraceGeneratorOptions> {
    constructor( args?: TraceGeneratorOptions ) {
        super( args )
    }

    /**
     * Returns a new Data generator with the new numberOfPoints.
     * @param numberOfPoints How many points of data to generate
     */
    setNumberOfPoints( numberOfPoints: number ) {
        return new TraceGenerator( this.options ? { ...this.options, numberOfPoints } : { numberOfPoints } )
    }

    generator( args: TraceGeneratorOptions ) {
        const genData: Point[] = []
        const numberOfPoints = args.numberOfPoints || 10000

        let previous = { x: 0, y: 0 }
        for ( let i = 0; i < numberOfPoints; i++ ) {
            const point = {
                x: previous.x + ( Math.random() - 0.5 ) * 2,
                y: previous.y + ( Math.random() - 0.5 ) * 2
            }
            genData.push( point )
            previous = point
        }
        return new DataHost<Point>( Promise.resolve( genData ), this.infiniteReset )
    }

    infiniteReset( dataToReset: Point, data: Point[] ): Point {
        return { x: dataToReset.x + data[data.length - 1].x, y: dataToReset.y + data[data.length - 1].y }
    }
}
