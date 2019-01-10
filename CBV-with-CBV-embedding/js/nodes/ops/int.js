define(function(require) {

	var Op = require('nodes/op');

	class IntOp extends Op {

		copy() {
			return new IntOp(this.name,this.active);
		}

	}

	return IntOp;
});
