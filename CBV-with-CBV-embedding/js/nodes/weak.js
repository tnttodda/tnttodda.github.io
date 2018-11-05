define(function(require) {

	var Node = require('node');

	class Weak extends Node {

		constructor() {
			super(null, 'C0');
		}

		copy() {
			return new Weak();
		}

	}

	return Weak;
});
