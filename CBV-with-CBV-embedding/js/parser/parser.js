define(function(require) {

	var Token = require('parser/token');
	var Var = require('ast/var');
	var Operation = require('ast/operation');
	var Binding = require('ast/binding');
	var Reference = require('ast/reference');

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
				const id = this.term(ctx);
				id.ctx = [id].concat(id.ctx);
				this.lexer.match(Token.DEF);
				const P = this.term(ctx);
				this.lexer.match(Token.IN);
				const B = this.term([id].concat(ctx));
				return new Binding(ctx,id,P,B);
			} else if (this.lexer.skip(Token.NEW)) {
				const id = this.term(ctx);
				id.ctx = [id].concat(id.ctx);
				const P = this.term(ctx);
				this.lexer.match(Token.IN);
				const B = this.term([id].concat(ctx));
				return new Reference(ctx,id,P,B);
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
				return new Var(ctx, id);
			} else {
				return this.operation(ctx);
			}
		}

		// BUILT-IN OPERATIONS
		operation(ctx) {
			var name; var sig; var active;
			var eas = [];
			var das = [];

			var token = this.lexer.lookaheadType();
			switch(token) {
				case Token.PLUS:
					name = "+"; sig = [2,0]; active = true;
					break;
				case Token.TIMES:
					name = "*"; sig = [2,0]; active = true;
					break;
				case Token.AND:
					name = "∧"; sig = [2,0]; active = true;
					break;
				case Token.OR:
					name = "∨"; sig = [2,0]; active = true;
					break;
				case Token.NOT:
					name = "¬"; sig = [1,0]; active = true;
					break;
				case Token.EQUALS:
					name = "=="; sig = [2,0]; active = true;
					break;
				default:
					name = this.lexer.value(); sig = [0,0]; active = false;
					break;
			}
			this.lexer.match(token);
			if (sig[0] > 0)
				eas = this.gatherEAs(ctx,sig[0]);
			var das = [];
			return new Operation(ctx,sig,name,active,eas,das);
		}

		gatherEAs(ctx,type) {
			this.lexer.match(Token.LPAREN);
			var eas = [];
			for (var i = 0; i < type; i++) {
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
