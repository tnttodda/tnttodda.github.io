define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');
	var Link = require('link');

	class Op extends Node {

		constructor(name, active) {
			super(null, name, name);
			this.active = active;
			this.height = 0.4 + 0.1 * name.toString().length;
			this.width = this.height;
		}

		rewrite(token) { } // default none for passive ops

		activeRewrite(token,newNode) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			inLink.changeTo(newNode.key);

			outLinks.map(x => x.delete());
			outLinks.map(x => this.graph.findNodeByKey(x.to).delete());
			this.prinOf.map(x => x.prin = newNode);
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
