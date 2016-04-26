'use strict'

const R       = require('ramda-maybe')
const Maybe   = require('ramda-fantasy').Maybe
const Just    = Maybe.Just
const Nothing = Maybe.Nothing

const isMatch = R.curry((regex, str) => RegExp(regex).exec(str) !== null)

const parseOpt = module.exports = (argv) => {
    // Set our argv to always have a string
    if (argv.length < 2) {
        argv = [argv[0], '']
    }

    return R.cond([
        [isMatch(/init/g), () => Just('init')],
        [R.T, () => Nothing()]
    ])(argv[1])
}
