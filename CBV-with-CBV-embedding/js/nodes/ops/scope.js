define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();
	var Instance = require('nodes/instance')
	var Atom = require('nodes/atom')
	var UnitOp = require('nodes/ops/unit')
	var AddrOp = require('nodes/ops/addr');
	var BreakOp = require('nodes/ops/break');
	var ContOp = require('nodes/ops/cont');

	class ScopeOp extends Op {

		constructor() {
			super("scope",true)
		}

		copy() {
			return new ScopeOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var boxedG = this.graph.findNodeByKey(outLinks[0].to).getBoxed();
			boxedG.unbox();

			var addrNode = new AddrOp(true).addToGroup(this.group);
			var iNodeA = new Instance().addToGroup(this.group);
			var atomNode = new Atom().addToGroup(this.group);
			var unitNode = new UnitOp(false).addToGroup(this.group);

			boxedG.prin.findLinksInto()[0].changeFrom(addrNode.key);
			new Link(addrNode.key,iNodeA.key,0).addToGroup(this.group);
			boxedG.prin.findLinksInto()[0].argNo = 1; // change
			new Link(iNodeA.key,atomNode.key).addToGroup(this.group);
			new Link(atomNode.key,unitNode.key).addToGroup(this.group);
			inLink.changeTo(addrNode.key);

			if (boxedG.buxs.length > 0) {
				var iNodeB = new Instance().addToGroup(this.group);
				new Link(iNodeB.key,atomNode.key).addToGroup(this.group);
				new Link(boxedG.buxs[0].key,iNodeB.key,0).addToGroup(this.group); // ?
			}

			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return addrNode.findLinksOutOf()[1];
		}

	}

	return ScopeOp;
});
