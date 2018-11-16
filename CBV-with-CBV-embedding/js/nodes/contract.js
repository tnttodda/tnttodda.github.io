define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');
	var Atom = require('nodes/atom');
	var Op = require('nodes/op');
	var Term = require('term');
	var Link = require('link');
	//var DNet = require('dnet');

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
			var inLinks = this.findLinksInto();
			var outLinks = this.findLinksOutOf();
			var nextLink = outLinks[0];
			var nextNode = this.graph.findNodeByKey(nextLink.to);

			// First/second contraction
			if (nextNode instanceof Contract || nextNode instanceof Atom) {
				inLinks.map(l => l.changeTo(nextNode.key,"_"));
				nextLink.delete();
				this.delete();
			} else if (nextNode instanceof Op) {
				var term = new Term().addToGroup(this.group);
				var copy = nextNode.copy().addToGroup(term);
				var outputs = nextNode.findNodesOutOf();

				// clean up here
				var opLinks = nextNode.findLinksOutOf();
				var auxs = this.createDNet(opLinks,[nextNode,nextNode,copy,copy],term);
				link.changeTo(copy.key,"_");
				if (opLinks.length > 0) {
					opLinks[0].changeFrom(auxs[0].key,"_");
					opLinks[1].changeFrom(auxs[1].key,"_");
				}

				term.set(copy,auxs);
		}

			token.rewriteFlag = Flag.SEARCH;
			return link;
		}

		//this shouldn't be here
		createDNet(ctx, inputs, group) {

			var c;
			var from;
			var to;
			var cList = [];

			for (var n = 0; n < ctx.length; n++) {
				c = new Contract(ctx[n].name).addToGroup(group);
				cList.push(c);

			if (inputs.length == 0) // maybe this needs to be "more elegant"
				new Link(op.key, c.key, "_", "_", "lightgrey").addToGroup(group);
			}

			if (cList.length > 0) {
				for (var i = 0; i < inputs.length; i++) {
					from = inputs[i]; to = cList[(i%(ctx.length))];
					new Link(from.key, to.key, "_", "_").addToGroup(group);
				}
			}

			return cList;
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
