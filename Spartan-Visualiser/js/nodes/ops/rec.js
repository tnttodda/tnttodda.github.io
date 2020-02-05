define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class RecOp extends Op {

		constructor() {
			super("μ",true)
		}

		copy() {
			return new RecOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var thunk = this.graph.findNodeByKey(outLinks[0].to).group;
			while (!thunk.boxed)
				thunk = thunk.group;

			var thunkCopy = thunk.copy().changeToGroup(this.group);
			inLink.changeTo(thunkCopy.unbox().key);

			for (var i=0; i < thunk.auxs.length; i++)
				new Link(thunkCopy.auxs[i].key,thunk.auxs[i].key).changeToGroup(this.group);
			
			if (thunk.buxs.length > 0)
				new Link(thunkCopy.buxs[0].key,this.key).changeToGroup(this.group);

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return RecOp;
});
