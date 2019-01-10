define(function(require) {

	var Op = require('nodes/op');
	var IntOp = require('nodes/ops/int');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class TimesOp extends Op {

		constructor() {
			super("*",true)
		}

		copy() {
			return new TimesOp();
		}

		rewrite(token) {
			var n = this.findLinksOutOf().reduce((sum,x) => sum * this.graph.findNodeByKey(x.to).name, 1);
			var newNode = new IntOp(n,false).addToGroup(this.group);
			return this.activeRewrite(token,newNode);
		}

	}

	return TimesOp;
});
