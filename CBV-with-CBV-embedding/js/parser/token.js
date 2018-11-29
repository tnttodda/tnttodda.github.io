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

    'BIND',
    'NEW',
    'DEF',
    'IN',

    'PLUS',
    'TIMES',
    'INT',
    'AND',
    'OR',
    'NOT',
    'TRUE',
    'FALSE',
    'EQUALS'
  ].forEach(token => Token[token] = token);

  return Token;
});
