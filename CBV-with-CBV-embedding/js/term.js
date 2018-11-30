// specific group for a term in the calculus

define('term', function(require) {

	var Group = require('group');

	class Term extends Group {

		constructor(prin, auxs, box) {
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

}

	return Term;
});
