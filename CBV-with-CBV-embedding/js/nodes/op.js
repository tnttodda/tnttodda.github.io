define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');
	var Link = require('link');

	class Op extends Node {

		constructor(name, active) {
			super(null, name, name);
			this.active = active;
		}

		rewrite(token) { } // default none for passive ops

		copy() {
			return new Op(this.name,this.active);
		}

	}

	return Op;
});
