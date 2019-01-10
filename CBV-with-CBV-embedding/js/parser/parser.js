define(function(require) {

	var Token = require('parser/token');
	var Var = require('ast/var');
	var Operation = require('ast/operation');
	var Binding = require('ast/binding');
	var Reference = require('ast/reference');
	var Thunk = require('ast/thunk');

	class Parser {
		constructor(lexer) {
			this.lexer = lexer;
		}

		parse() {
			const result = this.term([[],[]]);
			// make sure we consumed all the program, otherwise there was a syntax error
			this.lexer.match(Token.EOF);
			return result;
		}

		//  T ::= BIND LCID DEF term IN term  (BIND x = PARAM in BODY)
		//      | NEW  LCID IN term           (NEW x = PARAM in BODY)
		//      | op? ( EAS ; DAS )

		term(ctx,thunk) {
			if (thunk) {
				var bounds = [];
				while (this.lexer.lookaheadType() == Token.BOUND) {
					bounds = bounds.concat(this.lexer.token(Token.BOUND));
					this.lexer.match(Token.DOT);
				}
				const inner = this.term([bounds.concat(ctx[0]),ctx[1]]);
				return new Thunk(ctx,inner,bounds);
			} else {
				if (this.lexer.skip(Token.BIND)) {
					const id = this.lexer.token(Token.LCID);
					this.lexer.match(Token.DEF);
					const P = this.term(ctx);
					this.lexer.match(Token.IN);
					const B = this.term([[id].concat(ctx[0]),ctx[1]]);
					return new Binding(ctx,id,P,B);
				} else if (this.lexer.skip(Token.NEW)) {
					const id = this.lexer.token(Token.LCID);
					this.lexer.match(Token.DEF);
					const P = this.term(ctx);
					this.lexer.match(Token.IN);
					const B = this.term([ctx[0],[id].concat(ctx[1])]);
					return new Reference(ctx,id,P,B);
				} else {
					return this.atom(ctx);
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
			} else if (this.lexer.next(Token.LCID)) {
				const name = this.lexer.token(Token.LCID);
				return new Var(ctx, name);
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
				case Token.SUCC:
					name = "++"; sig = [1,0]; active = true;
					break;
				case Token.PLUS:
					name = "+"; sig = [2,0]; active = true;
					break;
				case Token.MINUS:
					name = "-"; sig = [2,0]; active = true;
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
				case Token.IF:
					name = "if"; sig = [1,2]; active = true;
					break;
				case Token.LAMBDA:
					name = "λ"; sig = [0,1]; active = false;
					break;
				case Token.APP:
					name = "@"; sig = [2,0]; active = true;
					break;
				case Token.REF:
					name = "ref"; sig = [1,0]; active = true;
					break;
				case Token.DEREF:
					name = "!"; sig = [1,0]; active = true;
					break;
				case Token.ASSIGN:
					name = ":="; sig = [2,0]; active = true;
					break;
				case Token.UNIT:
					name = "()"; sig = [0,0]; active = false;
					break;
				case Token.SEC:
					name = ";"; sig = [1,1]; active = true;
					break;
				case Token.REC:
					name = "μ"; sig = [0,1]; active = true;
					break;
				case Token.ABORT:
					name = "abort"; sig = [0,1]; active = true;
					break;
				case Token.CALLCC:
					name = "callcc"; sig = [0,1]; active = true;
					break;
				case Token.SCOPE:
					name = "scope"; sig = [0,1]; active = true;
					break;
				case Token.BREAK:
					name = "break"; sig = [1,0]; active = true;
					break;
				case Token.CONTINUE:
					name = "cont."; sig = [1,0]; active = true;
					break;
				default:
					name = this.lexer.value(); sig = [0,0]; active = false;
					break;
			}
			this.lexer.match(token);
			if (active) {
				this.lexer.match(Token.LPAREN);
				eas = this.gatherArgs(ctx,sig[0],false);
				if (sig[1] == 0)
					this.lexer.match(Token.RPAREN);
			}
			if (sig[1] > 0) {
				if (!active)
					this.lexer.match(Token.LPAREN);
				this.lexer.match(Token.SEMIC);
				das = this.gatherArgs(ctx,sig[1],true);
				this.lexer.match(Token.RPAREN);
			}
			return new Operation(ctx,sig,name,active,eas,das);
		}

		gatherArgs(ctx,type,thunk) {
			var args = [];
			for (var i = 0; i < type; i++) {
				const term = this.term(ctx,thunk);
				args.push(term);
				if (this.lexer.next(Token.COMMA)) {
					this.lexer.match(Token.COMMA);
				}
			}
			return args;
		}

	}

	return Parser;
});
