import { DataGenerator, CommonGeneratorOptions } from '../dataGenerator'
import { Point, DataHost } from '../dataHost'

/**
 * A progressive trace data generator.
 * Generates point data that has progressive X axis. The data is always derived from the previous point.
 */
export class ProgressiveTraceGenerator extends DataGenerator<Point, CommonGeneratorOptions> {
    constructor( args?: CommonGeneratorOptions ) {
        super( args )
    }

    /**
     * Returns a new Data generator with the new numberOfPoints.
     * @param numberOfPoints How many points of data to generate
     */
    setNumberOfPoints( numberOfPoints: number ) {
        return new ProgressiveTraceGenerator( this.options ? { ...this.options, numberOfPoints } : { numberOfPoints } )
    }

    generator( args: CommonGeneratorOptions ) {
        const genData: Point[] = []
        const numberOfPoints = args.numberOfPoints || 10000

        let previous = { x: 0, y: 0 }
        for ( let i = 0; i < numberOfPoints; i++ ) {
            const point = {
                x: i,
                y: previous.y + ( Math.random() - 0.5 ) * 2
            }
            genData.push( point )
            previous = point
        }
        return new DataHost<Point>( Promise.resolve( genData ), this.infiniteReset )
    }

    infiniteReset( dataToReset: Point, data: Point[] ): Point {
        return { x: dataToReset.x + data.length, y: dataToReset.y }
    }
}
