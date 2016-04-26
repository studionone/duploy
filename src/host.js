/**
 * Parsing DOCKER_HOST environment variable
 */
'use strict'

const R         = require('ramda-maybe')
const Maybe     = require('ramda-fantasy').Maybe
const Either    = require('ramda-fantasy').Either
const url       = require('url')
const Just      = Maybe.Just
const Nothing   = Maybe.Nothing

/**
 * Host module wrapper
 */
let host = exports

// doc: Check unix or tcp
const replace = R.curry((k, r, obj) => obj !== null ? Maybe.Just(R.replace(k, r, obj)) : Maybe.Nothing())

// Host class that acts as a record for our parsed environment variable. Throws errors if invalid
// Host :: String a -> String -> { href :: String a, type :: String, host :: String }
function Host(href, parsed) {
    // Set the href
    this.href = href

    // Set the type or throw if protocol is undefined
    this.type = R.prop('protocol', parsed)
        .chain(replace(':', ''))
        .map(R.cond([
            [R.isNil, () => { throw new Error('No protocol specified in DOCKER_HOST') }],
            [R.T, R.identity]
        ])).value

    // Set the host value for Unix or TCP
    this.host = R.cond([
        [R.propEq('protocol', 'unix:'), R.prop('pathname')],
        [R.propEq('protocol', 'tcp:'), R.prop('host')],
        [R.T, () => { throw new Error('Unsupported protocol in DOCKER_HOST')}],
    ])(parsed).value

    return this
} host.Host = Host // Export the Class

// Parses DOCKER_HOST environment variable and returns a Host object, or throws
// an Error object if the env-var isn't valid
// parseDockerHost :: String -> Either (Error, Host)
host.parseDockerHost = (hostEnv) => {
    // Default our hostEnv to be unix socket and parse our hostEnv
    hostEnv = R.defaultTo('unix:///var/run/docker.sock')(hostEnv)

    // Return the created Host object
    let result = null

    try {
        let host = new Host(hostEnv, url.parse(hostEnv))
        Object.freeze(host)
        result = Either.Right(host)
    } catch (e) {
        result = Either.Left(e)
    }

    return result
}
