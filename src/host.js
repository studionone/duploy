/**
 * Parsing DOCKER_HOST environment variable
 */
'use strict'

const R = require('ramda-maybe')
const Maybe = require('ramda-fantasy').Maybe
const url = require('url')

// doc: Check unix or tcp
const replace = R.curry((k, r, obj) => obj !== null ? Maybe.Just(R.replace(k, r, obj)) : Maybe.Nothing())

class Host {
    constructor(href, parsed) {
        // Set the href
        this.href = href

        // Set the type or throw if protocol is undefined
        this.type = R.prop('protocol', parsed)
            .chain(replace(':', ''))
            .map(R.ifElse(
                R.isNil,
                (v) => { throw new Error('No protocol specified in DOCKER_HOST') },
                R.identity
            )).value

        // Set the host value for Unix or TCP
        this.host = R.cond([
            [R.propEq('protocol', 'unix:'), R.prop('pathname')],
            [R.propEq('protocol', 'tcp:'), R.prop('host')],
            [R.T, () => { throw new Error('Unsupported protocol in DOCKER_HOST')}],
        ])(parsed).value
    }
}


// doc: Parses DOCKER_HOST env-var
module.exports = function parseDockerHost(hostEnv) {
    // Default our hostEnv to be unix socket and parse our hostEnv
    hostEnv = R.defaultTo('unix:///var/run/docker.sock')(hostEnv)

    // Return the created Host object
    let host = new Host(hostEnv, url.parse(hostEnv))
    Object.freeze(host)

    return host
}
