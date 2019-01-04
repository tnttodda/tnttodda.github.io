define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');

	class Atom extends Node {

		constructor(name) {
			super("circle", "", name);
			this.height = 0.1;
			this.width = 0.1;
			this.atom = true;
		}

	}

	return Atom;
});
