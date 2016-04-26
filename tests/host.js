'use strict'

const test              = require('tapes')
const parseDockerHost   = require('../src/host').parseDockerHost

// doc: Unit is used to parse DOCKER_HOST env var
test('parseDockerHost', (t) => {
    t.test('removes colon from type', (t) => {
        const res1 = parseDockerHost('tcp://example.com/')
        const res2 = parseDockerHost()

        t.equal(res1.type, 'tcp',
            'sets type to tcp without colon')
        t.equal(res2.type, 'unix',
            'sets type to unix without colon')
        t.end()
    })

    t.test('pulls out host correctly for unix type', (t) => {
        const res = parseDockerHost()

        t.equal(res.host, '/var/run/docker.sock',
            'docker.sock from pathname instead of hostname')
        t.end()
    })

    t.test('pulls out host correctly for tcp type', (t) => {
        const res = parseDockerHost('tcp://example.com')

        t.equal(res.host, 'example.com',
            'example.com from hostname instead of pathname')
        t.end()
    })

    t.test('testing broken path', (t) => {
        try {
            const res = parseDockerHost('a')
        } catch (e) {
            t.equal(e.message, 'Unsupported protocol in DOCKER_HOST',
                'should be the right error')
        }
        t.end()
    })

    t.end()
})
