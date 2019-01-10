define(function(require) {

	var Op = require('nodes/op');

	class IntOp extends Op {

		constructor(n) {
			super(n,false)
		}

		copy() {
			return new IntOp(this.name);
		}

	}

	return IntOp;
});
