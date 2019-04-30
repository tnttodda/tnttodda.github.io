define(function(require) {

	var Op = require('nodes/op');
	var UnitOp = require('nodes/ops/unit');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class AssignOp extends Op {

		constructor() {
			super(":=",true)
		}

		copy() {
			return new AssignOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var instanceNode = this.graph.findNodeByKey(outLinks[0].to);
			var prinNode = this.graph.findNodeByKey(outLinks[1].to);
			var atomNode = this.graph.findNodeByKey(instanceNode.findLinksOutOf()[0].to);
			var newNode = new UnitOp().changeToGroup(this.group);

			inLink.changeTo(newNode.key);
			atomNode.findLinksOutOf()[0].changeTo(prinNode.key);

			instanceNode.delete();
			this.findLinksOutOf().map(x => x.delete());
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return AssignOp;
});
