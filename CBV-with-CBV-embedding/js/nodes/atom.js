define(function(require) {

	var Flag = require('token').Flag;

	var Expo = require('nodes/expo');

	class Atom extends Expo {

		constructor(name) {
			super(null, "o", name);
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
