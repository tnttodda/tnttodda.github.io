define(function(require) {

	var Op = require('nodes/op');
	var Atom = require('nodes/atom');
	var Instance = require('nodes/instance');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class RefOp extends Op {

		constructor() {
			super("ref",true)
		}

		copy() {
			return new RefOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLink = this.findLinksOutOf()[0];

			var newNode = new Instance().changeToGroup(this.group);
			var atomNode = new Atom().changeToGroup(this.group);
			new Link(newNode.key,atomNode.key).changeToGroup(this.group);

			inLink.changeTo(newNode.key);
			outLink.changeFrom(atomNode.key);

			this.delete();
			this.prinOf.map(x => x.prin = newNode);

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return RefOp;
});
