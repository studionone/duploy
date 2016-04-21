'use strict'
// Test utils
const test          = require('tapes')
const proxyquire    = require('proxyquire')
const simple        = require('simple-mock')

// doc: Testing the docker.connect abstraction
test('docker.connect', (t) => {
    let docker, netStub

    t.beforeEach((t) => {
        netStub = {
            connect: simple.stub(),
        }
        t.end()
    })

    t.afterEach((t) => {
        simple.restore()
        t.end()
    })

    t.test('call with TCP hands off to connectTcp', (t) => {
        // doc: Setup our stubs
        docker = proxyquire('../src/docker', {
            net: netStub
        })
        simple.mock(docker, 'connectTcp').callFn(() => {})  // stub
        simple.mock(docker, 'connectUnix').callFn(() => {}) // stub

        // doc: Call our unit under test
        const res = docker.connect({ type: 'tcp', host: '127.0.0.1' })

        t.equal(docker.connectTcp.callCount, 1,
            'connectTcp called once')
        t.equal(docker.connectUnix.callCount, 0,
            'connectUnix never called')
        t.end()
    })

    t.end()
})
