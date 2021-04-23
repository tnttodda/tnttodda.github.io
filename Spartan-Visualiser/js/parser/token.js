define(function() {
  class Token {
    /**
     * type should be one of the valid token types list below, and value is an
     * optional value that can carry any extra information necessary for a given
     * token type. (e.g. the matched string for an identifier)
     */
    constructor(type, value, pred) {
      this.type = type;
      this.value = value;
      this.pred = pred;
    }
  }

  [
    'EOF', // we augment the tokens with EOF, to indicate the end of the input.
    'LCID',

    'LPAREN',
    'RPAREN',
    'SEMIC',
    'BOUND',
    'DOT',

    'BIND',
    'NEW',
    'DEF',
    'IN',

    'PAIR',
    'FST',
    'SND',
    'SUCC',
    'PLUS',
    'MINUS',
    'TIMES',
    'INT',
    'MOD',
    'LEQ',
    'AND',
    'OR',
    'NOT',
    'TRUE',
    'FALSE',
    'EQUALS',

    'IF',
    'LAMBDA',
    'APP',
    'REF',
    'DEREF',
    'ASSIGN',
    'UNIT',
    'SEC',
    'REC',
    'ABORT',
    'CALLCC',
    'BLOCK',
    'BREAK',
    'CONTINUE',
    'RETURN',
    
    'COIN'
  ].forEach(token => Token[token] = token);

  return Token;
});
