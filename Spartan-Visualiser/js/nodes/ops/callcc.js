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

		constructor() {
			super("ccc",true)
		}

		copy() {
			return new CallccOp();
		}

		rewrite(token) {
			var inLink = this.findLinksInto()[0];
			var outLinks = this.findLinksOutOf();

			var term = this.group;
			var group = term.group;
			var fromNode = this.graph.findNodeByKey(inLink.from);

			var boxedTerm = this.graph.findNodeByKey(outLinks[0].to).getBoxed();
			var auxs = boxedTerm.auxs;

			boxedTerm.removeFromGroup();
			var C = this.graph.findNodeByKey("nd3");
			C.set(this.graph.findNodeByKey(this.graph.findNodeByKey("nd2").findLinksOutOf()[0].to),[]); // cheating
			C = C.copy();
			boxedTerm.changeToGroup(group);

			boxedTerm.unbox();
			var ccCopy = this.graph.findNodeByKey(boxedTerm.prin.findLinksInto()[1].from);
			var inLinkCopy = ccCopy.findLinksInto()[0]

			var newNode = new AppOp().changeToGroup(this.group);
			var lambdaTerm = new Term().changeToGroup(this.group);
			var lambdaNode = new LambdaOp().changeToGroup(lambdaTerm);
			lambdaTerm.set(lambdaNode,[]);
			var abortTerm = new Term().changeToGroup(lambdaTerm);
			var abortNode = new AbortOp().changeToGroup(abortTerm);
			abortTerm.set(abortNode,[]);
			abortTerm.box();

			var xTerm = new Term().changeToGroup(abortTerm)
			C.changeToGroup(xTerm);
			var xNode = new Contract().changeToGroup(abortTerm);
			xTerm.set(C.prin,[]);
			xTerm.box();
			abortTerm.buxs = [xNode];

			new Link(newNode.key,lambdaTerm.prin.key).changeToGroup(this.group);
			new Link(lambdaNode.key,abortTerm.prin.key).changeToGroup(lambdaTerm);
			new Link(abortNode.key,xTerm.prin.key).changeToGroup(abortTerm);
			inLinkCopy.clearFocus();
			inLinkCopy.changeTo(xNode.key);
			ccCopy.delete();

			inLink.changeTo(newNode.key);
			outLinks[0].changeFrom(newNode.key);
			this.delete();

			token.rewriteFlag = Flag.SEARCH;
			return inLink;
		}

	}

	return CallccOp;
});
