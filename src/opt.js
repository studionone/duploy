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

// Tokens
class Token {
    constructor(match, span) {
        this.match = match
        this.span = span
    }
}

class LongOptToken extends Token {}
class ShortOptToken extends Token {}
class CommandToken extends Token {}
class PathToken extends Token {}
class GlobalOptions extends Token {}
class LocalOptions extends Token {}

// Match
class Match {
    constructor(match) {
        this.match = match
    }
}

opt.Tokens = {
    LongOptToken,
    ShortOptToken,
    CommandToken,
    PathToken,
}

// Standard parsers
opt.longopt     = packrattle.regex(/\-\-[a-zA-Z]+/).named('Long Option').map((match, span) => new LongOptToken(match, span))
opt.shortopt    = packrattle.regex(/\-[a-zA-Z]/).named('Short Option').map((match, span) => new ShortOptToken(match, span))
opt.path        = packrattle.regex(/[a-zA-Z0-9\\\/ \.]+\.yml/).named('Path').map((match, span) => new PathToken(match, span))
opt.whitespace  = packrattle.regex(/[ \t]+/).named('Whitespace')

// Command parsers
opt.init        = packrattle.string('init').named('Command(Init)')
opt.now         = packrattle.string('now').named('Command(Now)')

// Parser combinators
opt.allCommands = packrattle
    .alt(opt.init, opt.now)
    .named('Command')
    .map((match, span) => new CommandToken(match, span))

opt.commandOrPath = packrattle
    .alt(opt.allCommands, opt.path)
    .named('Command or Path')

opt.options = packrattle
    .repeatSeparated(
        packrattle.alt(
            opt.longopt,
            opt.shortopt
        ).named('Long or Short Option'),
        opt.whitespace,
        { min: 1 }
    )

// Build our parser
opt.parser = packrattle([
    opt.options.named('Global Options').map((match, span) => {
        if (match !== '') return new GlobalOptions(match, span)
    }).optional(),
    opt.whitespace.optional().drop(),
    opt.commandOrPath,
    opt.whitespace.optional().drop(),
    opt.options.named('Local Options').map((match, span) => {
        if (match !== '') return new LocalOptions(match, span)
    }).optional(),
]).consume().map((match, span) => {
    console.log('Yep, matched!')
    console.log(match)

    return match[0]
})
