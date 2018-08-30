export interface StreamOptions<T> {
    interval?: number,
    batchSize?: number,
    infinite?: boolean,
    infiniteReset: ( value: T ) => T
}

export class Stream<T> {
    private data: T[] = []
    private readonly interval = this.options.interval || 1000
    private readonly batchSize = this.options.batchSize || 1

    constructor( private readonly options: StreamOptions<T> ) { }

    private consume(): T[] {
        let cutCount = this.batchSize
        if ( this.data.length < this.batchSize ) {
            cutCount = this.data.length
        }
        const consumed = this.data.splice( 0, cutCount )
        if ( this.options.infinite ) {
            if ( consumed.length < this.batchSize ) {
                throw new Error( 'Not implemented, implement it!' )
            } else {
                this.data = this.data.concat( consumed.map( dataPoint => this.options.infiniteReset( dataPoint ) ) )
            }
        }
        return consumed
    }

    /**
     * Push new data to the end of stream.
     * @param newData New data point
     */
    push( newData: T | T[] ) {
        this.data = this.data.concat( newData )
    }

    map( handler: ( value: T, index: number, array: T[] ) => T ) {
        const newStream = new Stream<T>( { ...this.options, infinite: false } )
        const intervalRef = setInterval( () => {
            if ( this.data.length <= 0 ) {
                clearInterval( intervalRef )
                return
            }
            const curData = this.consume()
            const mapped = curData.map( handler )
            newStream.push( mapped )
        }, this.interval )
        return newStream
    }

    forEach( handler: ( value: T, index: number, array: T[] ) => void ) {
        const intervalRef = setInterval( () => {
            if ( this.data.length <= 0 ) {
                clearInterval( intervalRef )
                return
            }
            const curData = this.consume()
            curData.forEach( handler )
        }, this.interval )
    }
}
