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

// Build up our set of parsers
opt.option  = packrattle.regex(/\-\-[a-zA-Z]+/)
opt.word    = packrattle.regex(/[a-zA-Z]+/)

opt.parser = (argv) => {

}
