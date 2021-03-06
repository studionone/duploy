/**
 * Token class heirarchy for the lexer/parser
 */
'use strict'

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

class InitCommand extends Command {
    constructor() { super('init') }
}

// Path token
class Path extends Token {
    constructor(fpath) { super(); this.path = fpath }
}

// Base Word token
class Word extends Token {
    constructor(text) { super(); this.text = text }
}

module.exports = {
    Token,
    Option,
    LongOpt,
    ShortOpt,
    Command,
    InitCommand,
    Path,
    Word,
}
