define(function() {

	var Flag = {
		SEARCH:  '?',
		REWRITE: '↯',
		RETURN:	 '✓',
	}

	class MachineToken {

		static RewriteFlag() { return Flag; }

		constructor() {
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

		reset() {
			this.forward = true;
			this.rewrite = false;
			this.transited = false;
			
			this.link = null;
			
			this.rewriteFlag = RewriteFlag.SEARCH;
		}
	}

	return MachineToken;
});
