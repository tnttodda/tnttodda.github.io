// specific group for a term in the calculus

define('term', function(require) {

	var Group = require('group');
	var Link = require('link');

	class Term extends Group {

		constructor(prin, auxs) {
			super();
			this.prin = null;
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
						newNode = node.copy();
						map.set(node.key, newNode.key);
					}
				}
		}
			for (let aux of this.auxs) {
				var newAux = aux.copy().addToGroup(newTerm);
				newTerm.auxs.push(newAux);
				map.set(aux.key, newAux.key);
			}

			for (let link of this.links) {
				var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newTerm);
				newLink.reverse = link.reverse;
				newLink.colour = link.colour;
			}

			console.log(map);
			return newTerm;
		}

		copy() {
			var map = new Map();
			return this.copyBox(map);
		}

}

	return Term;
});
