define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class RecOp extends Op {

		constructor(active) {
			super("μ", true);
		}

		copy() {
			return new RecOp(this.active);
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var thunk = this.graph.findNodeByKey(outLinks[0].to).group;
			while (!thunk.boxed)
				thunk = thunk.group;

			var thunkCopy = thunk.copy().addToGroup(this.group);
			inLink.changeTo(thunkCopy.unbox().key);

			if (thunk.buxs.length > 0)
				new Link(thunkCopy.buxs[0].key,this.key).addToGroup(this.group);

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return RecOp;
});
