// specific group for a term in the calculus

define('term', function(require) {

	var Group = require('group');
	var Link = require('link');
	var Contract = require('nodes/contract');

	class Term extends Group {

		constructor(prin, auxs, group) {
			super();
			this.prin = null;
			this.set(prin, auxs, group)
		}

		set(prin, auxs, group) {
			this.prin = prin;
			this.auxs = auxs;
			this.group = group;
			this.group.term = this; // hacky.. merge groups and terms
			return this;
		}

	copyBox(map) {
		var newBoxWrapper = new Group().addToGroup(this.group);
		if (this.prin != null) { // hacking!
			var nodes = this.prin.group.nodes;
		} else {
			var nodes = [];
		}

		newBoxWrapper.auxs = [];
		for (let node of nodes) {
			var newNode;
			if (node instanceof Term) {
				newNode = node.copyBox(map).addToGroup(newBoxWrapper);
			} else {
				var newNode = node.copy().addToGroup(newBoxWrapper);
				map.set(node.key, newNode.key);
			}
		}
		for (let aux of this.auxs) {
			var newAux = aux.copy().addToGroup(newBoxWrapper);
			newBoxWrapper.auxs.push(newAux);
			map.set(aux.key, newAux.key);
		}

		for (let link of this.links) {
			if (link.colour != "lightgrey") { // hacking!!
				var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newBoxWrapper);
				newLink.reverse = link.reverse;
			}
		}

		return newBoxWrapper.nodes[0];
	}

	copy() {
		var map = new Map();
		return this.copyBox(map);
	}

}

	return Term;
});
