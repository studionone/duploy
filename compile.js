#!/usr/bin/env node
'use strict'

// Dependencies for compilation
const os = require('os')
const enclose = require('enclose')

// Build out our flags for cross-platform compilation
let flags = []
const platform = os.platform
const arch = enclose.system()
const compile = enclose.exec
const windows = (platform === 'win32')
const exe = windows ? '.exe' : ''
if (arch === 'x64') flags.push('--x64')
let suff = '-DEV'
if (process.env.NODE_ENV === 'production') suff = ''

flags.push('--output', './build/duploy' + suff + exe)
flags.push('./src/duploy.js')
compile(flags)
