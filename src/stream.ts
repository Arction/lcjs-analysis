import Eventer from 'eventer'

export abstract class Stream<T> {
    private tickLen = 0
    constructor( private readonly content: Promise<T[]> ) { }
    forEach( handler: ( value: T ) => void ) {
        this.content.then( value => {
            let count = 0
            const len = value.length
            setInterval(
                () => {
                    if ( count < len ) {
                        handler( value[count] )
                    }
                }, this.tickLen
            )
        } )
    }
}