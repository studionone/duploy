'use strict'

const R         = require('ramda')
const Either    = require('ramda-fantasy').Either

// doc: Checking whether a given regex matches the given string
const isMatch = R.curry((regex, str) => RegExp(regex).exec(str) !== null)

// doc: Matches defined via a thunk so we don't execute the curried functions
const matches = () => [
    [isMatch(/init/g), () => Either.Right('init')],
    [R.T, () => Either.Left(new Error('No match given'))],
]

// Used for matching given command-line arguments to functions, via the Maybe
// monad and the R.cond ramda pattern-matching function
//:: [String] -> Maybe ()
const parseOpt = module.exports = (argv) => {
    // doc: Set our argv to always have a string
    if (argv.length < 2) argv = [argv[0], '']

    // doc: Builds our parseCond function via the thunked matches defined above
    const parseCond = R.cond(matches())

    return parseCond(argv[1])
}
