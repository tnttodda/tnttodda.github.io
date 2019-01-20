define('nodes/contract',function(require) {

	var Flag = require('token').RewriteFlag();
	var Node = require('node');
	var Atom = require('nodes/atom');
	var Op = require('nodes/op');
	var Instance = require('nodes/instance');
	var Term = require('term');
	var Link = require('link');
	var Group = require('group');

	class Contract extends Node {

		constructor(name) {
			super("circle", "⊗", name);
			this.contract = true; // change
			this.height = 0.23;
			this.width = 0.23;
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

			console.log(nextNode instanceof Instance);

			if (nextNode instanceof Contract || nextNode instanceof Atom) {
				for (let l of inLinks)
					l.changeTo(nextNode.key);
				nextLink.delete();
				this.delete();
			} else if (nextNode instanceof Instance) {
				var instance = new Instance().addToGroup(nextNode.group);
				link.changeTo(instance.key);
				new Link(instance.key,nextNode.findLinksOutOf()[0].to).addToGroup(nextNode.group);
			} else if (nextNode instanceof Op) {
				var term = new Term().addToGroup(this.group);
				var copy = nextNode.copy().addToGroup(term);

				// clean up here
				var opLinks = nextNode.findLinksOutOf();
				var opLinksE = opLinks.filter(x => !this.graph.findNodeByKey(x.to).prinOf.filter(x => x.boxed).length > 0);
				var opLinksD = opLinks.filter(x => !opLinksE.includes(x))

				// fully copy deferred arguments
				var thunks = []; var thunkCopies = []; var links = opLinksE;
				for (var i = 0; i < opLinksD.length; i++) {
					var thunk = this.graph.findNodeByKey(opLinksD[i].to).prinOf.filter(x => x.boxed)[0];
					var thunkCopy = thunk.copy().addToGroup(term);
					thunks.push(thunk);
					thunkCopies.push(thunkCopy);
					links = links.concat.apply(links,(thunk.auxs.map(x => x.findLinksOutOf())));
				}

				var inputs = [];
				for (var i = 0; i < opLinksE.length; i++) inputs = inputs.concat(nextNode);
				inputs = inputs.concat.apply(inputs,thunks.map(x => x.auxs));
				for (var i = 0; i < opLinksE.length; i++) inputs = inputs.concat(copy);
				inputs = inputs.concat.apply(inputs,thunkCopies.map(x => x.auxs));

				// make D-net, thus half-copy eager arguments
				var auxs = Contract.createDNet(inputs.length/2,inputs,term);
				for (var i = 0; i < links.length; i++)
					links[i].changeFrom(auxs[i].key);
				for (var i = 0; i < thunkCopies.length; i++) {
					var l = new Link(copy.key,thunkCopies[i].prin.key).addToGroup(term);
					l.visited = true;
				}

				link.changeTo(copy.key);
				term.set(copy,auxs);
			}

			token.rewriteFlag = Flag.SEARCH;
			return link;
		}

		static createDNet(cs, inputs, group) {
			var c;
			var from;
			var to;
			var cList = [];

			for (var n = 0; n < cs; n++) {
				c = new Contract().addToGroup(group);
				cList.push(c);
			}

			if (cList.length > 0) {
				for (var i = 0; i < inputs.length; i++) {
					from = inputs[i]; to = cList[i%cs];
					new Link(from.key,to.key,i%cs).addToGroup(group);
				}
			}

			return cList;
		}

		copy() {
			return new Contract(this.name);
		}

	}

	return Contract;
});
