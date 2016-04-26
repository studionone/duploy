/**
 * Utility functions
 */
'use strict'

/**
 * Util module definition
 */
let util = exports

// Function for generating a custom Error class with this.name set
// customError :: String -> Error
util.defineError = (name) => {
    let newError = function (message) {
        this.name = name
        this.message = (message || '')
    }
    newError.prototype = Error.prototype

    return newError
}
