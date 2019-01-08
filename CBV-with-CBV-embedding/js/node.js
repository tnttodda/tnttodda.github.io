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
			this.prinOf = [];
			this.inLinks = []; this.outLinks = [];
			this.addToGraph(graph); // cheating!
		}

		addToGraph(graph) {
			if (graph != null)
				graph.addNode(this);
			this.graph = graph;
			return this; // to provide chain operation
		}

		addToGroup(group) {
			this.addToGraph(graph);
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
			return this.inLinks.concat(this.outLinks);
		}

		findLinksInto() {
			var list = [];
			for (var i = 0; i < this.inLinks.length; i++) {
				list[i] = this.inLinks[i];
			}
			return list;
		}

		findLinksOutOf() {
			var list = [];
			for (var i = 0; i < this.outLinks.length; i++) {
				list[i] = this.outLinks[i];
			}
			return list;
		}

		findNodesOutOf() {
			return this.findLinksOutOf().map(k => this.graph.findNodeByKey(k));
		}

		copy(graph) {
			var newNode = new Node(this.shape, this.text, this.name).addToGraph(graph);
			newNode.width = this.width;
			newNode.height = this.height;
			return newNode;
		}

		// also delete any connected links
		delete() {
			this.prinOf.map(x => x.prin = null)
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
			return str += 'fontsize=30];'
		}

		// machine instructions
		transition(token, link) {
			return link;
		}

		rewrite(token, nextLink) {
			token.rewrite = false;
			return nextLink;
		}

		addPrinOf(term) {
			this.prinOf.push(term);
			var boxed = this.prinOf.filter(x => x.boxed);
			if (boxed.length > 0) this.prinOf.map(x => x.boxed = true);
		}
	}

	return Node;
});
