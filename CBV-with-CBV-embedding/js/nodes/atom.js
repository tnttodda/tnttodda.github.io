define(function(require) {

	var Flag = require('token').Flag;

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

	}

	return Atom;
});
