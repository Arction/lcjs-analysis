import { DataGenerator } from '../data-generator'

export interface Position {
    x: number,
    y: number
}

export interface ProgressiveRandomDataGeneratorProps {
    numberOfPoints?: number,
    randomStep?: number,
    step?: number
}

export class ProgressiveRandomDataGenerator extends DataGenerator<Position, ProgressiveRandomDataGeneratorProps> {
    constructor( args: ProgressiveRandomDataGeneratorProps ) {
        super( args )
    }

    generator( args: ProgressiveRandomDataGeneratorProps ) {
        const data: Position[] = []
        const numberOfPoints = args.numberOfPoints || 10000
        const randomStep = args.randomStep || 250
        const step = args.step || 1
        let random = Math.random()
        let curStep = step
        for ( let i = 0; i < numberOfPoints; i++ ) {
            if ( i % randomStep === 0 )
                random = Math.random()
            data.push( {
                x: curStep - ( Math.random() % curStep ) / 2,
                y: ( Math.random() + random ) / 2
            } )
            curStep += step
        }
        return Promise.resolve( data )
    }
}
