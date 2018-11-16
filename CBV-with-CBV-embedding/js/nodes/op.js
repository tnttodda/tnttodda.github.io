define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');
	var Link = require('link');

	class Op extends Node {

		constructor(name, active) {
			super(null, name, name);
			this.active = active;
		}

		transition(token, link) {
			if (link.to == this.key) {
				if (token.rewriteFlag == Flag.SEARCH) {
					var outLinks = this.findLinksOutOf();
					if (outLinks.length == 0) {
						if (this.active) {
							token.rewriteFlag = Flag.REWRITE;
						} else {
							token.rewriteFlag = Flag.RETURN;
						}
						return link;
					} else {
						return outLinks[0];
					}
				} else if (token.rewriteFlag == Flag.RETURN) {

				}
			}
			// else if (link.from == this.key && link.fromPort == "e") {
			// 	token.dataStack.pop();
			// 	token.dataStack.push(CompData.R);
			// 	token.forward = true;
			// 	return this.findLinksOutOf("w")[0];
			// }
		}

		rewrite(token) { // doesn't feel great...
			var inLink = this.findLinksInto("s")[0];
			var outLinks = this.findLinksOutOf();
			var left = this.graph.findNodeByKey(outLinks[0].to);
			var right = this.graph.findNodeByKey(outLinks[1].to);
			var n = left.name + right.name;
			var newNode = new Op(n,false).addToGroup(this.group);

			var newLink = new Link(inLink.from,newNode.key,"_","_").addToGroup(this.group);
			outLinks[0].delete();
			outLinks[1].delete();
			left.delete();
			right.delete();
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return newLink;
		}

		copy() {
			return new Op(this.name,this.active);
		}

	}

	return Op;
});
