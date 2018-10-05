define('nodes/der', function(require) {

	var Expo = require('nodes/expo');

	class Der extends Expo {

		constructor(name) {
			super(null, "D", name);
		}

		copy() {
			var der = new Der(this.name);
			der.text = this.text;
			return der;
		}
	}

	return Der;
});


define('nodes/var', function(require) {

	var Der = require('nodes/der');
	var Expo = require('nodes/expo');
	var Abs = require('nodes/abs');

	class Var extends Der {

		deleteAndPreserveOutLink() { 
			var inLink = this.findLinksInto(null)[0];
			var outLink = this.findLinksOutOf(null)[0];
			var inNode = this.graph.findNodeByKey(inLink.from);
			if (inLink != null && outLink != null) {
				if (this.graph.findNodeByKey(outLink.to) instanceof Abs && (inNode instanceof Expo))
					outLink.changeFrom(inLink.from, "nw");
				else
					outLink.changeFrom(inLink.from, inLink.fromPort);
			}
			super.delete();
		}

	}

	return Var;
});
