import { DataGenerator } from '../dataGenerator'
import { Point, DataHost } from '../dataHost'

/**
 * Options for the Progressive random data generator.
 */
export interface ProgressiveRandomOptions {
    /**
     * How many points of data to generate.
     * Default: 1000
     */
    numberOfPoints?: number,
    /**
     * How often to change the offset.
     * Default: numberOfPoints / 10
     */
    offsetStep?: number,
    /**
     * Maximum change of the offset during one step.
     * Values higher than max are forced to max.
     * Default: 0.3
     * Max: 1
     */
    offsetDeltaMax?: number,
    /**
     * Minimum change of the offset during one step.
     * Values lower than min are forec to min.
     * Default: 0.05
     * Min: 0
     */
    offsetDeltaMin?: number,
    /**
     * Maximum value for the random data before addding the offset.
     * Values higher than max are forced to max.
     * Default: 0.3
     * Max: 1
     */
    dataMax?: number
}

/**
 * Progressive random data generator.
 */
export class ProgressiveRandom extends DataGenerator<Point, ProgressiveRandomOptions> {
    constructor( args?: ProgressiveRandomOptions ) {
        super( args )
    }

    generator( args: ProgressiveRandomOptions ) {
        const data: Point[] = []

        // Setup defaults
        const points = args.numberOfPoints ? args.numberOfPoints : 1000
        const offsetStep = args.offsetStep ? args.offsetStep === 0 ? 0 : args.offsetStep : Math.floor( points / 10 )
        const offsetDeltaMax = Math.min( args.offsetDeltaMax ? args.offsetDeltaMax : 0.3, 1 )
        const offsetDeltaMin = Math.max( args.offsetDeltaMin ? args.offsetDeltaMin === 0 ? 0 : args.offsetDeltaMin : 0.05, 0 )
        const dataMax = Math.min( args.dataMax ? args.dataMax : 0.3, 1 )

        let offset = 0.5
        for ( let i = 0; i < points; i++ ) {
            if ( i % offsetStep === 0 ) {
                const newOffset = Math.random() * ( offsetDeltaMax - offsetDeltaMin ) + offsetDeltaMin
                offset = Math.random() > 0.5 ? offset + newOffset : offset - newOffset
            }
            // Limit the offset so that data is newer lower than 0 or higher than 1
            if ( offset + dataMax > 1 ) {
                offset = 1 - dataMax
            } else if ( offset < 0 ) {
                offset = 0
            }

            data.push( {
                x: i,
                y: offset + Math.random() * dataMax
            } )
        }

        return Promise.resolve( new DataHost<Point>( data, this.infiniteReset ) )
    }

    infiniteReset( dataToReset: Point, data: Point[] ): Point {
        return { x: dataToReset.x + data.length, y: dataToReset.y }
    }
}
