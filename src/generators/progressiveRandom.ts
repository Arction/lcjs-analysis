import { DataGenerator, Point } from '../data-generator'

export interface ProgressiveRandomDataGeneratorProps {
    numberOfPoints?: number,
    offsetStep?: number,
    offsetDeltaMax?: number,
    offsetDeltaMin?: number,
    offsetRange?: number
}

export class ProgressiveRandom extends DataGenerator<Point, ProgressiveRandomDataGeneratorProps> {
    constructor( args: ProgressiveRandomDataGeneratorProps ) {
        super( args )
    }

    generator( args: ProgressiveRandomDataGeneratorProps ) {
        const data: Point[] = []
        const points = args.numberOfPoints || 1000
        const offsetStep = args.offsetStep || Math.floor( points / 10 )
        const offsetDeltaMax = args.offsetDeltaMax || 0.9
        const offsetDeltaMin = args.offsetDeltaMin === 0 ? 0 : args.offsetDeltaMin || 0.1
        const offsetRange = args.offsetRange || 0.7

        let offset = 0.5
        for ( let i = 0; i < points; i++ ) {
            if ( i % offsetStep === 0 ) {
                const newOffset = Math.random() * ( offsetDeltaMax - offsetDeltaMin ) + offsetDeltaMin
                offset = Math.random() > 0.5 ? offset + newOffset : offset - newOffset
            }
            if ( offset + offsetRange > 1 ) {
                offset = 1 - offsetRange
            } else if ( offset < 0 ) {
                offset = 0
            }

            data.push( {
                x: i,
                y: offset + Math.random() * offsetRange
            } )
        }

        return Promise.resolve( data )
    }

    infiniteReset( values: Point[], length: number ) {
        return values.map( val => ( { x: val.x + length, y: val.y } ) )
    }
}
