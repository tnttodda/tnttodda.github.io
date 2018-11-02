define(function(require) {

	var Flag = require('token').RewriteFlag();
	var Expo = require('nodes/expo');
	var Atom = require('nodes/atom');

	class Contract extends Expo {

		constructor(name) {
			super("point", "", name);
		}

		transition(token, link) {
			if (link.to == this.key) {
				//token.boxStack.push(link);
				//token.rewriteFlag = RewriteFlag.F_C;
				return this.findLinksOutOf(null)[0];
			}
			// else if (link.from == this.key && token.boxStack.length > 0) {
			// 	return token.boxStack.pop();
			// }
		}

		rewrite(token) {
			var link = token.link;
			var inLinks = this.findLinksInto("s");
			var outLinks = this.findLinksOutOf("n");
			var nextLink = outLinks[0];
			var nextNode = this.graph.findNodeByKey(nextLink.to);

			// First/second contraction
			if (nextNode instanceof Contract || nextNode instanceof Atom) {
				inLinks.map(l => l.changeTo(nextNode.key,"s"));
				nextLink.delete();
			} else {
				var copy = nextNode.group.copy(this.group);
				link.changeTo(copy.key,"s");
				copy.addToGroup(this.group);
		}

			token.rewriteFlag = Flag.SEARCH;
			return link;
		}

		copy() {
			var con = new Contract(this.name);
			con.text = this.text;
			return con;
		}

		draw(level) {
			return level + this.key + '[shape=' + this.shape + '];';
		}
	}

	return Contract;
});
