'use strict'

const test          = require('../ramda-tapes')
const proxyquire    = require('proxyquire')
const simple        = require('simple-mock')
const R             = require('ramda')
const Either        = require('ramda-fantasy').Either
const child         = require('child_process')
const which         = require('which')

// Unit under test
const opt           = require('../src/opt')
const parseOpt      = opt.parseOpt
const Exceptions    = require('../src/exceptions').Opt

test('parseOpt', t => {
    // testing out default
    t.test('default gives Either.Left(NoArgumentError)', t => {
        const argv = ['./duploy']
        const result = parseOpt(argv)

        t.isEitherLeft(result,
            'result should be an Either.Left')
        t.equal(R.is(Exceptions.NoArgumentError, result.value), true,
            'result.value should be a NoArgumentError')
        t.end()
    })

    // testing out `asdf` gives a NoMatchError
    t.test('"asdf" gives Either.Left(NoMatchError)', t => {
        const argv = ['./duploy', 'asdf']
        const result = parseOpt(argv)

        t.equal(Either.isLeft(result), true,
            'result shuold be an Either.Left')
        t.equal(R.is(Exceptions.NoMatchError, result.value), true,
            'result.value should be a NoMatchError')
        t.end()
    })

    // testing out `init` works correctly
    t.test('"init" gives Either.Right(\'init\')', t => {
        const argv = ['./duploy', 'init']
        const result = parseOpt(argv)

        t.equal(Either.isRight(result), true,
            'result should be Either.Right')
        t.equal(result.value, 'init',
            'result should have init as its Either.Right value')
        t.end()
    })

    // testing out `init` with whitespace works correctly
    t.test('"init  " gives Either.Right(\'init\')', t => {
        const argv = ['./duploy', 'init  ']
        const result = parseOpt(argv)

        t.isEitherRight(result,
            'result should be Either.Right')
        t.equal(result.value, 'init',
            'result should have init as its Either.Right value')
        t.end()
    })

    t.end()
})

test('packrattle parser combinators', t => {

    t.test('commandOrPath works with commands or filenames', t => {
        const args = opt.combineArgv(['duploy', 'init'])
        const args2 = opt.combineArgv(['duploy', 'now'])
        const args3 = opt.combineArgv(['duploy', './testing.yml'])

        try {
            const result = opt.commandOrPath.run(args)
            const result2 = opt.commandOrPath.run(args2)
            const result3 = opt.commandOrPath.run(args3)


            t.is(result, opt.Tokens.CommandToken,
                'first result should be a command token')
            t.is(result2, opt.Tokens.CommandToken,
                'second result should be a command token')
            t.is(result3, opt.Tokens.PathToken,
                'third result should be a path token')
            t.equal(result.match, 'init',
                'first result matches "init"')
            t.equal(result2.match, 'now',
                'second result matches "now"')
            t.equal(result3.match[0], './testing.yml',
                'third result matches ./testing.yml')
        } catch (e) {
            t.fail(`Error parsing the string: ${e.message}`)
        }

        t.end()
    })

    t.end()
})

// Finds whether "dot" binary from graphviz exists on the $PATH
which('dot', (er, resolvedPath) => {
    if (er) return

    // Write out DOT file for graph of parser
    opt.parser.writeDotFile(__dirname + '/data/parser.dot')

    // Execute dot from graphviz to convert DOT file into a PNG
    child.spawnSync('dot', [
        '-Tpng',
        '-o',
        './data/parser.png',
        './data/parser.dot'
    ], {
        cwd: __dirname
    })

    // Now, kill the DOT file
    child.spawnSync('rm', ['./data/parser.dot'], { cwd: __dirname })
})
