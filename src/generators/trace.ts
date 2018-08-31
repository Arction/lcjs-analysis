import { DataGenerator, CommonGeneratorOptions } from '../dataGenerator'
import { Point } from '../dataHost'
import { DataHost } from '../dataHost'

export class Trace extends DataGenerator<Point, CommonGeneratorOptions> {
    constructor( args?: CommonGeneratorOptions ) {
        super( args )
    }

    generator( args: CommonGeneratorOptions ) {
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
        return Promise.resolve( new DataHost<Point>( genData, this.infiniteReset ) )
    }

    infiniteReset( dataToReset: Point, data: Point[] ): Point {
        return { x: dataToReset.x + data[data.length - 1].x, y: dataToReset.y + data[data.length - 1].y }
    }
}
