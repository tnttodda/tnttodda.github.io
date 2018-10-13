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

		//  T ::= BIND LCID DEF term IN term  (BIND x = PARAM in BODY)
		//      | NEW  LCID IN term           (NEW x = PARAM in BODY)
		//      | op? ( EAS ; DAS )

		term(ctx) {
			if (this.lexer.skip(Token.BIND)) {
				const id = this.lexer.token(Token.LCID);

				if (this.lexer.skip(Token.DEF)) {        
					const P = this.term(ctx);
					this.lexer.match(Token.IN);
					const B = this.term([id].concat(ctx));
					return new Binding(id,P,B);
				}
			} else if (this.lexer.skip(Token.NEW)) {
				const id = this.lexer.token(Token.LCID);

				if (this.lexer.skip(Token.DEF)) {        
					const P = this.term(ctx);
					this.lexer.match(Token.IN);
					const B = this.term([id].concat(ctx));
					return new Reference(id,P,B);
				}
			} else {
				return this.atom(ctx);
			}
		}

		// atom ::= LPAREN term RPAREN
		//        | LCID
		atom(ctx) {
			if (this.lexer.skip(Token.LPAREN)) {
				const term = this.term(ctx);
				this.lexer.match(Token.RPAREN);
				return term;
			} else if (this.lexer.next(Token.LCID)) {
				const id = this.lexer.token(Token.LCID);
				return new Var(ctx.indexOf(id), id);
			} else {
				return this.operation(ctx);
			}
		}

		// op ::= 
		operation(ctx) {
			if (this.lexer.skip(Token.PLUS)) {
				var eas = this.gatherEAs(ctx,2);
				return new Operation(2,"+",eas,[]);
			} else if (this.lexer.next(Token.INT)) {
				const n = this.lexer.token(Token.INT);
				return new Operation(0,n,[],[]);
			} else {
				console.log("no");
				return undefined;
			}
		}

		gatherEAs(ctx,type) {
			this.lexer.match(Token.LPAREN);
			var eas = [];
			for (var i = 0; i < type; i++) {
				console.log(" >" + parseInt(i));
				const term = this.term(ctx);
				eas.push(term);
				if (this.lexer.next(Token.COMMA)) {
					this.lexer.match(Token.COMMA);
				}
			}
			this.lexer.match(Token.RPAREN);
			return eas;
		}

	}

	return Parser;
});
