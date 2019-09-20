import { XOHLC, Point, AreaPoint } from 'datastructures'

// Computation algorithms for different trading data analysis visualizations.
/**
 * Calculate SMA values from XOHLC 'close' values.
 * @param   xohlcValues             Array of XOHLC values.
 * @param   averagingFrameLength    Length of averaging frame.
 * @return                          Array of SMA values. Length of this array will be xohlcValues.length - averagingFrameLength + 1
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

/**
 * Calculate EMA values from XOHLC 'close' values.
 * @param   xohlcValues             Array of XOHLC values.
 * @param   averagingFrameLength    Length of averaging frame.
 * @return                          Array of EMA values.  Length of this array is equal to xohlcValues.length - averagingFrameLength + 1
 */
export const exponentialMovingAverage = ( xohlcValues: XOHLC[], averagingFrameLength: number ): Point[] => {
    const len = xohlcValues.length
    const result: Point[] = []
    const weighingMultiplier = 2 / ( averagingFrameLength + 1 )

    // Calculate initial previous EMA using SMA method.
    let i
    let previousEMASum = 0
    for ( i = 0; i < averagingFrameLength; i++ ) {
        const xohlc = xohlcValues[i]
        // Use 'close' value for SMA.
        const value = xohlc[4]
        previousEMASum += value
    }
    let previousEMA: number = previousEMASum / averagingFrameLength
    for ( ; i < len; i++ ) {
        const xohlc = xohlcValues[i]
        // Use 'close' value for EMA.
        const value = xohlc[4]
        // Compute current EMA value.
        const ema = value * weighingMultiplier + ( previousEMA !== undefined ? previousEMA * ( 1 - weighingMultiplier ) : 0 )
        if ( i >= averagingFrameLength - 1 ) {
            result.push( { x: xohlc[0], y: ema } )
        }
        previousEMA = ema
    }
    return result
}
/**
 * Calculate standard deviation for a set of values.
 * @param   values                  Array of values.
 * @return                          Standard deviation value.
 */
export const standardDeviation = ( values: number[] ): number => {
    const len = values.length
    // Calculate average.
    let sum = 0
    for ( let i = 0; i < len; i++ ) {
        sum += values[i]
    }
    const avg = sum / len
    //
    let sumSqDiff = 0
    for ( let i = 0; i < len; i++ ) {
        const value = values[i]
        sumSqDiff += ( value - avg ) * ( value - avg )
    }
    return Math.sqrt( sumSqDiff / len )
}
/**
 * Calculate bollinger bands values from XOHLC values.
 * Uses "typical prices" (average of close + low + high).
 * @param   xohlcValues             Array of XOHLC values.
 * @param   averagingFrameLength    Length of averaging frame.
 * @return                          Points of Bollinger bands (X + 2 Y values)
 */
export const bollingerBands = ( xohlcValues: XOHLC[], averagingFrameLength: number ): AreaPoint[] => {
    const len = xohlcValues.length
    // Compute simple moving average.
    const smaValues = simpleMovingAverage( xohlcValues, averagingFrameLength )
    // Map 'xohlcValues' into "typical prices" (Close + Low + High) / 3.
    const typicalPrices: number[] = []
    for ( let i = 0; i < len; i++ ) {
        const xohlc = xohlcValues[i]
        typicalPrices[i] = ( xohlc[4] + xohlc[3] + xohlc[2] ) / 3
    }
    // Compute Bollinger bands (two y values per one X value).
    const bollingerBands: AreaPoint[] = []
    for ( let i = averagingFrameLength - 1; i < len; i++ ) {
        // Compute standard deviation over previous 'averagingFrameLength' typical prices.
        const valuesForSD = typicalPrices.slice( i - ( averagingFrameLength - 1 ), i + 1 )
        const standardDeviation2 = 2 * standardDeviation( valuesForSD )
        // Add + and - deviation from SMA.
        const sma = smaValues[i - ( averagingFrameLength - 1 )]
        bollingerBands.push( {
            position: sma.x,
            high: sma.y + standardDeviation2,
            low: sma.y - standardDeviation2
        } )
    }
    return bollingerBands
}
/**
 * Calculate RSI values from XOHLC 'close' values.
 * @param   xohlcValues             Array of XOHLC values.
 * @param   averagingFrameLength    Length of averaging frame.
 * @return                          Relative Strength Index values.
 *                                  Length of this array is equal to xohlcValues.length - averagingFrameLength
 */
export const relativeStrengthIndex = ( xohlcValues: XOHLC[], averagingFrameLength: number ): Point[] => {
    // Based on http://cns.bu.edu/~gsc/CN710/fincast/Technical%20_indicators/Relative%20Strength%20Index%20(RSI).htm
    const len = xohlcValues.length
    if ( len < averagingFrameLength )
        return []

    const result: Point[] = []
    const gains: number[] = []
    const losses: number[] = []
    let prevValue: number | undefined
    for ( let i = 0; i < len; i++ ) {
        // Use close value for RSI.
        const value = xohlcValues[i][4]
        if ( prevValue !== undefined ) {
            const diff = value - prevValue
            if ( diff > 0 ) {
                gains[i] = diff
                losses[i] = 0
            } else {
                losses[i] = -diff   // Use positive value
                gains[i] = 0
            }
        }
        //don't put anything to up and dn first item. It's not used 
        prevValue = value
    }
    // Add first RSI value.
    const sum = ( prev: number, cur: number ) => prev + cur
    let prevAvgGain = gains
        .slice( 0, averagingFrameLength + 1 )
        .reduce( sum, 0 )
        / averagingFrameLength
    let prevAvgLoss = losses
        .slice( 0, averagingFrameLength + 1 )
        .reduce( sum, 0 )
        / averagingFrameLength
    const firstRS = prevAvgGain / prevAvgLoss
    const firstRSI = 100 - ( 100 / ( 1 + firstRS ) )
    result.push( { x: xohlcValues[averagingFrameLength][0], y: firstRSI } )
    // Add rest of RSI values as smoothed.
    for ( let i = averagingFrameLength + 1; i < len; i++ ) {
        const avgGain = ( prevAvgGain * ( averagingFrameLength - 1 ) + gains[i] ) / averagingFrameLength
        const avgLoss = ( prevAvgLoss * ( averagingFrameLength - 1 ) + losses[i] ) / averagingFrameLength
        const smoothedRS =
            ( prevAvgGain * ( averagingFrameLength - 1 ) + gains[i] ) /
            ( prevAvgLoss * ( averagingFrameLength - 1 ) + losses[i] )
        const RSI = 100 - ( 100 / ( 1 + smoothedRS ) )
        result.push( { x: xohlcValues[i][0], y: RSI } )

        prevAvgGain = avgGain
        prevAvgLoss = avgLoss
    }
    return result
}