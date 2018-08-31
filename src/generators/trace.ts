import { DataGenerator } from '../dataGenerator'
import { Point } from '../dataHost'
import { ProgressiveTraceProps } from './progressiveTrace'
import { DataHost } from '../dataHost'

export interface TraceProps extends ProgressiveTraceProps {
    xStep?: number
}

export class Trace extends DataGenerator<Point, TraceProps> {
    constructor( args?: TraceProps ) {
        super( args )
    }

    generator( args: TraceProps ) {
        const genData: Point[] = []
        const numberOfPoints = args.numberOfPoints || 10000
        const yStep = args.yStep || 1
        const xStep = args.xStep || 1

        let previous = { x: 0, y: 0 }
        for ( let i = 0; i < numberOfPoints; i++ ) {
            const point = {
                x: previous.x + Math.random() * xStep - 0.5,
                y: previous.y + Math.random() * yStep - 0.5
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
