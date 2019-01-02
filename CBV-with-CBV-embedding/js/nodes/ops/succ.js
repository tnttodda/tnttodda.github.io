define(function(require) {

	var Op = require('nodes/op');
	var IntOp = require('nodes/ops/int');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class SuccOp extends Op {

		constructor() {
			super("++", true);
		}

		copy() {
			return new SuccOp();
		}

		rewrite(token) {
			var n = this.graph.findNodeByKey(this.findLinksOutOf()[0].to).name + 1;
			var newNode = new IntOp(n,false).addToGroup(this.group);
			return this.activeRewrite(token,newNode);
		}

	}

	return SuccOp;
});
