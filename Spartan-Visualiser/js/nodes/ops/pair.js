define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class PairOp extends Op {

		constructor() {
			super("P",false)
		}

		copy() {
			return new PairOp();
		}

	}

	return PairOp;
});
