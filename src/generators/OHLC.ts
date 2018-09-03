import { DataGenerator, CommonGeneratorOptions } from '../dataGenerator'
import { OHLCData } from '../dataHost'
import { DataHost } from '../dataHost'

/**
 * Options for the OHLC data generator
 */
export interface OHLCGeneratorOptions extends CommonGeneratorOptions {
    /**
     * Timestamp of the first data point.
     */
    startTimestamp?: number,
    /**
     * How long time there is between two timestamps.
     */
    dataFreq?: number,
    /**
     * What is the value the data generation should start at.
     */
    start?: number,
    /**
     * How much the data can change.
     */
    volatility?: number
}

export class OHLCGenerator extends DataGenerator<OHLCData, OHLCGeneratorOptions> {
    constructor( args?: OHLCGeneratorOptions ) {
        super( args )
    }

    /**
     * Returns a new Data generator with the new numberOfPoints.
     * @param numberOfPoints How many points of data to generate
     */
    setNumberOfPoints( numberOfPoints: number ) {
        return new OHLCGenerator( this.options ? { ...this.options, numberOfPoints } : { numberOfPoints } )
    }

    /**
     * Returns a new Data generator with the new time stamp to start generating the data.
     * @param startTimestamp The timestamp for the first data point.
     */
    setStartTimestamp( startTimestamp?: number ) {
        return new OHLCGenerator( this.options ? { ...this.options, startTimestamp } : { startTimestamp } )
    }

    /**
     * Returns a new Data generator with the new data frequency.
     * @param dataFreq How long the time between two timestamps is.
     */
    setDataFrequency( dataFreq?: number ) {
        return new OHLCGenerator( this.options ? { ...this.options, dataFreq } : { dataFreq } )
    }

    /**
     * Returns a new Data generator with the new starting value.
     * @param start What is the value the data generation should start from.
     */
    setStart( start?: number ) {
        return new OHLCGenerator( this.options ? { ...this.options, start } : { start } )
    }

    /**
     * Returns a new Data generator with the new volatility.
     * @param volatility How volatile the data is. How much the data changes between data points.
     */
    setVolatility( volatility?: number ) {
        return new OHLCGenerator( this.options ? { ...this.options, volatility } : { volatility } )
    }

    generator( args: OHLCGeneratorOptions ) {
        const genData: OHLCData[] = []
        const numberOfPoints = args.numberOfPoints || 60
        const startTimeStamp = args.startTimestamp !== undefined ? args.startTimestamp : 0
        const dataFreq = args.dataFreq || 1
        const volatility = args.volatility || 0.1
        const start = args.start || 10

        let prevPoint = [startTimeStamp, start, start, start, start]
        for ( let i = 0; i < numberOfPoints; i++ ) {
            let dataPoint: OHLCData = [0, 0, 0, 0, 0]
            const timeStamp = ( startTimeStamp + dataFreq * i )

            const dir = Math.random() > 0.5 ? 1 : -1
            let newPoints = Array.from( Array( 4 ) ).map( v => {
                let change = Math.random() * volatility * dir
                if ( prevPoint[4] + change < 0 ) {
                    change = change * -1
                }
                return prevPoint[4] + change
            } ).sort()
            if ( dir < 0 ) {
                newPoints = [newPoints[0], newPoints[2], newPoints[1], newPoints[3]]
            }
            dataPoint = [timeStamp, newPoints[1], newPoints[3], newPoints[0], newPoints[2]]
            prevPoint = dataPoint
            genData.push( dataPoint )
        }

        return new DataHost<OHLCData>( Promise.resolve( genData ), this.infiniteReset )
    }

    infiniteReset( dataToReset: OHLCData, data: OHLCData[] ): OHLCData {
        // base + end-base + point1-point0
        const newPoint = <OHLCData>[
            dataToReset[0] + data.length * ( data[data.length - 1][0] - data[data.length - 2][0] ),
            dataToReset[1],
            dataToReset[2],
            dataToReset[3],
            dataToReset[4]
        ]
        return newPoint
    }
}
