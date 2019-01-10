define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');
	var Link = require('link');

	class Op extends Node {

		constructor(name, active) {
			super(null, name, name);
			this.active = active;
		}

		rewrite(token) { } // default none for passive ops

		activeRewrite(token,newNode) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			inLink.changeTo(newNode.key);

			outLinks.map(x => x.delete());
			outLinks.map(x => this.graph.findNodeByKey(x.to).delete());
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

		copy() {
			return new Op(this.name,this.active);
		}

	}

	return Op;
});
