define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class LambdaOp extends Op {

		copy() {
			return new LambdaOp(this.name,this.active);
		}

	}

	return LambdaOp;
});
