/**
 * Duploy node-based CLI for docker deployment automation
 */
'use strict'

const parseDockerHost   = require('./host').parseDockerHost
const docker            = require('./docker')

/**
 * Module definition
 */
let duploy = exports

duploy.main = (dockerHost) => {
    const host = parseDockerHost(dockerHost)
    const conn = docker.connect(host)
    const error = (err) => {
        console.error(err)
        conn.destroy()
    }
    const success = (data) => {
        try {
            fs.writeFileSync(__dirname + '/test.json', data)
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
    duploy.main(process.env.DOCKER_HOST)
}
