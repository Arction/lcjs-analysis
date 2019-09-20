import { equal } from './tools'
import { relativeStrengthIndex } from '../src/trading'
import { XOHLC, Point } from '../src/datastructures'

describe( 'relativeStrengthIndex', () => {
    it( 'Returns empty Array when xohlcValues.length < averagingFrameLength', () => {
        const xohlcValues: XOHLC[] = []
        const averagingFrameLength = 13
        const result = relativeStrengthIndex( xohlcValues, averagingFrameLength )

        equal( result.length, 0 )
    } )
} )
