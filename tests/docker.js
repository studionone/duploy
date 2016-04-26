'use strict'

const test          = require('../ramda-tapes')
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

    t.test('call with nothing defaults to empty object and throws', (t) => {
        // doc: Setup our stubs
        docker = proxyquire('../src/docker', {
            net: netStub
        })

        // doc: Call unit under test
        try {
            const res = docker.connect()
            t.fail('Should throw error')
        } catch (error) {
            t.equal(error.message, 'Invalid DOCKER_HOST type',
                'should have thrown correct error message')
        }

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
        const res = docker.connect({
            type: 'tcp',
            host: '127.0.0.1',
            href: 'tcp://127.0.0.1',
        })

        t.equal(docker.connectTcp.callCount, 1,
            'connectTcp called once')
        t.equal(docker.connectUnix.callCount, 0,
            'connectUnix never called')
        t.end()
    })

    t.test('call with Unix hands off to connectUnix', (t) => {
        // doc: Setup our stubs
        docker = proxyquire('../src/docker', {
            net: netStub
        })
        simple.mock(docker, 'connectTcp').callFn(() => {})  // stub
        simple.mock(docker, 'connectUnix').callFn(() => {}) // stub

        // doc: Call our unit under test
        const res = docker.connect({
            type: 'unix',
            host: '/var/run/docker.sock',
            href: 'unix:///var/run/docker.sock',
        })

        t.equal(docker.connectUnix.callCount, 1,
            'connectUnix called once')
        t.equal(docker.connectTcp.callCount, 0,
            'connectTcp never called')
        t.end()
    })

    t.end()
})
