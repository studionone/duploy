'use strict'

const test      = require('../ramda-tapes')
const R         = require('ramda')
const List      = require('../lib/list')
const Tuple     = require('ramda-fantasy').Tuple
const Maybe     = require('ramda-fantasy').Maybe
const Just      = Maybe.Just
const Nothing   = Maybe.Nothing

// Tokens
function LongOpt(opt)  { this.option = opt }
function ShortOpt(opt) { this.option = opt }
function Command(name) { this.command = name }
function Path(fpath)   { this.path = fpath }

// lexer :: String -> [Token]
function lexer(initial) {
    // Ensure our input is a string and ends with whitespace
    const input = R.defaultTo('', initial) + '\n'
    // Setup our internal variables
    let curr='', i=0

    // notNil :: a -> Boolean
    const notNil = R.complement(R.isNil)

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
        ll => ll.map(j => j.value),
        ll => ll.filter(onlyJust),
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
    const matchToToken = R.curry((regex, n) => R.pipe(R.match(regex), _2nd, n))

    // NOTE: All matches _must_ have a capture group in them
    const matchLongOpt = /^\-\-([a-zA-Z]+)$/;
    const matchShortOpt = /^\-([a-zA-Z])$/;
    const matchCommand = /^(init|now)$/;
    const matchPath = /^([a-zA-Z0-9\\\/ \.]+\.yml)$/;

    return Maybe.of(
        R.cond([
            [R.test(matchLongOpt), matchToToken(matchLongOpt)(_ => new LongOpt(_))],
            [R.test(matchShortOpt), matchToToken(matchShortOpt)(_ => new ShortOpt(_))],
            [R.test(matchCommand), matchToToken(matchCommand)(_ => new Command(_))],
            [R.test(matchPath), matchToToken(matchPath)(_ => new Path(_))],

            // Default case
            [R.T, _ => null]
        ])(lexeme)
    )
}

// Parser for a stream of tokens
// parser :: [Maybe Tuple (Number, Token)] -> Ast
function parser(tokens) {
}

test('testing out the above defined lexer/paser', t => {
    const input = '--hello -w init now testing.yml'
    const result = lexer('--hello -w init now testing.yml')

    t.is(result, List,
        'result should be a List')
    t.equal(result.length(), 5,
        'ast should have 5 tokens')
    t.tupleSndIs(result.head(), LongOpt,
        'First tokens value should be a LongOpt')
    t.end()
})
