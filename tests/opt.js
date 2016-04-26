'use strict'

const test          = require('../ramda-tapes')
const proxyquire    = require('proxyquire')
const simple        = require('simple-mock')
const R             = require('ramda')
const Either        = require('ramda-fantasy').Either

// Unit under test
const opt           = require('../src/opt')
const parseOpt      = opt.parseOpt
const Exceptions    = require('../src/exceptions').Opt

test('parseOpt', t => {
    // testing out default
    t.test('default gives Either.Left(NoArgumentError)', (t) => {
        const argv = ['./duploy']
        const result = parseOpt(argv)

        t.equal(Either.isLeft(result), true,
            'result should be an Either.Left')
        t.equal(R.is(Exceptions.NoArgumentError, result.value), true,
            'result.value should be a NoArgumentError')
        t.end()
    })

    // testing out `asdf` gives a NoMatchError
    t.test('"asdf" gives Either.Left(NoMatchError)', (t) => {
        const argv = ['./duploy', 'asdf']
        const result = parseOpt(argv)

        t.equal(Either.isLeft(result), true,
            'result shuold be an Either.Left')
        t.equal(R.is(Exceptions.NoMatchError, result.value), true,
            'result.value should be a NoMatchError')
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
