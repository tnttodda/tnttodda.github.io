define(function(require) {

	var Op = require('nodes/op');
	var IntOp = require('nodes/ops/int');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class ModOp extends Op {

		constructor() {
			super("%",true)
		}

		copy() {
			return new ModOp();
		}

		rewrite(token) {
			var outLinks = this.findLinksOutOf();
			var left = this.graph.findNodeByKey(outLinks[0].to).name;
			var right = this.graph.findNodeByKey(outLinks[1].to).name;
			var n = (left % right);
			var newNode = new IntOp(n,false).addToGroup(this.group);
			return this.activeRewrite(token,newNode);
		}

	}

	return ModOp;
});
