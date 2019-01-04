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
			var str = super.draw(level);
			if (this.boxed) {
				return level + 'subgraph cluster_' + this.key + ' {'
					 + level + '  graph[style=dotted];'
					 + str + ' '
					 + level + '};';
			} else {
			 	return str;
			}
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

			newTerm.auxs = []; newTerm.buxs = [];
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
				var newAux = this.graph.findNodeByKey(this.getEndpoint(map,aux.key));
				newTerm.auxs.push(newAux);
			}
			for (let bux of this.buxs) {
				var newBux = this.graph.findNodeByKey(this.getEndpoint(map,bux.key));
				newTerm.buxs.push(newAux);
			}

			for (let link of this.links) {
				var from = this.getEndpoint(map,link.from);
				var to = this.getEndpoint(map,link.to);
				var newLink = new Link(from, to).addToGroup(newTerm);
				newLink.reverse = link.reverse;
				newLink.colour = link.colour;
			}

			return newTerm;
		}

		getEndpoint(map,endpoint) {
			var mappedEndpoint = map.get(endpoint);
			if (mappedEndpoint == null) return endpoint;
			return mappedEndpoint;
		}

		copy() {
			var map = new Map();
			return this.copyBox(map);
		}

		quotient() {
			var changed = false;
			for (let node of this.nodes) {
				if (node instanceof Term) {
					if (node.nodes.length == 0) {
						changed = true;
						node.delete();
					} else if (!(node.boxed && node.nodes.length == 1)) {
						node.quotient();
					}
				} else if (node.contract) { // change
					var inLinks = node.findLinksInto();
					var outLinks = node.findLinksOutOf();
					if (outLinks.length > 0) {
						var outNode = this.graph.findNodeByKey(outLinks[0].to);
						if (outNode.contract || outNode.atom || inLinks.length < 2) { // change "contract" and "atom"
							if (!(inLinks.length == 1 && outLinks.length == 1 && node.group.boxed && !outNode.group.boxed)) {
								changed = true;
								inLinks.map(x => x.changeTo(outLinks[0].to));
								outLinks[0].delete();
								node.delete();
							}
						}
					} else if (outLinks.length == 0 && inLinks.length == 0) {
						node.delete();
				}
			}
		}
		if (changed) this.quotient();
	}

}

	return Term;
});
