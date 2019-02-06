define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();
	var AddrOp = require('nodes/ops/addr');
	var Contract = require('nodes/contract');

	class ReturnOp extends Op {

		constructor() {
			super("ret.",true)
		}

		copy() {
			return new ReturnOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var instanceNode = this.graph.findNodeByKey(outLinks[0].to);
			var atomNode = this.graph.findNodeByKey(instanceNode.findLinksOutOf()[0].to);
			var atomInLinks = atomNode.findLinksInto();
			var atomInNodes = atomInLinks.map(x => this.graph.findNodeByKey(x.from));
			var n = atomInNodes.findIndex(x => x == instanceNode);
			var addrNode;
			for (var i = n-1; i >= 0; i--) {
				addrNode = this.graph.findNodeByKey(atomInNodes[i].findLinksInto()[0].from);
				if (addrNode instanceof AddrOp) break;
			}

			var nextNode = this.graph.findNodeByKey(outLinks[1].to).unbox();
			var inLink = addrNode.findLinksInto()[0];
			inLink.changeTo(nextNode.key);
			var contract = new Contract().addToGroup(this.group);
			new Link(contract.key,addrNode.key).addToGroup(this.group);

			outLinks[1].delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return ReturnOp;
});
