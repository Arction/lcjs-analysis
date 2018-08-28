import { Point } from './data-generator'

export interface StreamOptions<T> {
    interval?: number,
    batchSize?: number,
    scalingFunction?: ( val: T ) => T,
    infinite?: boolean,
    infiniteReset: ( values: T[], length: number ) => T[]
}

export class Stream<T> {
    constructor( private readonly content: Promise<T[]>, private readonly options: StreamOptions<T> ) { }
    forEach( handler: ( value: T[] ) => void ) {
        const interval = this.options.interval || 1000
        const batchSize = this.options.batchSize || 1
        this.content.then( value => {
            let values = value
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
                            values = this.options.infiniteReset( values, values.length )
                        }
                    }
                    let vals = values.slice( count, end )
                    count += batchSize
                    if ( this.options.infinite !== false && vals.length < batchSize ) {
                        const toEnd = batchSize - vals.length
                        const tempVals = this.options.infiniteReset( values.slice( 0, toEnd ), values.length )
                        vals = vals.concat( tempVals )
                        values = this.options.infiniteReset( values, values.length )
                        count = toEnd
                    }
                    if ( vals.length > 0 )
                        handler( vals )
                }, interval
            )
        } )
    }
}
