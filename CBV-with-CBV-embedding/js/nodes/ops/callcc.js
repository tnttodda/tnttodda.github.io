define(function(require) {

	var Op = require('nodes/op');
	var Link = require('link');
	var Flag = require('token').RewriteFlag();
	var Term = require('term');
	var LambdaOp = require('nodes/ops/lambda');
	var AppOp = require('nodes/ops/app');
	var AbortOp = require('nodes/ops/abort');
	var Contract = require('nodes/contract');

	class CallccOp extends Op {

		constructor(active) {
			super("callcc", true);
		}

		copy() {
			return new CallccOp(this.active);
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var term = this.group;
			var group = term.group;
			var fromNode = this.graph.findNodeByKey(inLink.from);

			term.removeFromGroup(null);
			var C = this.graph.findNodeByKey("nd3").copy();
			term.addToGroup(group);

			this.graph.findNodeByKey(outLinks[0].to).unbox();

			var newNode = new AppOp(true).addToGroup(this.group);
			var lambdaTerm = new Term().addToGroup(this.group);
			var lambdaNode = new LambdaOp(false).addToGroup(lambdaTerm);
			lambdaTerm.set(lambdaNode,[]);
			var abortTerm = new Term().addToGroup(lambdaTerm);
			var abortNode = new AbortOp(true).addToGroup(abortTerm);
			abortTerm.set(abortNode,[]);
			abortTerm.box();

			var xTerm = new Term().addToGroup(abortTerm)
			C.addToGroup(xTerm);
			var xNode = new Contract().addToGroup(abortTerm);
			xTerm.set(C.prin,[]);
			xTerm.box();
			abortTerm.buxs = [xNode];

			new Link(newNode.key,lambdaTerm.prin.key).addToGroup(this.group);
			new Link(lambdaNode.key,abortTerm.prin.key).addToGroup(lambdaTerm);
			new Link(abortNode.key,xTerm.prin.key).addToGroup(abortTerm);
			var inLinkCopy = this.findLinksInto()[1];
			inLinkCopy.clearFocus();
			inLinkCopy.changeTo(xNode.key);

			inLink.changeTo(newNode.key);
			outLinks[0].changeFrom(newNode.key);
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return CallccOp;
});
