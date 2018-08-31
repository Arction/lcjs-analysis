export interface StreamOptions<T> {
    interval?: number,
    batchSize?: number,
    infinite?: boolean,
    infiniteReset: ( value: T ) => T
}

/**
 * Data stream.
 */
export class Stream<T> {
    /**
     * State of the stream.
     */
    private streamActive = false
    /**
     * The output stream to use on stream functions that have output.
     */
    private outputStream?: Stream<T>
    /**
     * The external handler for mapping the stream.
     */
    private mapHandler?: ( value: T, index: number, array: T[] ) => T
    /**
     * The external handler for forEach.
     */
    private forEachHandler?: ( value: T, index: number, array: T[] ) => void
    /**
     * The active internal handler. Called when the stream is active and it has data to process.
     */
    private streamHandler?: ( data: T[] ) => void
    /**
     * The data that the stream holds currently
     */
    private data: T[] = []
    /**
     * The interval for the stream to process data.
     */
    private readonly interval = this.options.interval || 1000
    /**
     * How many elements from the data to process at one time.
     */
    private readonly batchSize = this.options.batchSize || 1

    /**
     * Create a new instance of a stream.
     * @param options The options to use to construct this stream.
     */
    constructor( private readonly options: StreamOptions<T> ) {
        this.runStream = this.runStream.bind( this )
    }

    /**
     * Consumes the stream.
     * Moves the elements to the end of the stream if the stream should be infinite.
     * @returns The elements that were consumed from the stream.
     */
    private consume(): T[] {
        let cutCount = this.batchSize
        if ( this.data.length < this.batchSize ) {
            cutCount = this.data.length
        }
        const consumed = this.data.splice( 0, cutCount )
        if ( this.options.infinite && consumed.length > 0 ) {
            this.data = this.data.concat( consumed.map( dataPoint => this.options.infiniteReset( dataPoint ) ) );
            // If the data wasn't enough to fill the batch size, take the first element of the data and add it to
            // the batch and then move it to the end of the data
            if ( consumed.length < this.batchSize ) {
                while ( consumed.length < this.batchSize ) {
                    const nextPoint = this.data.splice( 0, 1 )[0];
                    this.data = this.data.concat( this.options.infiniteReset( nextPoint ) )
                    consumed.push( nextPoint );
                }
            }
        }
        return consumed
    }

    /**
     * Handles consuming the data with correct handler. The stream will be active until it has no more data.
     */
    private runStream() {
        if ( this.data && this.data.length > 0 ) {
            if ( this.streamHandler ) {
                const curData = this.consume()
                this.streamHandler( curData )
            }
            setTimeout( this.runStream, this.interval )
        } else {
            this.streamActive = false
        }
    }

    /**
     * Activates the stream if it has gone stale.
     */
    private activateStream() {
        if ( !this.streamActive ) {
            this.streamActive = true
            this.runStream()
        }
    }

    /**
     * Push new data to the end of stream.
     * @param newData New data point
     */
    push( newData: T | T[] ) {
        this.data = this.data.concat( newData )
        this.activateStream()
    }

    /**
     * Maps the stream of data.
     * @param handler A function that works just like a normal array.map handler
     * @returns A new stream with the data mapped by the handler.
     */
    map( handler: ( value: T, index: number, array: T[] ) => T ) {
        this.outputStream = new Stream<T>( { ...this.options, infinite: false } )
        this.mapHandler = handler
        this.streamHandler = this._map
        this.activateStream()
        return this.outputStream
    }

    /**
     * The internal implementation of the map.
     * Calls the set mapHandler on the data set.
     * Pushes the returned data to the output stream.
     * @param data Data to map
     */
    private _map( data: T[] ) {
        if ( this.mapHandler && this.outputStream ) {
            const mapped = data.map( this.mapHandler )
            this.outputStream.push( mapped )
        }
    }

    /**
     * Calls the handler for each element of the stream.
     * @param handler A function that works just like a normal array.forEach handler.
     */
    forEach( handler: ( value: T, index: number, array: T[] ) => void ) {
        this.forEachHandler = handler
        this.streamHandler = this._forEach
        this.activateStream()
    }

    /**
     * The internal implementation of the forEach function.
     * Calls the forEachHandler on all elements of the data set.
     * @param data Data to call forEach on.
     */
    private _forEach( data: T[] ) {
        if ( this.forEachHandler )
            data.forEach( this.forEachHandler )
    }
}
