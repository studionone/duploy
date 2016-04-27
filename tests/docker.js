'use strict'

const test          = require('../ramda-tapes')
const proxyquire    = require('proxyquire')
const simple        = require('simple-mock')
const fs            = require('fs')

// doc: Testing the docker.connect abstraction
test('docker.connect', t => {
    let docker, netStub

    t.beforeEach(t => {
        netStub = {
            connect: simple.stub(),
        }
        t.end()
    })

    t.afterEach(t => {
        simple.restore()
        t.end()
    })

    t.test('call with nothing defaults to empty object and throws', t => {
        // doc: Setup our stubs
        docker = proxyquire('../src/docker', {
            net: netStub
        })

        // doc: Call unit under test
        const res = docker.connect()

        t.isEitherLeft(res,
            'should be an Either.Left(Error)')
        t.is(res.value, Error,
            'Either.Left value should be an Error')
        t.equal(res.value.message, 'Invalid DOCKER_HOST type',
            'should have thrown correct error message')
        t.end()
    })

    t.test('call with TCP hands off to connectTcp', t => {
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

    t.test('call with Unix hands off to connectUnix', t => {
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

test('parseResponse', t => {
    let docker, response, responseString

    // doc: Stock standard unit under test
    docker = require('../src/docker')

    t.afterEach(t => {
        simple.restore()
        t.end()
    })

    t.test('empty response buffer gives Either.Left(Error)', t => {
        response = new Buffer('')

        let result = docker.parseResponse(response)

        t.isEitherLeft(result,
            'result should be Either.Left')
        t.is(result.value, Error,
            'result.value should be an Error')
        t.end()
    })

    t.test('real response gives Either.Right(parsed)', t => {
        responseString = require('./data/res.js')
        response = new Buffer(responseString)

        let result = docker.parseResponse(response)

        t.isEitherRight(result,
            'result should be an Either.Right')
        t.equal(result.value.body, '{}',
            'result body should be a raw {} string')
        t.equal(result.value.protocolVersion, 'HTTP/1.0',
            'result protocolVersion should be 1.0')
        t.end()
    })

    t.end()
})
