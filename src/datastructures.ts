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
export type Point = { x: number, y: number }

