// specific group for a term in the calculus

define('term', function(require) {

	var Group = require('group');
	var Link = require('link');

	class Term extends Group {

		constructor(prin, auxs) {
			super();
			this.set(prin, auxs)
			this.boxed = false;
		}

		set(prin, auxs) {
			this.prin = prin;
			this.auxs = auxs;
			return this;
		}

		box() {
			this.boxed = true;
			return this.prin;
		}

		unbox() {
			this.boxed = false;
			return this.prin;
		}

		draw(level) {
			if (this.boxed) {
				var str = "";
				for (let node of this.nodes) {
					str += node.draw(level + '  ');
				}
				return level + 'subgraph cluster_' + this.key + ' {'
					 + level + '  graph[style=dotted];'
					 + str
					 + level + '};';
			 }
			 return super.draw(level);
		}

		removeNode(node) {
			if (this.auxs.indexOf(node) > -1)
				this.auxs.splice(this.auxs.indexOf(node), 1);
			return super.removeNode(node);
		}

		copyBox(map) {
			var newTerm = new Term();
			newTerm.boxed = this.boxed;
			var newPrin = this.prin.copy().addToGroup(newTerm);
			newTerm.prin = newPrin;
			map.set(this.prin.key, newPrin.key);

			newTerm.auxs = [];
			for (let node of this.nodes) {
				if (!map.has(node.key)) {
					var newNode;
					if (node instanceof Term) {
						newNode = node.copyBox(map).addToGroup(newTerm);
					} else {
						newNode = node.copy().addToGroup(newTerm);
						map.set(node.key, newNode.key);
					}
				}
		}
			for (let aux of this.auxs) {
				var newAux = this.graph.findNodeByKey(map.get(aux.key));
				newTerm.auxs.push(newAux);
			}

			for (let link of this.links) {
				var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newTerm);
				newLink.reverse = link.reverse;
				newLink.colour = link.colour;
			}

			return newTerm;
		}

		copy() {
			var map = new Map();
			return this.copyBox(map);
		}

		quotient() {
			var changed = false;
			for (let node of this.nodes) {
				if (node instanceof Term) {
					node.quotient();
				} else if (node.contract) { // change
					var inLinks = node.findLinksInto();
					var outLinks = node.findLinksOutOf();
					if ((inLinks.length < 2) ||
						  (this.graph.findNodeByKey(outLinks[0].to).contract)) {
						changed = true;
						inLinks.map(x => x.changeTo(outLinks[0].to,"_"));
						outLinks[0].delete();
						node.delete();
					}
				}
			}
			if (changed) this.quotient();
		}

}

	return Term;
});
