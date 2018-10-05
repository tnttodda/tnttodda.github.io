define(function(require) {

  var Token = require('parser/token');
  var Var = require('ast/var');
  var Atom = require('ast/atom');
  var Operation = require('ast/operation');
  var Binding = require('ast/binding');
  var Reference = require('ast/reference');
  var Thunk = require('ast/thunk');

  class Parser {
    constructor(lexer) {
      this.lexer = lexer;
    }

    parse() {
      const result = this.term([]);
      // make sure we consumed all the program, otherwise there was a syntax error
      this.lexer.match(Token.EOF);
      
      return result;
    }

    //  T ::= BIND LCID DEF term IN term  (LET x = PARAM in BODY)
    //      | NEW  LCID IN term           (NEW x = PARAM in BODY)
    //      | op? ( EAS ; DAS )

    term(ctx) {
      if (this.lexer.skip(Token.LET)) {
        const id = this.lexer.token(Token.LCID);
        
        if (this.lexer.skip(Token.DEFINE)) {        
          const P = this.term(ctx);
          this.lexer.match(Token.IN);
          const B = this.term([id].concat(ctx));
          return new Binding(id,P,B);
        }
      }
      if (this.lexer.skip(Token.NEW)) {
        const id = this.lexer.token(Token.LCID);
        
        if (this.lexer.skip(Token.DEFINE)) {        
          const P = this.term(ctx);
          this.lexer.match(Token.IN);
          const B = this.term([id].concat(ctx));
          return new Reference(id,P,B);
        }
      }
    }

    // atom ::= LPAREN term RPAREN
    //        | LCID
    atom(ctx) {
      if (this.lexer.skip(Token.LPAREN)) {
        const term = this.term(ctx);
        this.lexer.match(Token.RPAREN);
        return term;
      } 
      else if (this.lexer.next(Token.LCID)) {
        const id = this.lexer.token(Token.LCID);
        return new Variable(ctx.indexOf(id), id);
      } 
      else {
        return undefined;
      }
    }
  }

  return Parser;
});
