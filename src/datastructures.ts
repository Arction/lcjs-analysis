// Datastructures used by LCJS.

/**
 * Ordered tuple that contains values for:
 * - X
 * - Open
 * - High
 * - Low
 * - Close
 */
export type XOHLC = [number, number, number, number, number]
/**
 * Datapoint with X and Y values.
 */
export type Point = {
    x: number,
    y: number
}
/**
 * Datapoint with one X value and two Y values.
 */
export type AreaPoint = {
    /**
     * Position of Point.
     */
    position: number
    /**
     * High value of Point in the given position.
     */
    high: number
    /**
     * Low value of Point in the given position.
     */
    low: number
}
