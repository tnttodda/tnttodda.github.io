define(function(require) {

	var Op = require('nodes/op');
	var IntOp = require('nodes/ops/int');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class PlusOp extends Op {

		constructor() {
			super("+",true)
		}

		copy() {
			return new PlusOp();
		}

		rewrite(token) {
			var n = this.findLinksOutOf().reduce((sum,x) => sum + this.graph.findNodeByKey(x.to).name, 0);
			var newNode = new IntOp(n,false).changeToGroup(this.group);
			return this.activeRewrite(token,newNode);
		}

	}

	return PlusOp;
});
