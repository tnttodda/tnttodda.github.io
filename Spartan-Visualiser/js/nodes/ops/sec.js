define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class SecOp extends Op {

		constructor() {
			super(";",true)
		}

		copy() {
			return new SecOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var newNode = this.graph.findNodeByKey(outLinks[1].to).unbox();
			inLink.changeTo(newNode.key);

			outLinks[0].delete();
			this.graph.findNodeByKey(outLinks[0].to).delete();
			this.delete();
			this.prinOf.map(x => x.prin = newNode);

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return SecOp;
});
