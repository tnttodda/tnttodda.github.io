define(function(require) {

	var Op = require('nodes/op');
	var Atom = require('nodes/atom');
	var Instance = require('nodes/instance');
	var Contract = require('nodes/contract');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class DerefOp extends Op {

		constructor(active) {
			super("!", active);
		}

		copy() {
			return new RefOp(this.active);
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];

			var instanceNode = this.graph.findNodeByKey(this.findLinksOutOf()[0].to);
			var atomNode = this.graph.findNodeByKey(instanceNode.findLinksOutOf()[0].to);
			var newNode = new Contract().addToGroup(this.group);

			inLink.changeTo(newNode.key);
			atomNode.findLinksOutOf()[0].changeFrom(newNode.key);

			instanceNode.findLinksOutOf()[0].delete();
			instanceNode.delete();
			atomNode.delete();
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return DerefOp;
});
