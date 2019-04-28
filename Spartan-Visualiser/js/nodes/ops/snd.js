define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class SndOp extends Op {

		constructor() {
			super("π₂",true)
		}

		copy() {
			return new SndOp();
		}

		rewrite(token) {
			var outLinks = this.findLinksOutOf();
			var PNode = this.graph.findNodeByKey(outLinks[0].to);
			var newNode = this.graph.findNodeByKey(PNode.findLinksOutOf()[1].to);
			return this.activeRewrite(token,newNode);
		}

	}

	return SndOp;
});
