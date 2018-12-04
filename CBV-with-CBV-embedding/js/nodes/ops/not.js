define(function(require) {

	var Op = require('nodes/op');
	var BoolOp = require('nodes/ops/bool');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class NotOp extends Op {

		constructor() {
			super("¬", true);
		}

		copy() {
			return new NotOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var b = !BoolOp.parseBoolean(this.graph.findNodeByKey(outLinks[0].to).name);

			var newNode = new BoolOp(b,false).addToGroup(this.group);
			inLink.changeTo(newNode.key,"_");

			outLinks.map(x => x.delete());
			outLinks.map(x => this.graph.findNodeByKey(x.to).delete());
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return NotOp;
});
