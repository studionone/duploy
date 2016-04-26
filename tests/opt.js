'use strict'

const test          = require('tapes')
const proxyquire    = require('proxyquire')
const simple        = require('simple-mock')
const parseOpt      = require('../src/opt')

test('parseOpt', t => {
    // testing out default
    t.test('default gives Nothing()', (t) => {
        const argv = ['./duploy']
        const result = parseOpt(argv)

        t.ok(result.isNothing(),
            'result should be an instance of Nothing()')
        t.end()
    })

    // testing out `init` works correctly
    t.test('"init" gives Just(\'init\')', (t) => {
        const argv = ['./duploy', 'init']
        const result = parseOpt(argv)

        t.ok(result.isJust(),
            'result should be a Just')
        t.equal(result.value, 'init',
            'result should have init as its Just value')
        t.end()
    })

    // testing out `init` with whitespace works correctly
    t.test('"init  " gives Just(\'init\')', (t) => {
        const argv = ['./duploy', 'init  ']
        const result = parseOpt(argv)

        t.ok(result.isJust(),
            'result should be a Just')
        t.equal(result.value, 'init',
            'result should have init as its Just value')
        t.end()
    })

    t.end()
})
