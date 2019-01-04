define(function() {

	class Link {
		constructor(from, to, argNo) {
			this.from = from;
			this.to = to;
			this.argNo = argNo;
			this.clearFocus();
			this.addToGraph(graph); // cheating
			this.addToNode();
		}

		addToNode() {
			var fromNode = this.graph.findNodeByKey(this.from);
			var toNode = this.graph.findNodeByKey(this.to);
			toNode.inLinks.push(this);
			if (this.argNo == null) {
				fromNode.outLinks.push(this);
			} else {
				fromNode.outLinks.splice(this.argNo,0,this);
			}
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

		draw(level,state) {
			var p = "_"
			var label = " ";
			if (this.argNo == 0) p = "w";
			if (this.argNo == 2) p = "e";
			if (this.graph.findNodeByKey(this.from).outLinks.length < 2) p = "_";
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
