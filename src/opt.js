'use strict'

const R         = require('ramda')
const Either    = require('ramda-fantasy').Either

// doc: Matches defined via a thunk so we don't execute the curried functions
const matches = () => [
    [R.test(/init/g), () => Either.Right('init')],
    [R.isEmpty, () => Either.Left(new NoArgumentError())],
    [R.T, () => Either.Left(new NoMatchError())],
]

// Used for matching given command-line arguments to functions, via the Maybe
// monad and the R.cond pattern-matching function
//:: Array String -> Either Error ()
const parseOpt = (argv) => {
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

// doc: Error classes for parseOpt Either.Left
class NoMatchError extends Error {}
class NoArgumentError extends Error {}

// doc: Static module exports
module.exports = {
    parseOpt,

    // doc: Export the error classes for R.is checks
    NoMatchError,
    NoArgumentError
}
