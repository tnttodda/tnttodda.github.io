define(function(require) {

	var Op = require('nodes/op');              // superclass being extended
	var BoolOp = require ('nodes/ops/bool');   // boolean nodes
	var Link = require('link');                // class of edges 
	var Flag = require('token').RewriteFlag(); // search/rewrite/value flag

	class CoinOp extends Op {

		constructor() {
			super("coin",true)  // name of node, passive/active
		}

		copy() {
			return new CoinOp();
		}

		rewrite(token) {
			var b = Math.random() < 0.5 ;
			var newNode = new BoolOp(b,false).changeToGroup(this.group);
			return this.activeRewrite(token,newNode);
		}

	}

	return CoinOp;
});
