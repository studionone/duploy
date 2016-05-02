/**
 * Functional option/command parser for CLI arguments
 *
 * TODO: Swap out this R.test-based hard-coded parser for a proper parser combinator implementation
 */
'use strict'

const R                 = require('ramda')
const packrattle        = require('packrattle')
const Either            = require('ramda-fantasy').Either
const NoArgumentError   = require('./exceptions').Opt.NoArgumentError
const NoMatchError      = require('./exceptions').Opt.NoMatchError

/**
 * Top-level module wrapper
 */
let opt = exports

// doc: Matches defined via a thunk so we don't execute the curried functions
const matches = () => [
    [R.test(/init/g), () => Either.Right('init')],
    [R.isEmpty, () => Either.Left(new NoArgumentError())],
    [R.T, () => Either.Left(new NoMatchError())],
]

// Used for matching given command-line arguments to functions, via the Maybe
// monad and the R.cond pattern-matching function
// parseOpt :: Array String -> Either Error ()
opt.parseOpt = (argv) => {
    // doc: Set our argv to always have a string
    if (argv.length < 2) argv = [argv[0], '']

    // doc: Builds our parseCond function via the thunked matches defined above
    const parseCond = R.cond(matches())

    return R.compose(
        parseCond,
        R.toLower,
        R.trim
    )(argv[1])
}

// Util method for concatentating an argv array to a string, minus the first element
// combineArgv :: [String] -> String
opt.combineArgv = (argv) => R.trim(argv.slice(1).reduce((v, i) => v + ' ' + i, ''))

// Standard parsers
opt.longopt     = packrattle.regex(/\-\-[a-zA-Z]+/)
opt.shortopt    = packrattle.regex(/\-[a-zA-Z]/)
opt.word        = packrattle.regex(/[a-zA-Z]+/)
opt.path        = packrattle.regex(/[a-zA-Z0-9\\\/ \.]+\.yml/)
opt.whitespace  = packrattle.regex(/[ \t]+/)

// Command parsers
opt.init        = packrattle.string('init')
opt.now         = packrattle.string('now')

// Parser combinators
opt.allCommands     = packrattle.alt(opt.init, opt.now)
opt.command         = packrattle.seq(opt.allCommands, opt.path)
opt.commandOrPath   = packrattle.alt(opt.allCommands, opt.path)
opt.options         = packrattle.repeatSeparated(packrattle.alt(opt.longopt, opt.shortopt), opt.whitespace, { min: 0 })

// Build our parser
opt.parser = packrattle.repeatSeparated([
    opt.options.optional(),
    opt.commandOrPath
],  opt.whitepace)
