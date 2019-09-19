import { XOHLC, Point } from "datastructures"

// Computation algorithms for different trading data analysis visualizations.
/**
 * Calculate SMA values from XOHLC 'close' values.
 * @param   xohlcValues             Array of XOHLC values.
 * @param   averagingFrameLength    Length of averaging frame.
 * @return                          Array of SMA values. Length of this array is 'averagingFrameLength' - 1 less than 'xohlcValues'
 */
export const simpleMovingAverage = ( xohlcValues: XOHLC[], averagingFrameLength: number ): Point[] => {
    const len = xohlcValues.length
    const result: Point[] = []
    const yValueBuffer: number[] = []
    let sum = 0

    for ( let i = 0; i < len; i++ ) {
        const xohlc = xohlcValues[i]
        // Use 'close' value for SMA.
        const value = xohlc[4]
        sum += value
        if ( i >= averagingFrameLength - 1 ) {
            // Append current average.
            const curAvg = sum / averagingFrameLength
            result.push( { x: xohlc[0], y: curAvg } )
            // Drop oldest points value.
            const droppedValue = yValueBuffer.shift() as number
            sum -= droppedValue
        }
        yValueBuffer.push( value )
    }
    return result
}
