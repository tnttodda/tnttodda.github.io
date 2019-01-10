define(function(require) {

	var Op = require('nodes/op');
	var IntOp = require('nodes/ops/int');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class MinusOp extends Op {

		copy() {
			return new MinusOp(this.name,this.active);
		}

		rewrite(token) {
			var n = this.findLinksOutOf().reduce((sum,x) => (-1 * sum) - this.graph.findNodeByKey(x.to).name, 0);
			var newNode = new IntOp(n,false).addToGroup(this.group);
			return this.activeRewrite(token,newNode);
		}

	}

	return MinusOp;
});
