define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');
	var Atom = require('nodes/atom');
	var Op = require('nodes/op');
	var Term = require('term');
	var Link = require('link');

	class Contract extends Node {

		constructor(name) {
			super("point", "", name);
		}

		transition(token, link) {
			if (link.to == this.key) {
				//token.boxStack.push(link);
				//token.rewriteFlag = RewriteFlag.F_C;
				return this.findLinksOutOf(null)[0];
			}
			// else if (link.from == this.key && token.boxStack.length > 0) {
			// 	return token.boxStack.pop();
			// }
		}

		rewrite(token) {
			var link = token.link;
			var inLinks = this.findLinksInto("s");
			var outLinks = this.findLinksOutOf("n");
			var nextLink = outLinks[0];
			var nextNode = this.graph.findNodeByKey(nextLink.to);

			// First/second contraction
			if (nextNode instanceof Contract || nextNode instanceof Atom) {
				inLinks.map(l => l.changeTo(nextNode.key,"s"));
				nextLink.delete();
			} else if (nextNode instanceof Op) {
				var term = new Term().addToGroup(this.group);
				var copy = nextNode.copy().addToGroup(term);
				var outputs = nextNode.findNodesOutOf("n");
				console.log(outputs);

				var auxs = this.createDNet(outputs,[nextNode,copy],copy,term);
				link.changeTo(copy.key,"s");

				term.set(copy,auxs);
		}

			token.rewriteFlag = Flag.SEARCH;
			return link;
		}

		copy() {
			return new Contract(this.name);
		}

		draw(level) {
			return level + this.key + '[shape=' + this.shape + '];';
		}
	}

	return Contract;
});
