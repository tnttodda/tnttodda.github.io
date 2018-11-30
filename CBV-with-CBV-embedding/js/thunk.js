// specific group for a thunk in the calculus

define('thunk', function(require) {

	var Term = require('term');
	var Link = require('link');

	class Thunk extends Term {

		draw(level) {
			var str = "";
			for (let node of this.nodes) {
				str += node.draw(level + '  ');
			}
			return level + 'subgraph cluster_' + this.key + ' {'
				 + level + '  graph[style=dotted];'
				 + str
				 + level + '};';
		}

}

	return Thunk;
});
