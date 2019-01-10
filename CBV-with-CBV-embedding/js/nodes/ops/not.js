define(function(require) {

	var Op = require('nodes/op');
	var BoolOp = require('nodes/ops/bool');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();

	class NotOp extends Op {
		
		copy() {
			return new NotOp(this.name,this.active);
		}

		rewrite(token) {
			var b = !BoolOp.parseBoolean(this.graph.findNodeByKey(this.findLinksOutOf()[0].to).name);
			var newNode = new BoolOp(b,false).addToGroup(this.group);
			return this.activeRewrite(token,newNode);
		}

	}

	return NotOp;
});
