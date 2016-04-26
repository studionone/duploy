/**
 * Custom exceptions
 */
'use strict'

const defineError   = require('./util').defineError

/**
 * Module definition
 */
let exceptions = exports

// doc: Exceptions for "opt" module
exceptions.Opt = {}
exceptions.Opt.NoArgumentError = defineError('NoArgumentError')
exceptions.Opt.NoMatchError = defineError('NoMatchError')

// doc: Exceptions for "host" module
exceptions.Host = {}

// doc: Exceptions for "docker" module
exceptions.Docker = {}
