/**
 * Parsing DOCKER_HOST environment variable
 */
'use strict'

const R = require('ramda')
const url = require('url')

// doc: Check unix or tcp
const isUnix = (str) => /^unix$/.exec(str) !== null
const isTcp = (str) => /^tcp$/.exec(str) !== null
// doc: Strip colon from a string
const stripColon = R.replace(':', '')
const type = R.prop('type')
const proto = R.prop('protocol')

// doc: Parses DOCKER_HOST env-var
module.exports = function parseDockerHost(hostEnv) {
    // Default our hostEnv to be unix socket
    hostEnv = R.defaultTo('unix:///var/run/docker.sock')(hostEnv)

    // Build our ret val
    let ret = {
        href: hostEnv,
        host: '',
        type: '',
    }

    // Parse the DOCKER_HOST URL
    const parsed = url.parse(hostEnv)
    ret.type = R.pipe(
        parsed,
        proto,
        stripColon
    )

    if (isUnix(ret.type)) {
        ret.host = parsed.pathname
    }

    if (isTcp(ret.type)) {
        ret.host = parsed.host
    }

    return ret
}
