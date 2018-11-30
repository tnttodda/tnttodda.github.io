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

			var newNode;
			if (BoolOp.parseBoolean(this.graph.findNodeByKey(outLinks[0].to).name)) {
				outLinks[2].delete();
				newNode = this.graph.findNodeByKey(outLinks[1].to).group.unbox();
			} else {
				outLinks[1].delete();
				newNode = this.graph.findNodeByKey(outLinks[2].to).group.unbox();
			}
			var newLink = new Link(inLink.from,newNode.key,"_","_").addToGroup(this.group);

			outLinks[0].delete();
			this.graph.findNodeByKey(outLinks[0].to).delete();
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return newLink;
		}

	}

	return IfOp;
});
