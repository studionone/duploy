'use strict'

const test      = require('../ramda-tapes')
const R         = require('ramda')
const List      = require('../lib/list')
const Stack     = require('../lib/stack')
const Tuple     = require('ramda-fantasy').Tuple
const Maybe     = require('ramda-fantasy').Maybe
const Just      = Maybe.Just
const Nothing   = Maybe.Nothing

// Type definitions
//
// type TokenTuple = Tuple (Number, Token)
//

// Base Token class
class Token {}

// Base Option token
class Option extends Token {
    constructor(opt) { super(); this.option = opt }
}

// Actual Option tokens
class LongOpt extends Option {}
class ShortOpt extends Option {}

// Command token
class Command extends Token {
    constructor(name) { super(); this.command = name }
}

// Path token
class Path extends Token {
    constructor(fpath) { super(); this.path = fpath }
}

// Base Word token
class Word extends Token {
    constructor(text) { super(); this.text = text }
}

// lexer :: String -> [Token]
function lexer(initial) {
    // Ensure our input is a string and ends with whitespace
    const input = R.defaultTo('', initial) + '\n'
    // Setup our internal variables
    let curr='', i=0

    // compact :: [Maybe a] -> [Maybe a]
    const onlyJust = _ => Maybe.isJust(_)

    // Internal lexer implementation
    // lexerFn :: String -> Tuple (Number, Token)
    const lexerFn = (char) => {
        i = i + 1 // Increase our character index

        // If whitespace, finish building curr and tokenize
        if (R.test(/[\t\n ]/, char)) {
            let token = tokenize(curr, i)

            if (Maybe.isJust(token)) {
                const charNo = i - curr.length
                curr = ''

                // NOTE: This uses unsafe `Maybe.value` property access, as we
                // have a Maybe.isJust() check above
                return Just(Tuple(charNo, token.value))
            }
        }

        // Add our new character to the accumulated to check on next tokenization
        curr = curr + char

        // TODO: Make this use a Maybe instead of a nullable return
        return Nothing()
    }

    return R.compose(
        list => list.map(j => j.value),
        list => list.filter(onlyJust),
        arr => new List(arr),
        R.map(lexerFn)
    )(input)
}

// tokenize :: String -> Maybe Token
function tokenize(lexeme) {
    // Grab the 2nd element of set
    // _2nd :: [a] -> Int -> a
    const _2nd = R.nth(1)

    // Compose pull match
    // matchToToken :: Regex -> Function
    const matchToToken =
        R.curry((regex, cb) =>
            R.pipe(R.match(regex), _2nd, cb))

    // NOTE: All matches _must_ have a capture group in them
    const matchLongOpt = /^\-\-([a-zA-Z]+)$/
    const matchShortOpt = /^\-([a-zA-Z])$/
    const matchCommand = /^(init|now)$/
    const matchPath = /^([a-zA-Z0-9\\\/ \.]+\.yml)$/
    const matchWord = /^([a-zA-Z\d\-\+]+)$/

    return Maybe.of(
        R.cond([
            [R.test(matchLongOpt), matchToToken(matchLongOpt)(_ => new LongOpt(_))],
            [R.test(matchShortOpt), matchToToken(matchShortOpt)(_ => new ShortOpt(_))],
            [R.test(matchCommand), matchToToken(matchCommand)(_ => new Command(_))],
            [R.test(matchPath), matchToToken(matchPath)(_ => new Path(_))],
            [R.test(matchWord), matchToToken(matchWord)(_ => new Word(_))],

            // Default case
            [R.T, _ => null]
        ])(lexeme)
    )
}

// Parser for a stream of tokens
// parser :: List Tuple (Number, Token) -> Ast
function Parser(tokens) {
    this.ast = List.empty
    this.tokens = tokens
    this.mode = 'global'

    return this
}

Parser.prototype.parse = function (tokens) {
    // Default our tokens
    tokens = R.defaultTo(this.tokens)(tokens)
    let token = tokens.head()
    let rest = tokens.tail()

    // Checks the type of the Tuple's 2nd value via R.is
    // tupleIs :: a -> Tuple -> Boolean
    const tupleIs = kind => R.compose(R.is(kind), Tuple.snd)

    const res = R.cond([
        [tupleIs(Option), _ => {
            const result = parseOption(_, rest)
            rest = Tuple.fst(result)
            parsed = Tuple.snd(result)
            this.ast = this.ast.concat(List.of(parsed))
        }],
        [tupleIs(Command), _ => {

        }]
        [R.T, () => { throw new SyntaxError('Invalid token') }]
    ])(token)

    return this.parse(rest)
}


// Recursive decent parser for options & arguments
// parseOption :: TokenTuple -> List TokenTuple -> List TokenTuple
function parseOption(option, rest) {
    let i=0, cont=true, remaining=rest
    let optionSet = List.of(option)

    // Debug check
    if (R.is(Option)(Tuple.snd(option)) === false) {
        throw new Error('parseOption has received a token that is not an Option', option)
    }

    // _parse :: List TokenTuple -> ()
    const _parse = (tokens) => {
        // current :: TokenTuple
        let current = tokens.head()
        // rest :: List TokenTuple
        let rest = tokens.tail()

        // Util function for checking if it's a different token, finishing parsing
        // notAnotherToken :: Token -> Boolean
        let notAnotherToken =
            _ => R.anyPass([
                R.is(Option),
                R.is(Command),
                R.is(Path)
            ])(_) === false

        if (cont === true
         && R.is(Word)(Tuple.snd(current))
         && notAnotherToken(Tuple.snd(current))) {
            optionSet = optionSet.concat(List.of(current))

            return _parse(rest)
        } else {
            cont = false
            remaining = List.of(current).concat(rest)
        }
    }

    // Start parser
    _parse(rest)

    return Tuple(remaining, optionSet)
}

test('testing out the above defined lexer', t => {
    const input = '--hello -w init now testing.yml'
    const result = lexer('--hello argument -w init now testing.yml')

    t.is(result, List,
        'result should be a List')
    t.equal(result.length(), 6,
        'ast should have 5 tokens')
    t.tupleSndIs(result.head(), LongOpt,
        'First tokens value should be a LongOpt')
    t.tupleSndIs()
    t.end()
})

test('option & argument parser builds a List', t => {
    const set = lexer('--hello testing world init testing.yml')
    const result = parseOption(set.head(), set.tail())

    t.equal(Tuple.snd(result).length(), 3,
        'result should have three tokens within')
    t.equal(Tuple.fst(result).length(), 2,
        'result should have two items remaining in Tuple')
    t.end()
})
