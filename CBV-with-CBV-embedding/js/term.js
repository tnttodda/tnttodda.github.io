// specific group for a term in the calculus

define('term', function(require) {

	var Group = require('group');
	var Link = require('link');

	class Term extends Group {

		constructor(prin, auxs) {
			super();
			this.prin = null;
			this.set(prin, auxs)
		}

		set(prin, auxs) {
			this.prin = prin;
			this.auxs = auxs;
			return this;
		}

}

	return Term;
});
