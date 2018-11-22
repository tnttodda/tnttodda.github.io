define(function(require) {

	var Op = require('nodes/op');
	var IntOp = require('nodes/ops/int');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class PlusOp extends Op {

		constructor() {
			super("+", true);
		}

		rewrite(token) { // needs fixing up
			var inLink = this.findLinksInto("s")[0];
			var outLinks = this.findLinksOutOf();
			var left = this.graph.findNodeByKey(outLinks[0].to);
			var right = this.graph.findNodeByKey(outLinks[1].to);
			var n = left.name + right.name;
			var newNode = new IntOp(n,false).addToGroup(this.group);

			var newLink = new Link(inLink.from,newNode.key,"_","_").addToGroup(this.group);
			outLinks[0].delete();
			outLinks[1].delete();
			left.delete();
			right.delete();
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return newLink;
		}

	}

	return PlusOp;
});
