define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class AbortOp extends Op {

		copy() {
			return new AbortOp(this.name,this.active);
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var newNode = this.graph.findNodeByKey(outLinks[0].to).unbox();
			var startNode = this.graph.findNodeByKey("nd1");
			inLink.changeTo(newNode.key);
			startNode.findLinksOutOf().filter(l => l != inLink).map(x => x.delete())
			inLink.changeFrom(startNode.key);

			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return AbortOp;
});
