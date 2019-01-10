define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class LambdaOp extends Op {

		constructor() {
			super("λ",false)
		}

		copy() {
			return new LambdaOp();
		}

	}

	return LambdaOp;
});
