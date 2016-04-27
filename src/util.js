/**
 * Utility functions
 */
'use strict'

const Maybe     = require('ramda-fantasy').Maybe
const Just      = Maybe.Just
const Nothing   = Maybe.Nothing

/**
 * Util module definition
 */
let util = exports

// Function for generating a custom Error class with this.name set
// customError :: String -> Error
util.defineError = (name) => {
    let custom = function (message, longMessage) {
        this.name = name
        this.message = (message || '')
        this.longMessage = Maybe.of(longMessage)
    }
    custom.prototype = Error.prototype

    return custom
}
