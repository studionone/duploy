/**
 * Stack data-structure using the monadic List implementation internally
 * Adapted from: https://github.com/avoidwork/tiny-stack
 */
'use strict'

const R     = require('ramda')
const List  = require('./list')

// Internal functions
// notNil :: a -> Boolean
const notNil    = R.complement(R.isNil)

// Stack
class Stack {
    constructor() {
        this.data = List.empty
        this.top  = 0
    }

    clear() {
        this.data = List.empty
        this.top  = 0

        return this
    }

    length() {
        return this.data.length()
    }

    empty() {
        return this.data.empty()
    }

    peek() {
        return this.data.last()
    }

    // Pop the last element off the stack and return it
    // pop :: () -> a
    pop() {
        let i=0, popped

        // Early return 'undefined' for the case of 0-length
        if (this.top < 1) return

        // Grab last element
        popped = this.data.last()
        // Remove last element from the data List
        this.data = this.data.init()
        this.top = this.top - 1

        return popped
    }

    // Push a new element onto the stack
    // push :: a -> Stack
    push(element) {
        this.top = this.top + 1
        this.data = this.data.concat(List.of(element))

        return this
    }

    // Searches for a given element (using ===) and returns the index
    // search :: a -> Number
    search(element) {
        let i, j=1

        this.data.map(f => {
            if (notNil(i)) return
            if (f === element) i = j
            j = j + 1
        })

        return i
    }
}

module.exports = Stack
