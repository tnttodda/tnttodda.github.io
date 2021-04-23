define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();
	var AddrOp = require('nodes/ops/addr');
	var UnitOp = require('nodes/ops/unit');
	var Contract = require('nodes/contract');

	class BreakOp extends Op {

		constructor() {
			super("break",true)
		}

		copy() {
			return new BreakOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();
			var outLinkInstance = outLinks[0];
			var outLinkEscape = outLinks[1];
			
			var breakInstance = this.graph.findNodeByKey(outLinkInstance.to);
			var breakInstanceOutLink = breakInstance.findLinksOutOf()[0];
			var atom = this.graph.findNodeByKey(breakInstanceOutLink.to);
			var blockInstanceOutLink = atom.findLinksInto()[0];
			var blockInstance = this.graph.findNodeByKey(blockInstanceOutLink.from);
			var blockOutLinkInstance = blockInstance.findLinksInto()[0];
			var block = this.graph.findNodeByKey(blockOutLinkInstance.from);
			var blockInLink = block.findLinksInto()[0];
			var blockOutLinkEscape = block.findLinksOutOf()[1];

			// green
			inLink.changeTo(breakInstance.key);
			this.group.removeLink(outLinkInstance);	

			// blue
			blockInLink.changeTo(outLinkEscape.to);
			this.group.removeLink(outLinkEscape);

			// orange
			this.group.removeLink(blockInstanceOutLink);
			this.group.removeLink(blockOutLinkInstance);
			blockInstance.delete();

			// purple
			var contractRight = new Contract().changeToGroup(block.group);
			blockOutLinkEscape.changeFrom(contractRight.key);

			block.delete();
			this.delete()

			token.rewriteFlag = Flag.SEARCH;
			return blockInLink;
		}

	}

	return BreakOp;
});
