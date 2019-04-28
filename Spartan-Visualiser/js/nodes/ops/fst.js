define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class FstOp extends Op {

		constructor() {
			super("π₁",true)
		}

		copy() {
			return new FstOp();
		}

		rewrite(token) {
			var outLinks = this.findLinksOutOf();
			var PNode = this.graph.findNodeByKey(outLinks[0].to);
			var newNode = this.graph.findNodeByKey(PNode.findLinksOutOf()[0].to);
			return this.activeRewrite(token,newNode);
		}

	}

	return FstOp;
});
