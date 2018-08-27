import { Position } from './generators/progressiveRandom';

export interface StreamOptions<T> {
    interval?: number,
    batchSize?: number,
    scalingFunction?: ( val: T ) => T,
    infinite?: boolean
}

export class Stream<T> {
    constructor( private readonly content: Promise<T[]>, private readonly options: StreamOptions<T> ) { }
    forEach( handler: ( value: T[] ) => void ) {
        const interval = this.options.interval || 1000
        const batchSize = this.options.batchSize || 1
        this.content.then( value => {
            let count = 0
            const len = value.length
            const curInterval = setInterval(
                () => {
                    let end = 0
                    if ( count + batchSize < len ) {
                        end = count + batchSize
                    } else if ( count < len ) {
                        end = len
                    } else {
                        if ( this.options.infinite === false ) {
                            clearInterval( curInterval )
                        } else {
                            count = 0
                            end = batchSize
                        }
                    }
                    let vals = value.slice( count, end )
                    if ( this.options.infinite !== false && vals.length < batchSize ) {
                        vals = vals.concat( value.slice( 0, batchSize - vals.length ) )
                    }
                    if ( this.options.scalingFunction ) {
                        vals = vals.map( this.options.scalingFunction )
                    }
                    if ( vals.length > 0 )
                        handler( vals )
                    count += batchSize
                }, interval
            )
        } )
    }
}

export const scalingFunctions = {
    minMax: ( min: number, max: number, property?: string ) => ( val: Position ) => {
        const interval = max - min
        const scaled = { ...val }
        if ( property === 'x' || property === 'y' ) {
            scaled[property] = val[property] * interval + min
        } else {
            scaled.x = val.x * interval + min
            scaled.y = val.y * interval + min
        }
        return scaled
    }
}
