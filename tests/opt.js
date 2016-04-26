'use strict'

const test          = require('tapes')
const proxyquire    = require('proxyquire')
const simple        = require('simple-mock')
const R             = require('ramda')
const Either        = require('ramda-fantasy').Either

// Unit under test
const parseOpt      = require('../src/opt')

test('parseOpt', t => {
    // testing out default
    t.test('default gives Either.Left(Error)', (t) => {
        const argv = ['./duploy']
        const result = parseOpt(argv)

        t.equal(Either.isLeft(result), true,
            'result should be an Either.Left(Error)')
        t.equal(R.is(Error, result.value), true,
            'result.value should be an Error')
        t.end()
    })

    // testing out `init` works correctly
    t.test('"init" gives Either.Right(\'init\')', (t) => {
        const argv = ['./duploy', 'init']
        const result = parseOpt(argv)

        t.equal(Either.isRight(result), true,
            'result should be Either.Right')
        t.equal(result.value, 'init',
            'result should have init as its Either.Right value')
        t.end()
    })

    // testing out `init` with whitespace works correctly
    t.test('"init  " gives Either.Right(\'init\')', (t) => {
        const argv = ['./duploy', 'init  ']
        const result = parseOpt(argv)

        t.equal(Either.isRight(result), true,
            'result should be Either.Right')
        t.equal(result.value, 'init',
            'result should have init as its Either.Right value')
        t.end()
    })

    t.end()
})
