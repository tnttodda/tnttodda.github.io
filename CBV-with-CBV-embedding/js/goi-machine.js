var graph = null;

define('goi-machine',
	function(require) {
		var Flag = require('token').RewriteFlag();

		var Variable = require('ast/var');
		var Operation = require('ast/operation');
		var Binding = require('ast/binding');
		var Reference = require('ast/reference');
		var Thunk = require('ast/thunk');

		var Lexer = require('parser/lexer');
		var Parser = require('parser/parser');

		var MachineToken = require('token');
		var Link = require('link');

		var Graph = require('graph');
		var Group = require('group');
		var Term = require('term');

		var Atom = require('nodes/atom');
		var Instance = require('nodes/instance');
		var Contract = require('nodes/contract');
		var Start = require('nodes/start');
		var Op = require('nodes/op');

		var IntOp = require('nodes/ops/int');
		var BoolOp = require('nodes/ops/bool');
		var PlusOp = require('nodes/ops/plus');
		var TimesOp = require('nodes/ops/times');
		var AndOp = require('nodes/ops/and');
		var OrOp = require('nodes/ops/or');
		var NotOp = require('nodes/ops/not');
		var EqualsOp = require('nodes/ops/equals');
		var IfOp = require('nodes/ops/if');
		var SuccOp = require('nodes/ops/succ');
		var LambdaOp = require('nodes/ops/lambda');
		var AppOp = require('nodes/ops/app');

		class GoIMachine {

			constructor() {
				this.setMachine(new Graph(),new MachineToken(),0);
			}

			setMachine(graphSet,tokenSet,countSet) {
				this.graph = graphSet;
				graph = this.graph; // cheating!
				this.token = tokenSet;
				this.count = countSet;
				this.term = null;
			}

			compile(source) {
				const lexer = new Lexer(source + '\0');
				const parser = new Parser(lexer);
				const ast = parser.parse();
				this.count = 0;

				this.graph.clear();
				var start = new Start().addToGroup(this.graph.child);
				var term = this.toGraph(ast,[]).addToGroup(this.graph.child);
				this.term = term;
				var link = new Link(start.key, term.prin.key).addToGroup(this.graph.child);
				this.token.reset(link);
			}

			// translation
			toGraph(ast) { // i'd like boudns to be in the ast tbh
				var graph = this.graph;
				var term = new Term();
				var bounds = [];
				var thunk = false;

				// THUNKS
				if (ast instanceof Thunk) {
					term.box();
					bounds = ast.bounds;
					ast = ast.inner;
				}

				// VARIABLES & ATOMS
				if (ast instanceof Variable) {
					var prin; var auxs = [];
					var i = ast.ctx[1].indexOf(ast.name);
					if (i == -1) {
						auxs = Contract.createDNet(ast.ctx.flat().length, [], term);
						prin = auxs[ast.ctx[0].indexOf(ast.name)];
					} else {
						auxs = auxs.concat(Contract.createDNet(ast.ctx[0].length+i, [], term));
						prin = new Instance().addToGroup(term);
						auxs.push(prin);
						auxs = auxs.concat(Contract.createDNet(ast.ctx[1].length-i-1, [], term));
					}
					term.set(prin, auxs);

				// BINDINGS & REFERENCES
				} else if ((ast instanceof Binding) || (ast instanceof Reference))  {
					var body = this.toGraph(ast.body).addToGroup(term);
					var param = this.toGraph(ast.param).addToGroup(term);

					var auxs = body.auxs;
					const i = ast.body.ctx.flat().indexOf(ast.id);
					var auxNode = auxs[i];
					auxs.splice(i,1);
					auxs = auxs.concat(param.auxs);

					if (ast instanceof Reference) {
						var atomNode = new Atom().addToGroup(param);
						new Link(atomNode.key, param.prin.key).addToGroup(param);
						param.prin = atomNode;
					}
					new Link(auxNode.key, param.prin.key).addToGroup(term);

					auxs = Contract.createDNet(ast.ctx.flat().length, auxs, term);
					term.set(body.prin, auxs);

				// OPERATIONS
				} else if (ast instanceof Operation) {
					var op = this.toOp(ast.name,ast.active).addToGroup(term);

					var auxs = [];

					var next;
					for (var i = 0; i < ast.sig[0]; i++) {
						next = this.toGraph(ast.eas[i]).addToGroup(term);
						new Link(op.key, next.prin.key,i).addToGroup(term);
						auxs = auxs.concat(next.auxs);
					}
					for (var i = 0; i < ast.sig[1]; i++) {
						next = this.toGraph(ast.das[i]).addToGroup(term);
						var link = new Link(op.key, next.prin.key,i+ast.sig[0]);
						link.addToGroup(term);
						auxs = auxs.concat(next.auxs);
					}

					auxs = Contract.createDNet(ast.ctx.flat().length, auxs, term);
					term.set(op, auxs);
				}

				term.buxs = []; // put this in a more integrated place e.g. ops
				while (bounds.length > 0) {
					term.buxs.push(auxs[ast.ctx[0].indexOf(bounds[0])]);
					auxs.splice(ast.ctx[0].indexOf(bounds[0]),1);
					bounds.splice(0,1);
				}

				return term;
			}

			toOp(name,active) {
				if (Number.isInteger(parseInt(name))) {
					return new IntOp(name,active);
				} else if (name == "true" || name == "false") {
					return new BoolOp(name,active);
				} else if (name == "++") {
					return new SuccOp(active);
				} else if (name == "+") {
					return new PlusOp(active);
				} else if (name == "*") {
					return new TimesOp(active);
				} else if (name == "∧") {
					return new AndOp(active);
				} else if (name == "∨") {
					return new OrOp(active);
				} else if (name == "¬") {
					return new NotOp(active);
				} else if (name == "==") {
					return new EqualsOp(active);
				} else if (name == "if") {
					return new IfOp(active);
				} else if (name == "λ") {
					return new LambdaOp(active);
				} else if (name == "@") {
					return new AppOp(active);
				} else {
					return new Op(name,active);
				}
			}

			// machine step
			transition(graphTxt, linkTxt, flagTxt) {
				if (!finished) {
					this.count++;
					var node = this.graph.findNodeByKey(this.token.link.to);

					var nextLink;
					if (this.token.rewriteFlag == Flag.REWRITE) {
						nextLink = node.rewrite(this.token);
					} else {
						nextLink = this.pass(this.token);
					}

					if (nextLink != null) {
						this.token.setLink(nextLink);
						this.printHistory(graphTxt, linkTxt, flagTxt);
					} else {
						this.token.setLink(null);
						play = false;
						playing = false;
						finished = true;
					}
				}
			}

			printHistory(graphTxt, linkTxt, flagTxt) {
				graphTxt.val(this.graph.draw().replace(/\n/g, "") + '\n' + graphTxt.val());
				linkTxt.val(this.token.link + '\n' + linkTxt.val());
				flagTxt.val(this.token.rewriteFlag + '\n' + flagTxt.val());
			}

			pass(token) { // this needs cleaning up!
				var link = token.link;
				if (token.rewriteFlag == Flag.SEARCH) {
					var to = this.graph.findNodeByKey(link.to);
					var outlinks = to.findLinksOutOf();
					if (to instanceof Instance) {
						token.rewriteFlag = Flag.RETURN;
					} else if (to instanceof Op) {
						if (outlinks.length == 0 || !to.active) {
							if (to.active)  token.rewriteFlag = Flag.REWRITE;
							if (!to.active) token.rewriteFlag = Flag.RETURN;
						} else {
							return outlinks[outlinks.findIndex(x => (x == link)) + 1];
						}
					} else if (to instanceof Contract) {
						token.rewriteFlag = Flag.REWRITE;
						return link;
					}
				} else if (token.rewriteFlag == Flag.RETURN) {
					var from = this.graph.findNodeByKey(link.from);
					var outlinks = from.findLinksOutOf();
					if (this.doneVisiting(link,outlinks)) {
						if (from.active)  token.rewriteFlag = Flag.REWRITE;
						if (!from.active) token.rewriteFlag = Flag.RETURN;
						return from.findLinksInto()[0];
					} else {
						token.rewriteFlag = Flag.SEARCH;
						return outlinks[outlinks.findIndex(x => (x == link)) + 1];
					}
				}
				return link;
			}

			doneVisiting(link, links) {
				links = links.filter(x => !this.graph.findNodeByKey(x.to).group.boxed);
				return (links.length == (1 + links.findIndex(x => (x == link))));
			}

		}
		return GoIMachine;
	}
);
