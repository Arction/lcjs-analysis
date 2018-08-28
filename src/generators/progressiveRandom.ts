import { DataGenerator, Point } from '../data-generator'

export interface ProgressiveRandomDataGeneratorProps {
    numberOfPoints?: number,
    randomStep?: number,
    step?: number
}

export class ProgressiveRandom extends DataGenerator<Point, ProgressiveRandomDataGeneratorProps> {
    constructor( args: ProgressiveRandomDataGeneratorProps ) {
        super( args )
    }

    generator( args: ProgressiveRandomDataGeneratorProps ) {
        const data: Point[] = []
        const numberOfPoints = args.numberOfPoints || 10000
        const randomStep = args.randomStep || 250
        const step = args.step || 1
        let random = Math.random()
        let curStep = step
        for ( let i = 0; i < numberOfPoints; i++ ) {
            if ( i % randomStep === 0 )
                random = Math.random()
            data.push( {
                x: curStep - ( Math.random() + random ) / 2,
                y: ( Math.random() + random ) / 2
            } )
            curStep += step
        }
        return Promise.resolve( data )
    }

    infiniteReset( values: Point[], length: number ) {
        const step = this.options.step || 1
        return values.map( val => ( { x: val.x + step * length, y: val.y } ) )
    }
}
