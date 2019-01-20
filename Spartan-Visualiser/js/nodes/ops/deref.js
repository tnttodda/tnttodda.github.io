define(function(require) {

	var Op = require('nodes/op');
	var Atom = require('nodes/atom');
	var Instance = require('nodes/instance');
	var Contract = require('nodes/contract');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class DerefOp extends Op {

		constructor() {
			super("!",true)
		}

		copy() {
			return new DerefOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var instanceNode = this.graph.findNodeByKey(outLinks[0].to);
			var atomNode = this.graph.findNodeByKey(instanceNode.findLinksOutOf()[0].to);
			var prinNode = this.graph.findNodeByKey(atomNode.findLinksOutOf()[0].to);
			var newNode = new Contract().addToGroup(this.group);

			inLink.changeTo(newNode.key);
			instanceNode.findLinksOutOf()[0].changeTo(prinNode.key);
			instanceNode.findLinksOutOf()[0].changeFrom(newNode.key);
			atomNode.findLinksOutOf()[0].changeTo(newNode.key);

			instanceNode.delete();
			if (atomNode.findLinksInto().length == 0) atomNode.delete();
			this.delete();
			this.prinOf.map(x => x.prin = newNode);

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return DerefOp;
});
