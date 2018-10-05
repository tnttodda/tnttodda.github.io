define(function(require) {

	var Node = require('node');
	var Flag = require('token').Flag();

	class Start extends Node {

		constructor() {
			super("point", "");
		}
		
		transition(token) {
			if (token.link == null && token.dataStack.last() == CompData.PROMPT) {
				token.forward = true;
				return this.findLinksOutOf(null)[0];
			}
			else 
				return null;
		}
		
		copy() {
			return new Start();
		}

		draw(level) {
			return level + this.key + '[shape=' + this.shape + '];'; 
		}

	}

	return Start;
});