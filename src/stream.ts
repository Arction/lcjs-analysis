export type StreamContinueHandler = () => boolean

/**
 * Configuration object for the stream
 */
export interface StreamOptions {
    /**
     * How often the stream processes the data it has
     */
    interval: number,
    /**
     * How many elements of data is processed at same time
     */
    batchSize: number,
    /**
     * Set to true to repeat the stream infinitely.
     * Set to false to only continue until the stream has no data.
     * Set to a number to get n batches of the data.
     * Set to call back function to continue the stream until the callback returns false.
     * Leaving the value as undefined repeats the stream infinitely.
     */
    repeat: boolean | number | StreamContinueHandler
}

/**
 * Data stream.
 * @param T The type of the streamed data.
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
     * An function to use to reset the data when it is moved to the end of the stream.
     * Only used if the stream is infinite.
     */
    private infiniteReset: ( value: T ) => T

    /**
     * How many batches of data to stream.
     * -1 = infinite stream
     * -2 = until the end of data
     */
    private batchesLeft: number = -2
    /**
     * Handler used to check whether or not the stream should continue.
     */
    private continueHandler?: StreamContinueHandler

    /**
     * Create a new instance of a stream.
     * @param options The options to use to construct this stream.
     * @param infiniteReset A function to use when offsetting the data during moving it to back of the data stream
     */
    constructor( private readonly options: StreamOptions, infiniteReset: ( value: T ) => T ) {
        this.runStream = this.runStream.bind( this )
        this.infiniteReset = infiniteReset
        if ( options.repeat !== undefined ) {
            if ( typeof options.repeat === 'boolean' ) {
                this.batchesLeft = options.repeat ? -1 : -2
            } else if ( typeof options.repeat === 'number' ) {
                this.batchesLeft = options.repeat + 1
            } else if ( typeof options.repeat === 'function' ) {
                this.continueHandler = options.repeat
            }
        }
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
        if ( ( this.batchesLeft > 0 || this.batchesLeft === -1 ) && consumed.length > 0 ) {
            this.data = this.data.concat( consumed.map( dataPoint => this.infiniteReset( dataPoint ) ) );
            // If the data wasn't enough to fill the batch size, take the first element of the data and add it to
            // the batch and then move it to the end of the data
            if ( consumed.length < this.batchSize ) {
                while ( consumed.length < this.batchSize ) {
                    const nextPoint = this.data.splice( 0, 1 )[0];
                    this.data = this.data.concat( this.infiniteReset( nextPoint ) )
                    consumed.push( nextPoint );
                }
            }
        }
        return consumed
    }

    /**
     * Check whether the stream should be continued or not.
     */
    private checkStreamContinue() {
        let continueStream = ( this.batchesLeft > 0 ||
            this.batchesLeft === -1 ||
            ( this.batchesLeft === -2 && this.data.length > 0 ) )
            ? true : false
        if ( this.continueHandler ) {
            continueStream = this.continueHandler() === true
        }
        return continueStream
    }

    /**
     * Handles consuming the data with correct handler. The stream will be active until it has no more data or
     * the streams repeat count hits 0 or the continue callback returns false.
     */
    private runStream() {
        const continueStream = this.checkStreamContinue()
        if ( this.data && this.data.length > 0 && continueStream ) {
            if ( this.streamHandler ) {
                const curData = this.consume()
                this.streamHandler( curData )
            }
            setTimeout( this.runStream, this.interval )
        } else {
            this.streamActive = false
        }
        if ( this.batchesLeft > 0 ) this.batchesLeft--
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
        if ( Array.isArray( newData ) ) {
            this.data = this.data.concat( newData )
        } else {
            this.data.push( newData )
        }
        this.activateStream()
    }

    /**
     * Maps the stream of data.
     * @param handler A function that works just like a normal JavaScript Array.prototype.map handler.
     * @returns A new stream with the data mapped by the handler.
     */
    map( handler: ( value: T, index: number, array: T[] ) => T ) {
        this.outputStream = new Stream<T>( { ...this.options, repeat: false }, this.infiniteReset )
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
     * @param handler A function that works just like a normal JavaScript Array.prototype.forEach handler.
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
