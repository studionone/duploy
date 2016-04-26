/**
 * Module to combine powerful Ramda-based assertions with the "tapes" TAP testing framework (itself an
 * extension of the "tape" testing utility)
 */
'use strict'

const tape          = require('tapes')
const addAssertions = require('extend-tape')
const R             = require('ramda')
const RF            = require('ramda-fantasy')

const test = addAssertions(tape, {
    // doc: Overloading the t.is method to check a type against a constructor instead
    is(instance, type, message) {
         this.equal(R.is(type)(instance), true, message)
    },

    isEitherLeft(instance, message) {
        if (R.match(/^Either/, instance.toString())) {
            this.equal(instance.isLeft, true, message)
        } else {
            this.fail('Value must be an instance of Either')
        }
    },

    isEitherRight(instance, message) {
        if (R.match(/^Either/, instance.toString())) {
            this.equal(instance.isRight, true, message)
        } else {
            this.fail('Value must be an instance of Either')
        }
    },
})

module.exports = test
