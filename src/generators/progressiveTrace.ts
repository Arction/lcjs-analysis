import { DataGenerator, Point } from '../data-generator'

export interface ProgressiveTraceProps {
    numberOfPoints?: number,
    xStep?: number,
    yStep?: number
}

export class ProgressiveTrace extends DataGenerator<Point, ProgressiveTraceProps> {
    constructor( args: ProgressiveTraceProps ) {
        super( args )
    }

    generator( args: ProgressiveTraceProps ) {
        const genData: Point[] = []
        const numberOfPoints = args.numberOfPoints || 10000
        const xStep = args.xStep || 1
        const yStep = args.yStep || 1

        for ( let i = 0; i < numberOfPoints; i++ ) {
            genData.push( {
                x: i * xStep,
                y: Math.random() * yStep
            } )
        }
        return Promise.resolve( genData )
    }

    infiniteReset( data: Point[], length: number ) {
        const step = this.options.xStep || 1
        return data.map( val => ( { x: val.x + step * length, y: val.y } ) )
    }
}
