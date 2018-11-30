define(function(require) {

	var Node = require('node');
	var Flag = require('token').Flag;

	class Start extends Node {

		constructor() {
			super("point", "");
		}

		transition(token) {
			return this.findLinksOutOf(null)[0];
		}

		copy() {
			return new Start();
		}

		draw(level) {
			return level + this.key + '[shape=' + this.shape + '];';
		}

	}

	return Start;
});
