define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');

	class Instance extends Node {

		constructor(name) {
			super("circle", "I", name);
			this.height = 0.4;
			this.width = 0.4;
		}

	}

	return Instance;
});
