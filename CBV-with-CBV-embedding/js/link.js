define(function() {

	class Link {
		constructor(from, to, argNo) {
			this.from = from; this.to = to;
			this.group = null; this.graph = null;
			this.colour = "black"; this.penWidth = null
			this.addToGraph(graph); // cheating
			this.addToNode(argNo);
		}

		addToNode(argNo) {
			var fromNode = this.graph.findNodeByKey(this.from);
			var toNode = this.graph.findNodeByKey(this.to);
			toNode.inLinks.push(this);
			if (argNo == null) argNo = fromNode.outLinks.length+1;
			fromNode.outLinks.splice(argNo,0,this);
		}

		addToGraph(graph) {
			if (graph != null) graph.addLink(this);
			this.graph = graph;
			return this; // to provide chain operation
		}

		addToGroup(group) {
			group.addLink(this);
			this.group = group;
			return this; // to provide chain operation
		}

		changeToGroup(group) {
			this.group.removeLink(this);
			this.addToGroup(group);
			return this;
		}

		changeFrom(key) {
			var fromNode = this.graph.findNodeByKey(this.from);
			const i = fromNode.outLinks.indexOf(this);
			fromNode.outLinks.splice(i, 1);

			this.from = key;
			fromNode = this.graph.findNodeByKey(this.from);
			fromNode.outLinks.splice(i,0,this);
		}

		changeTo(key) {
			var toNode = this.graph.findNodeByKey(this.to);
			const i = toNode.inLinks.indexOf(this);
			toNode.inLinks.splice(i, 1);

			this.to = key;
			toNode = this.graph.findNodeByKey(this.to);
			toNode.inLinks.splice(i,0,this);
		}

		delete() {
			var fromNode = this.graph.findNodeByKey(this.from);
			fromNode.outLinks.splice(fromNode.outLinks.indexOf(this), 1);
			var toNode = this.graph.findNodeByKey(this.to);
			toNode.inLinks.splice(toNode.inLinks.indexOf(this), 1);
			this.group.removeLink(this);
			this.graph.removeLink(this);
		}

		focus() 		 { this.colour = "red"; 	this.penWidth = "20"; }
		clearFocus() { this.colour = "black"; this.penWidth = null; }

		toString() { return this.from + "->" + this.to; }

		getPort() {
			var fromNode = this.graph.findNodeByKey(this.from);
			var fromNodeOutLinks = fromNode.findLinksOutOf();
			if (fromNodeOutLinks.length > 1) {
				var i = fromNodeOutLinks.findIndex(x => x == this);
				if (i == 0) return "nw";
				if (i == 2) return "ne";
			}
			return "_";
		}

		draw(level,state) {
			var p = this.getPort();
			var label = " ";
			if (this.colour == "red") label = "  " + state;
			var str = level += this.from + '->' + this.to + '[';
					str += 'label="' + label + '",fontcolor=red,fontsize=30,'
					str += 'tailport=' + p + ',headport=_,'
					str += 'color=' + this.colour + ",penwidth=" + this.penWidth + '];'
			return str;
		}
	}

	return Link;
});
