'use strict'

const test  = require('../ramda-tapes')
const R     = require('ramda')

// Tokens
function LongOpt(opt)  { this.option = opt }
function ShortOpt(opt) { this.option = opt }
function Command(name) { this.command = name }
function Path(fpath)   { this.path = fpath }

// lexer :: String -> [Token]
function lexer(input) {
    let ast = []
    let curr = ''
    let i = 0
    input = R.defaultTo('', input) + ' '

    const lexer = (char) => {
        i = i + 1 // Increase our character index
        // console.log(i)
        // If whitespace, finish lexing and tokenize
        if (R.test(/[\t ]/, char) || i == input.length) {
            let token = tokenize(curr, i)

            if (token !== null) {

                ast.push({
                    token: token,
                    pos: i - curr.length,
                })
                curr = ''

                return
            }
        }

        curr = curr + char
    }

    R.map(lexer)(input)

    return ast
}


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

    return R.cond([
        [R.test(matchLongOpt), matchToToken(matchLongOpt)(_ => new LongOpt(_))],
        [R.test(matchShortOpt), matchToToken(matchShortOpt)(_ => new ShortOpt(_))],
        [R.test(matchCommand), matchToToken(matchCommand)(_ => new Command(_))],
        [R.test(matchPath), matchToToken(matchPath)(_ => new Path(_))],

        // Default case
        [R.T, _ => null]
    ])(lexeme)
}

test('testing out the above defined lexer/paser', t => {
    const input = '--hello -w init now testing.yml'
    const result = lexer('--hello -w init now testing.yml')

    t.equal(result.length, 5,
        'ast should have 5 tokens')
    t.end()
})
