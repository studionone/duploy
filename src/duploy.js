/**
 * Duploy node-based CLI for docker deployment automation
 */
'use strict'

const R                 = require('ramda')
const Reader            = require('ramda-fantasy').Reader
const Either            = require('ramda-fantasy').Either
const parseDockerHost   = require('./host').parseDockerHost
const docker            = require('./docker')

/**
 * Module definition
 */
let duploy = exports

// doc: error callback
const error = (err) => {
    console.error(err)
    conn.destroy()
}

// doc: success callback
const success = (data) => {
    try {
        return Either.Right(JSON.parse(parser.parseResponse(data).body))
    } catch (e) {
        return Either.Left(e)
    }
}

duploy.main = (dockerHost) => {
    const conn =
        parseDockerHost(dockerHost)
            .map(docker.connect)
            .map((conn) => docker.sendRequest(conn, 'GET', '/images/json'))
            .fork(error, success)
}

if (require.main === module) {
    duploy.main(process.env.DOCKER_HOST)
}
