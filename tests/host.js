'use strict'

const test              = require('../ramda-tapes')
const addAssertions     = require('extend-tape')
const parseDockerHost   = require('../src/host').parseDockerHost
const R                 = require('ramda')
const Either            = require('ramda-fantasy').Either

// doc: Unit is used to parse DOCKER_HOST env var
test('parseDockerHost', (t) => {
    t.test('removes colon from type', (t) => {
        const res1 = parseDockerHost('tcp://example.com/')
        const res2 = parseDockerHost()

        t.equal(res1.value.type, 'tcp',
            'sets type to tcp without colon')
        t.equal(res2.value.type, 'unix',
            'sets type to unix without colon')
        t.isEitherRight(res1,
            'should be an Either.Right')
        t.isEitherRight(res2,
            'should be an Either.Right')
        t.end()
    })

    t.test('pulls out host correctly for unix type', (t) => {
        const res = parseDockerHost()

        t.isEitherRight(res,
            'should be an Either.Right')
        t.equal(res.value.host, '/var/run/docker.sock',
            'docker.sock from pathname instead of hostname')
        t.end()
    })

    t.test('pulls out host correctly for tcp type', (t) => {
        const res = parseDockerHost('tcp://example.com')

        t.isEitherRight(res,
            'should be an Either.Right')
        t.equal(res.value.host, 'example.com',
            'example.com from hostname instead of pathname')
        t.end()
    })

    t.test('testing broken path', (t) => {
        const res = parseDockerHost('a')

        t.isEitherLeft(res,
            'should be an Either.Left(Error)')
        t.is(res.value, Error,
            'should be an Error object')
        t.equal(res.value.message, 'Unsupported protocol in DOCKER_HOST',
            'should have the correct error message')
        t.end()
    })

    t.end()
})
