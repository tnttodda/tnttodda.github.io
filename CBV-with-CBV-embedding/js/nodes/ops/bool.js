define(function(require) {

	var Op = require('nodes/op');

	class BoolOp extends Op {

		constructor(b) {
			b = BoolOp.parseBoolean(b);
			super(b, false);
		}

		copy() {
			return new BoolOp();
		}

		static parseBoolean(b) {
			if (b == "false" || b == 0) {
				return false;
			} else {
				return true;
			}
		}

	}

	return BoolOp;
});
