define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class AppOp extends Op {

		constructor(active) {
			super("@", active);
		}

		copy() {
			return new AppOp(this.active);
		}

		rewrite(token) {
			var n = this.findLinksOutOf().reduce((sum,x) => sum + this.graph.findNodeByKey(x.to).name, 0);
			var newNode = new IntOp(n,false).addToGroup(this.group);
			return this.activeRewrite(token,newNode);
		}

	}

	return AppOp;
});
