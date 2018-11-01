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
			this.reset();
		}

		setLink(link) {
			if (this.link != null)
				this.link.clearFocus();
			this.link = link;
			if (this.link != null) {
				console.log(link);
				this.link.focus("red");
			}
		}

		reset() {
			this.forward = true;
			this.rewrite = false;
			this.transited = false;

			this.link = null;

			this.rewriteFlag = Flag.SEARCH;
		}
	}

	return MachineToken;
});
