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
				// half-copy eager arguments
				var opLinks = nextNode.findLinksOutOf();
				var opLinksE = opLinks.filter(x => !this.graph.findNodeByKey(x.to).group.boxed); // eager args
				var opLinksD = opLinks.filter(x => !opLinksE.includes(x))
				var inputsN = []; var inputsC = [];
				for (var i = 0; i < opLinksE.length; i++) {
					inputsN.push(nextNode); inputsC.push(copy);
				}
				var inputs = inputsN.concat(inputsC);
				var auxs = Contract.createDNet(opLinksE.length,inputs,term);
				link.changeTo(copy.key,"_");
				for (var i = 0; i < opLinksE.length; i++) {
					opLinksE[i].changeFrom(auxs[i].key,"_");
				}
				// and then fully copy deferred arguments
				for (var i = 0; i < opLinksD.length; i++) {
					console.log(this.graph.findNodeByKey(opLinksD[i].to));
					var copy2 = this.graph.findNodeByKey(opLinksD[i].to).group.copy().addToGroup(term);
					new Link(copy.key,copy2.prin.key,"_","_").addToGroup(term);
				}
				term.set(copy,auxs);
		}

			token.rewriteFlag = Flag.SEARCH;
			return link;
		}

		static createDNet(cs, inputs, group, op) {
			var c;
			var from;
			var to;
			var cList = [];

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
