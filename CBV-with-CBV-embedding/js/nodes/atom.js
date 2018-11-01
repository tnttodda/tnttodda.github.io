define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Expo = require('nodes/expo');

	class Atom extends Expo {

		constructor(name) {
			super("circle", "", name);
			this.height = 0.1;
			this.width = 0.1;
		}

		transition(token, link) {
			return null;
		}

		rewrite(token, nextLink) {
			return null;
		}

		copy() {
			return null;
		}

		transition(token, link) {
			if (link.to == this.key) {
				if (token.rewriteFlag == Flag.SEARCH) {
					token.rewriteFlag = Flag.RETURN;
					return link;
				}
			}
		}

	}

	return Atom;
});
