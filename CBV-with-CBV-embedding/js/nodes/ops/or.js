define(function(require) {

	var Op = require('nodes/op');
	var BoolOp = require('nodes/ops/bool');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class OrOp extends Op {

		constructor() {
			super("∨", true);
		}

		copy() {
			return new OrOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var b = outLinks.reduce((sum,x) => sum || BoolOp.parseBoolean(this.graph.findNodeByKey(x.to).name), false);

			var newNode = new BoolOp(b,false).addToGroup(this.group);
			inLink.changeTo(newNode.key,"_");

			outLinks.map(x => x.delete());
			outLinks.map(x => this.graph.findNodeByKey(x.to).delete());
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return OrOp;
});
