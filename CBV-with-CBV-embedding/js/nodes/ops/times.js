define(function(require) {

	var Op = require('nodes/op');
	var IntOp = require('nodes/ops/int');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class TimesOp extends Op {

		constructor() {
			super("*", true);
		}

		copy() {
			return new TimesOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var n = outLinks.reduce((sum,x) => sum * this.graph.findNodeByKey(x.to).name, 1);

			var newNode = new IntOp(n,false).addToGroup(this.group);
			inLink.changeTo(newNode.key);

			outLinks.map(x => x.delete());
			outLinks.map(x => this.graph.findNodeByKey(x.to).delete());
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return TimesOp;
});
