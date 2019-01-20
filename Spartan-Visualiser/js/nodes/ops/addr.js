define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();
	var Contract = require('nodes/contract');

	class AddrOp extends Op {

		constructor() {
			super("addr",true)
		}

		copy() {
			return new AddrOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var instanceNode = this.graph.findNodeByKey(outLinks[0].to);
			var instanceOutLink = instanceNode.findLinksOutOf()[0];
			var contract = new Contract().addToGroup(this.group);
			instanceOutLink.changeFrom(contract.key);

			inLink.changeTo(outLinks[1].to);
			outLinks[0].delete();
			outLinks[1].delete();
			instanceNode.delete();
			this.prinOf.map(x => x.prin = this.graph.findNodeByKey(outLinks[1].to));
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return AddrOp;
});
