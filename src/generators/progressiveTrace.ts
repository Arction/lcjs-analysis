import { DataGenerator } from '../dataGenerator'
import { Point, PointDataHost } from '../dataHost'

export interface ProgressiveTraceProps {
    numberOfPoints?: number,
    yStep?: number
}

export class ProgressiveTrace extends DataGenerator<Point, ProgressiveTraceProps> {
    constructor( args: ProgressiveTraceProps ) {
        super( args )
    }

    generator( args: ProgressiveTraceProps ) {
        const genData: Point[] = []
        const numberOfPoints = args.numberOfPoints || 10000
        const yStep = args.yStep || 1

        let previous = { x: 0, y: 0 }
        for ( let i = 0; i < numberOfPoints; i++ ) {
            const point = {
                x: i,
                y: previous.y + Math.random() * yStep - 0.5
            }
            genData.push( point )
            previous = point
        }
        return Promise.resolve( new PointDataHost( genData ) )
    }
}
