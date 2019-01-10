define(function(require) {

	var Flag = {
		SEARCH:  '?',
		REWRITE: '↯',
		RETURN:	 '✓',
	}

	class MachineToken {

		static RewriteFlag() {
			return Flag;
		}

		constructor() {
			this.link = null;
			this.rewriteFlag = null;
			this.reset();
		}

		setLink(link) {
			if (this.link != null)
				this.link.clearFocus();
			this.link = link;
			if (this.link != null) {
				this.link.focus("red");
			}
		}

		reset(link) {
			this.setLink(link);
			this.rewriteFlag = Flag.SEARCH;
		}
	}

	return MachineToken;
});
