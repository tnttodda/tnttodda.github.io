var showKey = false;

define(function(require) {

	class Node {
		constructor(shape, text, name) {
			this.key = null;
			this.shape = shape;
			this.text = text;
			this.name = name; // identifier name or constant name if any
			this.graph = null;
			this.group = null;
			this.width = 0.3;
			this.height = 0.3;
			this.links = [];
			this.addToGraph(graph); // cheating!
		}

		addToGraph(graph) {
			if (graph != null)
				graph.addNode(this);
			this.graph = graph;
			return this; // to provide chain operation
		}

		addToGroup(group) {
			group.addNode(this);
			this.group = group;
			return this; // to provide chain operation
		}

		changeToGroup(group) {
			this.group.removeNode(this);
			this.addToGroup(group);
			return this;
		}

		findLinksConnected() {
			return this.links;
		}

		findLinksInto() {
			var links = [];
			for (let link of this.links) {
				if (link.to == this.key)
					links.push(link);
			}
			return links;
		}

		findLinksOutOf() {
			var links = [];
			for (let link of this.links) {
				if (link.from == this.key)
					links.push(link);
			}
			return links;
		}

		findNodesOutOf() {
			var links = this.findLinksOutOf()
			var nodeKeys = links.map(l => l.to)
			return nodeKeys.map(k => this.graph.findNodeByKey(k));
		}

		copy(graph) {
			var newNode = new Node(this.shape, this.text, this.name).addToGraph(graph);
			newNode.width = this.width;
			newNode.height = this.height;
			return newNode;
		}

		// also delete any connected links
		delete() {
			this.group.removeNode(this);
			this.graph.removeNode(this);
		}

		draw(level) {
			var str = level + this.key + '[label="' + this.text;
			if (showKey)
				str += ':' + this.key;
			str += '"';
			if (this.shape != null)
				str += ',shape=' + this.shape;
			if (this.width != null)
				str += ',width=' + this.width;
			if (this.height != null)
				str += ',height=' + this.height;
			return str += '];'
		}

		// machine instructions
		transition(token, link) {
			return link;
		}

		rewrite(token, nextLink) {
			token.rewrite = false;
			return nextLink;
		}
	}

	return Node;
});
