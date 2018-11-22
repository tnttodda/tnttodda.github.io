define(function(require) {

	var Op = require('nodes/op');

	class IntOp extends Op {

		constructor(n) {
			super(n, false);
		}

	}

	return IntOp;
});
