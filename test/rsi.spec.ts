import { equal, check } from './tools'
import { relativeStrengthIndex } from '../src/trading'
import { XOHLC, Point } from '../src/datastructures'

/**
 * Checks if difference between a and b is less than 0.10.
 */
const numberRoughlyEqual = ( a: number, b: number ) => {
    const rA = Math.round( a * 10 ) / 10
    const rB = Math.round( b * 10 ) / 10
    equal( rA, rB )
}

describe( 'relativeStrengthIndex', () => {
    describe( 'length of result Array', () => {
        it( 'Returns empty Array when xohlcValues.length = 0', () => {
            const xohlcValues: XOHLC[] = []
            const averagingFrameLength = 13
            const result = relativeStrengthIndex( xohlcValues, averagingFrameLength )

            equal( result.length, 0 )
        } )
        it( 'Returns empty Array when xohlcValues.length < averagingFrameLength', () => {
            const xohlcValues: XOHLC[] = new Array( 12 ).fill( [0, 0, 0, 0, 0] )
            const averagingFrameLength = 13
            const result = relativeStrengthIndex( xohlcValues, averagingFrameLength )

            equal( result.length, 0 )
        } )
        it( 'Returns Array with one value when xohlcValues.length = averagingFrameLength + 1', () => {
            const xohlcValues: XOHLC[] = new Array( 14 ).fill( [0, 0, 0, 0, 0] )
            const averagingFrameLength = 13
            const result = relativeStrengthIndex( xohlcValues, averagingFrameLength )

            equal( result.length, 1 )
        } )
        it( 'Returns Array whose length is xohlcValues.length - averagingFrameLength', () => {
            const xohlcValues: XOHLC[] = new Array( 20 ).fill( [0, 0, 0, 0, 0] )
            const averagingFrameLength = 13
            const result = relativeStrengthIndex( xohlcValues, averagingFrameLength )

            equal( result.length, 20 - 13 )
        } )
    } )
    it( 'returns RSI values with same X values as was passed', () => {
        const xohlcValues: XOHLC[] = []
        const averagingFrameLength = 13
        for ( let i = 0; i < averagingFrameLength + 5; i++ )
            xohlcValues[i] = [i, 0, 0, 0, 0]
        const result = relativeStrengthIndex( xohlcValues, averagingFrameLength )

        equal( result.length, 5 )
        for ( let i = 0; i < 5; i++ ) {
            equal( result[i].x, xohlcValues[i + averagingFrameLength][0] )
        }
    } )
    describe( 'returns correct RSI values', () => {
        it( 'test data #1: averagingFrameLength = 14', () => {
            // Based on http://cns.bu.edu/~gsc/CN710/fincast/Technical%20_indicators/Relative%20Strength%20Index%20(RSI).htm
            const xohlcValues: XOHLC[] = [
                // Safe to abstain all other values than 'close'.
                [0, 0, 0, 0, 46.1250],
                [0, 0, 0, 0, 47.1250],
                [0, 0, 0, 0, 46.4375],
                [0, 0, 0, 0, 46.9375],
                [0, 0, 0, 0, 44.9375],
                [0, 0, 0, 0, 44.2500],
                [0, 0, 0, 0, 44.6250],
                [0, 0, 0, 0, 45.7500],
                [0, 0, 0, 0, 47.8125],
                [0, 0, 0, 0, 47.5625],
                [0, 0, 0, 0, 47.0000],
                [0, 0, 0, 0, 44.5625],
                [0, 0, 0, 0, 46.3125],
                [0, 0, 0, 0, 47.6875],
                [0, 0, 0, 0, 46.6875],
                [0, 0, 0, 0, 45.6875],
                [0, 0, 0, 0, 43.0625],
                [0, 0, 0, 0, 43.5625],
                [0, 0, 0, 0, 44.8750],
                [0, 0, 0, 0, 43.6875]
            ]
            const averagingFrameLength = 14
            const result = relativeStrengthIndex( xohlcValues, averagingFrameLength )

            equal( result.length, 6 )
            numberRoughlyEqual( result[0].y, 51.779 )
            numberRoughlyEqual( result[1].y, 48.477 )
            numberRoughlyEqual( result[2].y, 41.073 )
            numberRoughlyEqual( result[3].y, 42.863 )
            numberRoughlyEqual( result[4].y, 47.382 )
        } )
    } )
} )
