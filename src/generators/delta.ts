import { DataGenerator, CommonGeneratorOptions } from '../dataGenerator'
import { Point, DataHost } from '../dataHost'

export interface DeltaFunctionOptions extends CommonGeneratorOptions {
    minGap?: number,
    maxGap?: number,
    minAmplitude?: number,
    maxAmplitude?: number,
    probability?: number
}

export class DeltaFunctionGenerator extends DataGenerator<Point, DeltaFunctionOptions> {
    constructor( args?: DeltaFunctionOptions ) {
        super( args )
    }

    /**
     * Returns a new Data generator with the new numberOfPoints.
     * @param numberOfPoints How many points of data to generate
     */
    setNumberOfPoints( numberOfPoints: number ) {
        return new DeltaFunctionGenerator( this.options ? { ...this.options, numberOfPoints } : { numberOfPoints } )
    }

    generator( args: DeltaFunctionOptions ) {
        const genData: Point[] = []
        const numberOfPoints = args.numberOfPoints || 10000
        const minAmplitude = args.minAmplitude !== undefined ? Math.min( Math.max( args.minAmplitude, 0 ), 1 ) : 0.3
        const maxAmplitude = args.maxAmplitude !== undefined ? Math.max( Math.min( args.maxAmplitude, 1 ), 0 ) : 1
        const minGap = args.minGap !== undefined ? args.minGap : -1
        const maxGap = args.maxGap !== undefined ? args.maxGap : -1
        const probability = args.probability !== undefined ? args.probability : 0.02

        let lastSpike = 0
        for ( let i = 0; i < numberOfPoints; i++ ) {
            const sinceLast = i - lastSpike
            const value = { x: i, y: 0 }
            if ( sinceLast > minGap || minGap === -1 ) {
                if ( sinceLast < maxGap || maxGap === -1 ) {
                    const doSpike = Math.random() > ( 1 - probability )
                    if ( doSpike ) {
                        value.y = Math.random() * ( maxAmplitude - minAmplitude ) + minAmplitude
                        lastSpike = i
                    }
                } else if ( sinceLast >= maxGap ) {
                    value.y = Math.random() * ( maxAmplitude - minAmplitude ) + minAmplitude
                    lastSpike = i
                }
            }
            genData.push( value )
        }
        return new DataHost<Point>( Promise.resolve( genData ), this.infiniteReset )
    }

    infiniteReset( dataToReset: Point, data: Point[] ): Point {
        return { x: dataToReset.x + data.length, y: dataToReset.y }
    }
}
