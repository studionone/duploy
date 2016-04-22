/**
 * Duploy node-based CLI for docker deployment automation
 */
'use strict'

const parseDockerHost   = require('./host')
const docker            = require('./docker')
const parser            = require('http-string-parser')

const main = (dockerHost) => {
    const host = parseDockerHost(dockerHost)
    const conn = docker.connect(host)
    const error = (err) => {
        console.error(err)
        conn.destroy()
    }
    const success = (data) => {
        try {
            const res = JSON.parse(parser.parseResponse(data).body)
            console.log(res)
        } catch (e) {
            console.error('Error parsing response from API', e)
        }
    }

    // Send request and get response
    docker.sendRequest(conn, 'GET', '/images/json').fork(error, success)
}

if (require.main === module) {
    main(process.env.DOCKER_HOST)
}
