/**
 * Socket-based Docker client wrapper for Node
 */
'use strict'

const R = require('ramda')
const net = require('net')

let docker = module.exports = {}

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

// doc: Connects to TCP socket
docker.connectTcp = (host) => {

}

// doc: Connects to Unix socket
docker.connectUnix = (host) => {

}
