define(function(require) {

	var Op = require('nodes/op');

	class UnitOp extends Op {

		constructor(active) {
			super("()", active);
		}

		copy() {
			return new UnitOp(this.active);
		}

	}

	return UnitOp;
});
