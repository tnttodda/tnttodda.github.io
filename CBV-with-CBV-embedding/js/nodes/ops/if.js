define(function(require) {

	var Op = require('nodes/op');
	var BoolOp = require('nodes/ops/bool');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class IfOp extends Op {

		constructor() {
			super("if", true);
		}

		copy() {
			return new IfOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var name = this.graph.findNodeByKey(outLinks[0].to).name;
			var keep; var del;
			if (BoolOp.parseBoolean(name)) {
				keep = 1; del = 2;
			} else {
				keep = 2; del = 1;
			}
			outLinks[del].delete();
			var newNode = this.graph.findNodeByKey(outLinks[keep].to).group.unbox();
			inLink.changeTo(newNode.key,"_");

			outLinks[0].delete();
			this.graph.findNodeByKey(outLinks[0].to).delete();
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return IfOp;
});