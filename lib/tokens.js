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

module.exports = {
    Token,
    Option,
    LongOpt,
    ShortOpt,
    Command,
    Path,
    Word,
}
