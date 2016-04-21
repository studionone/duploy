/**
 * Duploy node-based CLI for docker deployment automation
 */
'use strict'

const parseDockerHost = require('./host')
const docker = require('./docker')

const main = (dockerHost) => {
    const host = parseDockerHost(dockerHost)
    const conn = docker.connect(host)
}

if (require.main === module) {
    main(process.env.DOCKER_HOST)
}
