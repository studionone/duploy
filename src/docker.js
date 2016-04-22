/**
 * Socket-based Docker client wrapper for Node
 */
'use strict'

const R = require('ramda-maybe')
const net = require('net')

let docker = module.exports = {}

/**
 * Top-level protocol-aware wrapper around net socket communication
 */
docker.connect = (host) => {
    host = R.defaultTo({})(host)
    const type = R.prop('type')

    // Delegate out to other methods, throw if its not the right type
    return R.cond([
        [R.propEq('type', 'unix'), () => docker.connectUnix(host)],
        [R.propEq('type', 'tcp'), () => docker.connectTcp(host)],
        [R.T, () => { throw new Error('Invalid DOCKER_HOST type') }]
    ])(host)
}

/**
 * TCP-specific connection to Docker socket
 */
docker.connectTcp = (host) => {
    console.log('Connecting to TCP socket...')
}

/**
 * Unix-specific connection to Docker socket
 */
docker.connectUnix = (host) => {
    console.log('Connecting to POSIX socket...')
}
