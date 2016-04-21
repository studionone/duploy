/**
 * Parsing DOCKER_HOST environment variable
 */
'use strict'

const R = require('ramda-maybe')
const Maybe = require('ramda-fantasy').Maybe
const Just = Maybe.Just
const Nothing = Maybe.Nothing
const url = require('url')

// doc: Check unix or tcp
const isUnix = (str) => /^unix$/.exec(str) !== null
const isTcp = (str) => /^tcp$/.exec(str) !== null
const replace = R.curry((k, r, obj) => obj !== null ? Just(R.replace(k, r, obj)) : Nothing())

class Host {
    constructor(type, host, href) {
        this.type = R.defaultTo('')(type)
        this.host = R.defaultTo('')(host)
        this.href = R.defaultTo('')(href)
    }
}


// doc: Parses DOCKER_HOST env-var
module.exports = function parseDockerHost(hostEnv) {
    // Default our hostEnv to be unix socket
    hostEnv = R.defaultTo('unix:///var/run/docker.sock')(hostEnv)

    // Build our ret val
    let host = new Host('', '', hostEnv)

    // Parse the DOCKER_HOST URL
    const parsed = url.parse(hostEnv)
    const type = R.prop('protocol', parsed).chain(replace(':', ''))

    if (type.chain(isUnix)) host.host = R.prop('pathname')(parsed).value
    if (type.chain(isTcp))  host.host = R.prop('host')(parsed).value
    if (type.isNothing()) throw new Error('Invalid protocol in DOCKER_HOST')
    host.type = type.value

    return host
}
