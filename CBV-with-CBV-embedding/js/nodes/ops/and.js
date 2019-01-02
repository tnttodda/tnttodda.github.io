define(function(require) {

	var Op = require('nodes/op');
	var BoolOp = require('nodes/ops/bool');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class AndOp extends Op {

		constructor(active) {
			super("∧", active);
		}

		copy() {
			return new AndOp(this.active);
		}

		rewrite(token) {
			var b = this.findLinksOutOf().reduce((sum,x) => sum && BoolOp.parseBoolean(this.graph.findNodeByKey(x.to).name), true);
			var newNode = new BoolOp(b,false).addToGroup(this.group);
			return this.activeRewrite(token,newNode);
		}

	}

	return AndOp;
});
