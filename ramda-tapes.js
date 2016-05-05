/**
 * Module to combine powerful Ramda-based assertions with the "tapes" TAP testing framework (itself an
 * extension of the "tape" testing utility)
 */
'use strict'

const tape          = require('tapes')
const addAssertions = require('extend-tape')
const R             = require('ramda')
const RF            = require('ramda-fantasy')


const assertions = {
    // doc: Overloading the t.is method to check a type against a constructor instead
    is(instance, type, message) {
         this.equal(R.is(type)(instance), true, message)
    },

    isEitherLeft(instance, message) {
        if (R.test(/^Either/, R.toString(instance))) {
            this.equal(instance.isLeft, true, message)
        } else {
            this.fail(`Value must be an instance of Either: ${instance.constructor.name} given`)
        }
    },

    isEitherRight(instance, message) {
        if (R.test(/^Either/, R.toString(instance))) {
            this.equal(instance.isRight, true, message)
        } else {
            this.fail(`Value must be an instance of Either: ${instance.constructor.name} given`)
        }
    },

    isMaybeJust(instance, message) {
        if (R.test(/^Maybe/), R.toString(instance)) {
            this.equal(instance.isJust, true, message)
        } else {
            this.fail(`Value must be an instance of Maybe: ${instance.constructor.name} given`)
        }
    },

    isMaybeNothing(instance, message) {
        if (R.test(/^Maybe/), R.toString(instance)) {
            this.equal(instance.isNothing, true, message)
        } else {
            this.fail(`Value must be an instance of Maybe: ${instance.constructor.name} given`)
        }
    },

    tupleFstIs(instance, type, message) {
        this.is(RF.Tuple.fst(instance), type, message)
    },

    tupleSndIs(instance, type, message) {
        this.is(RF.Tuple.snd(instance), type, message)
    },
}

// Bind the assertions
const test = addAssertions(tape, assertions)

module.exports = test
