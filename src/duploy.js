/**
 * Duploy node-based CLI for docker deployment automation
 */
'use strict'

const R = require('ramda')
const url = require('url')

// doc: Check unix or tcp
const isUnix = (str) => /^unix$/.exec(str) !== null
const isTcp = (str) => /^tcp$/.exec(str) !== null
// doc: Strip colon from a string
const stripColon = R.replace(':', '')

// doc: Parses DOCKER_HOST env-var
const parseDockerHost = (hostEnv) => {
    // Default our hostEnv to be unix socket
    if (R.isNil(hostEnv)) { hostEnv = 'unix:///var/run/docker.sock' }
    // Build our ret val
    let ret = {
        href: hostEnv,
        host: '',
        type: '',
    }
    // Parse the DOCKER_HOST URL
    const parsed = url.parse(hostEnv)
    ret.type = stripColon(parsed.protocol)

    if (isUnix(ret.type)) {
        ret.host = parsed.pathname
    }

    if (isTcp(ret.type)) {
        ret.host = parsed.host
    }

    return ret
}

const main = (dockerHost) => {
    const host = parseDockerHost(dockerHost)
    console.log(host)
}

if (require.main === module) {
    main(process.env.DOCKER_HOST)
}

module.exports = { parseDockerHost, }
