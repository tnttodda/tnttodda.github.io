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
				for (let l of inLinks)
					l.changeTo(nextNode.key,"_")
				nextLink.delete();
				this.delete();
			} else if (nextNode instanceof Op) {
				var term = new Term().addToGroup(this.group);
				var copy = nextNode.copy().addToGroup(term);

				// clean up here
				var opLinks = nextNode.findLinksOutOf();
				var opLinksE = opLinks.filter(x => !this.graph.findNodeByKey(x.to).group.boxed);
				var opLinksD = opLinks.filter(x => !opLinksE.includes(x))

				// fully copy deferred arguments
				var thunks = []; var thunkCopies = []; var links = opLinksE;
				for (var i = 0; i < opLinksD.length; i++) {
					var thunk = this.graph.findNodeByKey(opLinksD[i].to).group;
					console.log(thunk);
					var thunkCopy = thunk.copy().addToGroup(term);
					thunks.push(thunk);
					thunkCopies.push(thunkCopy);
					links = links.concat.apply(links,(thunk.auxs.map(x => x.findLinksOutOf())));
					var l = new Link(copy.key,thunkCopy.prin.key,"_","_").addToGroup(term);
					l.visited = true;
				}

				var inputs = [];
				for (var i = 0; i < opLinksE.length; i++) inputs = inputs.concat(nextNode);
				inputs = inputs.concat.apply(inputs,thunks.map(x => x.auxs));
				for (var i = 0; i < opLinksE.length; i++) inputs = inputs.concat(copy);
				inputs = inputs.concat.apply(inputs,thunkCopies.map(x => x.auxs));

				// make D-net, thus half-copy eager arguments
				var auxs = Contract.createDNet(inputs.length/2,inputs,term);
				for (var i = 0; i < links.length; i++)
					links[i].changeFrom(auxs[i].key,"_");

				link.changeTo(copy.key,"_");
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

			// if (inputs.length == 0) // maybe this needs to be "more elegant"
			// 	new Link(op.key, c.key, "_", "_", "lightgrey").addToGroup(group);
			}

			if (cList.length > 0) {
				for (var i = 0; i < inputs.length; i++) {
					from = inputs[i]; to = cList[i%cs];
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
