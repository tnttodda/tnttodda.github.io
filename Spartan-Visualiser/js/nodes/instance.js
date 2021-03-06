define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');

	class Instance extends Node {

		constructor(name) {
			super("circle", "", name);
			this.height = 0;
			this.width = 0;
		}

		copy() {
			return new Instance();
		}

	}

	return Instance;
});
