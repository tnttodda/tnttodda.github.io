define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class LambdaOp extends Op {

		constructor(active) {
			super("λ", active);
		}

		copy() {
			return new LambdaOp(this.active);
		}

	}

	return LambdaOp;
});
