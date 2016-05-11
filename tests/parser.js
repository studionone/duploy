/**
 * PEG parser, handwritten using "ramda", "ramda-fantasy" and "List-in-JS"
 */
'use strict'

// Top-level dependencies
const test      = require('../ramda-tapes')
const R         = require('ramda')
const Tokens    = require('../lib/tokens')

// Monadic data-structures
const List      = require('../lib/list')
const Stack     = require('../lib/stack')

// Monads
const Tuple     = require('ramda-fantasy').Tuple
const Maybe     = require('ramda-fantasy').Maybe
const Just      = Maybe.Just
const Nothing   = Maybe.Nothing

// Token classes
const Token         = Tokens.Token
const Option        = Tokens.Option
const LongOpt       = Tokens.LongOpt
const ShortOpt      = Tokens.ShortOpt
const Command       = Tokens.Command
const InitCommand   = Tokens.InitCommand
const Path          = Tokens.Path
const Word          = Tokens.Word

// Type aliases
// type TokenTuple = Tuple (Number, Token)

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
// function Parser(tokens) {
//     this.ast = List.empty
//     this.tokens = tokens
//     this.mode = 'global'
//
//     return this
// }

class Parser {
    constructor(tokens) {
        this.tokens = tokens
        this.ast = List.empty
        this.state = 'begin'
    }

    parse(tokens) {
        if (this.state === 'begin') {
            this.state = 'parsing'
            tokens = this.tokens
        }

        // Setup our current working token and cons/cars
        let token = tokens.head()
        let rest = tokens.tail()
        let parsed = Nothing()

        // Checks the type of the Tuple's 2nd value via R.is
        // tupleIs :: a -> Tuple -> Boolean
        const tupleIs = kind => R.compose(R.is(kind), Tuple.snd)

        const res = R.cond([
            [tupleIs(Option), opt => {
                const result = parseOption(opt, rest)
                rest = Tuple.fst(result)

                return Just(Tuple.snd(result))
            }],
            // [tupleIs(Command), _ => {
            //     const result =
            // }],
            [R.T, (_) => { console.log(_); throw new SyntaxError('Invalid token') }],
        ])(token)

        // Add parsed to AST if we've got a Just
        this.ast = R.ifElse(
            _ => Maybe.isJust(_),
            _ => this.ast.concat(_),
            _ => R.identity(this.ast)
        )(res)

        // Short circut the recursion
        if (rest.length() === 0) return this.ast

        return this.parse(rest)
    }
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
        let notAnotherToken = R.complement(
            R.anyPass([
                R.is(Option),
                R.is(Command),
                R.is(Path)
            ])
        )

        // isWordAndNotToken :: Token -> Boolean
        const isWordAndNotToken = R.allPass([
            R.is(Word),
            notAnotherToken,
        ])

        // extractAndTest :: TokenTuple -> Boolean
        const extractAndTest = R.compose(isWordAndNotToken, Tuple.snd)

        if (cont === true && extractAndTest(current)) {
            optionSet = optionSet.concat(List.of(current))

            return _parse(rest)
        } else {
            cont = false
            remaining = List.of(current).concat(rest)
        }
    }

    // Start parser
    if (rest.length() > 0) {
        _parse(rest)
    }

    return Tuple(remaining, optionSet)
}

test('testing out the lexer', t => {
    const input = '--hello -w init now testing.yml'
    const result = lexer('--hello argument -w init now testing.yml')

    t.is(result, List,
        'result should be a List')
    t.equal(result.length(), 6,
        'ast should have 5 tokens')
    t.tupleSndIs(result.head(), LongOpt,
        'First tokens value should be a LongOpt')
    t.end()
})

test('testing that the option parser handles arguments and returns a Tuple (List, List)', t => {
    const set = lexer('--hello testing world init testing.yml')
    const result = parseOption(set.head(), set.tail())

    t.equal(Tuple.snd(result).length(), 3,
        'result should have three tokens within')
    t.equal(Tuple.fst(result).length(), 2,
        'result should have two items remaining in Tuple')
    t.end()
})

test('test the parser works for options and arguments', t => {
    const tokens = lexer('--long hello -h')
    const parser = new Parser(tokens)
    const ast = parser.parse()

    t.equal(ast.length(), 2,
        'ast should have two branches')
    t.equal(ast.head().length(), 2,
        'ast head should have two tokens')
    t.equal(ast.tail().length(), 1,
        'ast tail should have one token')
    t.tupleSndIs(ast.head().head(), LongOpt,
        'first token should be a LongOpt')
    ast.tail().head().map(lastToken => {
        t.tupleSndIs(lastToken, ShortOpt,
            'ast tail Tuple.snd should be a ShortOpt')
    })
    t.end();
})

test('test the parser works for a single command, no arguments')
