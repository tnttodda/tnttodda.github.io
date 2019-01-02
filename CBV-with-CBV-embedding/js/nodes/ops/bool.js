define(function(require) {

	var Op = require('nodes/op');

	class BoolOp extends Op {

		constructor(b,active) {
			b = BoolOp.parseBoolean(b);
			super(b, active);
		}

		copy() {
			return new BoolOp(this.name,this.active);
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
