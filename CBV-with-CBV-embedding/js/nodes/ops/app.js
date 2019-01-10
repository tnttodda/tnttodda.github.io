define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class AppOp extends Op {

		constructor() {
			super("@",true)
		}

		copy() {
			return new AppOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var lambdaNode = this.graph.findNodeByKey(outLinks[0].to);
			var lambdaLink = lambdaNode.outLinks[0];
			var newNode = this.graph.findNodeByKey(lambdaLink.to);
			var argNode = this.graph.findNodeByKey(outLinks[1].to);

			var newGroup = newNode.getBoxed();

			inLink.changeTo(newNode.key);
			newGroup.unbox();

			outLinks.map(x => x.delete());
			this.graph.findNodeByKey(outLinks[0].to).delete();
			this.delete();

			new Link(newGroup.buxs[0].key,argNode.key).addToGroup(this.group);

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return AppOp;
});
