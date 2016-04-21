/**
 * Socket-based Docker client wrapper for Node
 */
'use strict'

const R = require('ramda')
const net = require('net')

let docker = module.exports = {}

/**
 * Top-level protocol-aware wrapper around net socket communication
 */
docker.connect = (host) => {
    host = R.defaultTo({})(host)
    const type = R.prop('type')

    if (type(host) === 'unix') {
        return docker.connectUnix(host)
    }

    if (type(host) === 'tcp') {
        return docker.connectTcp(host)
    }

    // We only handle TCP/Unix sockets, nothing else at the moment
    throw new Error('Invalid DOCKER_HOST type')
}

/**
 * TCP-specific connection to Docker socket
 */
docker.connectTcp = (host) => {

}

/**
 * Unix-specific connection to Docker socket
 */
docker.connectUnix = (host) => {

}
