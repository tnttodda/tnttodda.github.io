define(function(require) {

	var Op = require('nodes/op');

	class UnitOp extends Op {

		copy() {
			return new UnitOp(this.name,this.active);
		}

	}

	return UnitOp;
});
