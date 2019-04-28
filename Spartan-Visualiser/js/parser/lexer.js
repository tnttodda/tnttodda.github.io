define(function(require) {

	var Token = require('parser/token');

	class Lexer {
		constructor(input) {
			this._input = input;
			this._index = 0;
			this._token = undefined;
			this._nextToken();
		}

		/**
		 * Return the next char of the input or '\0' if we've reached the end
		 */
		_nextChar() {
			if (this._index >= this._input.length) {
				return '\0';
			}

			return this._input[this._index++];
		}

		/**
		 * Set this._token based on the remaining of the input
		 *
		 * This method is meant to be private, it doesn't return a token, just sets
		 * up the state for the helper functions.
		 */
		_nextToken() {
			let c;
			do {
				c = this._nextChar();
			} while (/\s/.test(c));

			switch (c) {
			case ',':
				this._token = new Token(Token.COMMA);
				break;

			case '.':
				this._token = new Token(Token.DOT);
				break;

			case ';':
				this._token = new Token(Token.SEMIC);
				break;

			case '(':
				this._token = new Token(Token.LPAREN);
				break;

			case ')':
				this._token = new Token(Token.RPAREN);
				break;

			case '\0':
				this._token = new Token(Token.EOF);
				break;

			case '=':
				this._token = new Token(Token.DEF);
				break;

			default:
				// text for string
				if (/[a-zA-Z]|'/.test(c)) {
					let str = '';
					do {
						str += c;
						c = this._nextChar();

					} while (/[a-zA-Z]|'|_/.test(c));

					if (c == ".") str += c;
					// put back the last char which is not part of the identifier
					this._index--;

					if (str == "bind")
						this._token = new Token(Token.BIND);
					else if (str == "in")
						this._token = new Token(Token.IN);
					else if (str == "new")
						this._token = new Token(Token.NEW);
					else if (str == "PAIR")
						this._token = new Token(Token.PAIR)
					else if (str == "FST")
						this._token = new Token(Token.FST)
					else if (str == "SND")
						this._token = new Token(Token.SND)
					else if (str == "SUCC")
						this._token = new Token(Token.SUCC)
					else if (str == "PLUS")
						this._token = new Token(Token.PLUS);
					else if (str == "MINUS")
						this._token = new Token(Token.MINUS);
					else if (str == "TIMES")
						this._token = new Token(Token.TIMES);
					else if (str == "MOD")
						this._token = new Token(Token.MOD);
					else if (str == "LEQ")
						this._token = new Token(Token.LEQ);
					else if (str == "AND")
						this._token = new Token(Token.AND);
					else if (str == "OR")
						this._token = new Token(Token.OR);
					else if (str == "NOT")
						this._token = new Token(Token.NOT);
					else if (str == "EQUALS")
						this._token = new Token(Token.EQUALS);
					else if (str == "IF")
						this._token = new Token(Token.IF);
					else if (str == "LAMBDA")
						this._token = new Token(Token.LAMBDA);
					else if (str == "APP")
						this._token = new Token(Token.APP);
					else if (str == "REF")
						this._token = new Token(Token.REF);
					else if (str == "DEREF")
						this._token = new Token(Token.DEREF);
					else if (str == "ASSIGN")
						this._token = new Token(Token.ASSIGN);
					else if (str == "UNIT")
						this._token = new Token(Token.UNIT);
					else if (str == "SEC")
						this._token = new Token(Token.SEC);
					else if (str == "REC")
						this._token = new Token(Token.REC);
					else if (str == "ABORT")
						this._token = new Token(Token.ABORT);
					else if (str == "CALLCC")
						this._token = new Token(Token.CALLCC);
					else if (str == "SCOPE")
						this._token = new Token(Token.SCOPE);
					else if (str == "BREAK")
						this._token = new Token(Token.BREAK);
					else if (str == "CONTINUE")
						this._token = new Token(Token.CONTINUE);
					else if (str == "RETURN")
						this._token = new Token(Token.RETURN);
					else if (str == "TRUE")
						this._token = new Token(Token.TRUE, true);
					else if (str == "FALSE")
						this._token = new Token(Token.FALSE, false);
					else if (str.endsWith("."))
						this._token = new Token(Token.BOUND, str.substring(0,str.length-1))
					else
						this._token = new Token(Token.LCID, str);
				}

				// text for numbers
				else if (/[0-9]/.test(c)) {
					let str = '';
					do {
						str += c;
						c = this._nextChar();
					} while (/[0-9]/.test(c));

					// put back the last char which is not part of the identifier
					this._index--;
					this._token = new Token(Token.INT, parseInt(str));
				}
				else {
					this.fail();
				}
			}
		}

		/**
		 * Assert that the next token has the given type, return it, and skip to the
		 * next token.
		 */
		token(type) {
			if (!type) {
				return this._token.value;
			}

			const token = this._token;
			this.match(type);
			return token.value;
		}

		value() {
			return this._token.value;
		}

		lookahead() {
			return this._token;
		}

		lookaheadType() {
			return this._token.type;
		}

		/**
		 * Throw an unexpected token error - ideally this would print the source
		 * location
		 */
		fail() {
			throw new Error(`Unexpected token at offset ${this._index}`);
		}

		/**
		 * Returns a boolean indicating whether the next token has the given type.
		 */
		next(type) {
			return this._token.type == type;
		}

		/**
		 * Assert that the next token has the given type and skip it.
		 */
		match(type) {
			if (this.next(type)) {
				this._nextToken();
				return;
			}
			console.error(`${this._index}: Invalid token: Expected '${type}' found '${this._token.type}'`);
			throw new Error('Parse Error');
		}

		/**
		 * Same as `next`, but skips the token if it matches the expected type.
		 */
		skip(type) {
			if (this.next(type)) {
				this._nextToken();
				return true;
			}
			return false;
		}
	}

	return Lexer;
});
