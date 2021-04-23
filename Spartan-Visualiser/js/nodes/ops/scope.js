define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();
	var SeqOp = require('nodes/ops/sec');
	var Contract = require('nodes/contract');
	var Instance = require('nodes/instance');

	class ScopeOp extends Op {

		constructor() {
			super("block",true);
		}

		copy() {
			return new ScopeOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();
			var outLinkThunk = outLinks[1];

			var box = this.graph.findNodeByKey(outLinkThunk.to).getBoxed();
			var boxCopy = box.copy(); //*
			boxCopy.changeToGroup(this.group).unbox();

			var seqNode = new SeqOp().changeToGroup(this.group);
			inLink.changeTo(seqNode.key);
			new Link(seqNode.key,boxCopy.prin.key,0).changeToGroup(this.group);
			new Link(seqNode.key,this.key,1).changeToGroup(this.group);

			for (var i = 0; i < box.auxs.length; i++) {
				var contractNode = new Contract().changeToGroup(this.group);
				var auxLink = box.auxs[i].findLinksOutOf()[0];
				var auxNode = this.graph.findNodeByKey(auxLink.to);
				new Link(contractNode.key,auxNode.key,0).changeToGroup(this.group);
				new Link(boxCopy.auxs[i].key,contractNode.key,0).changeToGroup(this.group);
				auxLink.changeTo(contractNode.key);
			}

			if (boxCopy.buxs.length > 0) {
				var outLinkInstance = outLinks[0];
				var instance = this.graph.findNodeByKey(outLinkInstance.to);
				var atom = this.graph.findNodeByKey(instance.findLinksOutOf()[0].to);
				for (const bux of boxCopy.buxs) {
					var instanceNode = new Instance().changeToGroup(this.group);
					new Link(instanceNode.key,atom.key,0).changeToGroup(this.group);
					new Link(bux.key,instanceNode.key,0).changeToGroup(this.group);
				}
			}

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return ScopeOp;
});
