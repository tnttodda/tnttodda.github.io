define(function(require) {

	var Op = require('nodes/op');

	class IntOp extends Op {

		constructor(n,active) {
			super(n, active);
		}

		copy() {
			return new IntOp(this.name,this.active);
		}

	}

	return IntOp;
});
