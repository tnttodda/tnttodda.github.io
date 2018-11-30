define('nodes/contract',function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');
	var Atom = require('nodes/atom');
	var Op = require('nodes/op');
	var Term = require('term');
	var Link = require('link');
	var Group = require('group');

	class Contract extends Node {

		constructor(name) {
			super("point", "", name);
		}

		transition(token, link) {
			if (link.to == this.key) {
				return this.findLinksOutOf(null)[0];
			}
		}

		rewrite(token) {
			var link = token.link;
			var inLinks = this.findLinksInto();
			var outLinks = this.findLinksOutOf();
			var nextLink = outLinks[0];
			var nextNode = this.graph.findNodeByKey(nextLink.to);

			if (nextNode instanceof Contract || nextNode instanceof Atom) {
				inLinks.map(l => l.changeTo(nextNode.key,"_"));
				nextLink.delete();
				this.delete();
			} else if (nextNode instanceof Op) {
				var term = new Term().addToGroup(this.group);
				var copy = nextNode.copy().addToGroup(term);

				// clean up here
				var opLinks = nextNode.findLinksOutOf();
				var auxs = Contract.createDNet(opLinks.length,[nextNode,nextNode,copy,copy],term);
				link.changeTo(copy.key,"_");
				for (var i = 0; i < opLinks.length; i++) {
					opLinks[i].changeFrom(auxs[i].key,"_");
				}

				term.set(copy,auxs);
		}

			token.rewriteFlag = Flag.SEARCH;
			return link;
		}

		static createDNet(cs, inputs, originalGroup, op) {
			var c;
			var from;
			var to;
			var cList = [];

			var group = new Group();

			for (var n = 0; n < cs; n++) {
				c = new Contract().addToGroup(group);
				cList.push(c);

			if (inputs.length == 0) // maybe this needs to be "more elegant"
				new Link(op.key, c.key, "_", "_", "lightgrey").addToGroup(group);
			}

			if (cList.length > 0) {
				for (var i = 0; i < inputs.length; i++) {
					from = inputs[i]; to = cList[(i%(cs))];
					new Link(from.key, to.key, "_", "_").addToGroup(group);
				}
			}

			group.addToGroup(originalGroup);

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
