// specific group for a term in the calculus

define('term', function(require) {

	var Group = require('group');
	var Link = require('link');

	class Term extends Group {

		constructor(prin, auxs) {
			super();
			this.set(prin, auxs)
			this.buxs = [];
			this.boxed = false;
			this.thunk = false;
		}

		set(prin, auxs) {
			this.prin = prin;
			if (prin) prin.addPrinOf(this);
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
			if (this.buxs.indexOf(node) > -1)
				this.buxs.splice(this.buxs.indexOf(node), 1);
			super.removeNode(node);
		}

		copyBox(map) {
			var newTerm = new Term();
			newTerm.boxed = this.boxed;
			if (!map.has(this.prin.key)) {
				var newPrin = this.prin.copy().addToGroup(newTerm);
				map.set(this.prin.key, newPrin.key);
			} else {
				var newPrin = this.graph.findNodeByKey(map.get(this.prin.key));
			}

			newTerm.set(newPrin,[]); newTerm.buxs = [];
			for (let node of this.nodes) {
				if (!map.has(node.key)) {
					var newNode;
					if (node instanceof Term) {
						var list = node.copyBox(map);
						newNode = list[1].addToGroup(newTerm);
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
				newTerm.buxs.push(newBux);
			}

			for (let link of this.links) {
				var newLink = new Link(link.from,link.to).addToGroup(newTerm);
				newLink.reverse = link.reverse;
				newLink.colour = link.colour;
			}

			return [map,newTerm];
		}

		copyLinks(map,newTerm) {
			for (let node of newTerm.nodes) {
				if (node instanceof Term)
					this.copyLinks(map,node);
			}
			for (let link of newTerm.links) {
				link.changeFrom(this.getEndpoint(map,link.from));
				link.changeTo(this.getEndpoint(map,link.to));
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
			var list = this.copyBox(map);
			return this.copyLinks(list[0],list[1])
		}

		quotient() {
			var changed = false;
			for (let node of this.nodes) {
				if (node instanceof Term) {
					if (node.nodes.length == 0) {
						changed = true;
						node.delete();
					} else if (!(node.boxed && node.nodes.length == 1 && node.nodes[0].contract)) { // change
						node.quotient();
					}
				} else {
					var inLinks = node.findLinksInto();
					var outLinks = node.findLinksOutOf();
					if (node.contract) { // change
						if (outLinks.length > 0) {
							var outNode = this.graph.findNodeByKey(outLinks[0].to);
							if (outNode.contract || outNode.atom || inLinks.length < 2) { // change "contract" and "atom"
								if (!(inLinks.length == 1 && outLinks.length == 1 && (node.group.boxed))) {
									changed = true;
									inLinks.map(x => x.changeTo(outLinks[0].to));
									outLinks[0].delete();
									node.delete();
								}
							}
						}
					}
					if (outLinks.length == 0 && inLinks.length == 0) {
						changed = true;
						node.delete();
					}
				}
			}
			if (changed) this.quotient();
		}

}

	return Term;
});
