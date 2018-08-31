import { DataGenerator, CommonGeneratorOptions } from '../dataGenerator'
import { Point, DataHost } from '../dataHost'

export class ProgressiveTrace extends DataGenerator<Point, CommonGeneratorOptions> {
    constructor( args?: CommonGeneratorOptions ) {
        super( args )
    }

    /**
     * Returns a new Data generator with the new numberOfPoints.
     * @param numberOfPoints How many points of data to generate
     */
    setNumberOfPoints( numberOfPoints: number ) {
        return new ProgressiveTrace( this.options ? { ...this.options, numberOfPoints } : { numberOfPoints } )
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
        return Promise.resolve( new DataHost<Point>( genData, this.infiniteReset ) )
    }

    infiniteReset( dataToReset: Point, data: Point[] ): Point {
        return { x: dataToReset.x + data.length, y: dataToReset.y }
    }
}
