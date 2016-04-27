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
    const res =
        docker.parseResponse(data)
              .map(v => console.log(v))
}

duploy.parse = (resp) => {
    let res = docker.parseResponse(resp).map((parsed) => {
        console.log(parsed)
    })
}

duploy.error = (e) => {
    console.error(e.message)
    process.exit(1)
}

duploy.main = (dockerHost) => {
    const conn = parseDockerHost(dockerHost)
            .bimap(duploy.error, host => docker.connect(host))
            .bimap(duploy.error, c => docker.sendRequest(c.value, 'GET', '/images/json'))
            .chain(f => f.fork(error, success))
}

if (require.main === module) {
    duploy.main(process.env.DOCKER_HOST)
}
