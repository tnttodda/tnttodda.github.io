var graph = null;

define('goi-machine',
	function(require) {
		var Flag = require('token').RewriteFlag();

		var Termast = require('ast/term');

		var Variable = require('ast/var');
		var Atom = require('ast/atom');
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
		var DNet = require('dnet');

		var Atom = require('nodes/atom');
		var Contract = require('nodes/contract');
		var Start = require('nodes/start');
		var Weak = require('nodes/weak');
		var Op = require('nodes/op');

		var GC = require('gc');

		class GoIMachine {

			constructor() {
				this.graph = new Graph();
				graph = this.graph; // cheating!
				this.token = new MachineToken();
				this.gc = new GC(this.graph);
				this.count = 0;
			}

			compile(source) {
				const lexer = new Lexer(source + '\0');
				const parser = new Parser(lexer);
				const ast = parser.parse();
				// init
				this.graph.clear();
				this.token.reset();
				this.count = 0;
				// create graph
				var start = new Start().addToGroup(this.graph.child);
				var term = this.toGraph(ast, this.graph.child);
				new Link(start.key, term.prin.key, "_", "_").addToGroup(this.graph.child);
			}

			// translation
			toGraph(ast, group) {
				var graph = this.graph;
				var term = new Term().addToGroup(group);

				// VARIABLES & ATOMS
				if (ast instanceof Variable) {
					var auxs = [];
					for (var i = 0; i < ast.ctx.length; i++) {
						var c = new Contract().addToGroup(term);
						if ((ast.ctx[i]).name == ast.name) { c.name = ast.name; var bigc = c; }
						auxs.push(c);
					}
					term.set(bigc, auxs);

				// BINDINGS & REFERENCES
				} else if ((ast instanceof Binding) || (ast instanceof Reference))  {
					var body = this.toGraph(ast.body, term).addToGroup(term);
					var auxs = body.auxs;
					var auxNode = auxs[0];
					auxs.splice(0,1)

					var paramNode = this.toGraph(ast.param, term).addToGroup(term);
					//put back in later -- var ref = (ast instanceof Reference);
					new Link(auxNode.key, paramNode.prin.key, "_", "_").addToGroup(term);
					auxs = auxs.concat(paramNode.auxs);

					if (ast.ctx.length > 0)
						auxs = new DNet(ast.ctx, auxs).addToGroup(term).outputs;

					term.set(body.prin, auxs);

				// OPERATIONS
				} else if (ast instanceof Operation) {
					var op = new Op(ast.name,ast.active).addToGroup(term);
					var auxs = []

					var next;
					for (var i = 0; i < ast.type; i++) {
						next = this.toGraph(ast.eas[i], term).addToGroup(term);
						new Link(op.key, next.prin.key, "_", "_").addToGroup(term);
						auxs = auxs.concat(next.auxs);
					}

					auxs = new DNet(ast.ctx, auxs, op).addToGroup(term).outputs;

					term.set(op, auxs);
				}
				return term;
			}

			quotieningRules() {
				// TODO
				// Loop through all links in the graph
				// Perform quotiening rules
				return null;
			}

			// machine step -- TODO
			pass(flag, dataStack, boxStack) {
				if (!finished) {
					this.count++;
					if (this.count == 200) {
						this.count = 0;
						//this.gc.collect(); // later...
					}

					var node;
					if (this.token.link != null) {
						var target = this.token.forward ? this.token.link.to : this.token.link.from;
						node = this.graph.findNodeByKey(target);
					} else {
						node = this.graph.findNodeByKey("nd1");
						this.token.link = node.findLinksOutOf()[0]; // hacking!
						this.token.setLink(this.token.link); // hacking!
						return; // hacking!
					}

					this.token.rewrite = false;
					var nextLink;
					if (this.token.rewriteFlag == Flag.REWRITE) {
						nextLink = node.rewrite(this.token);
					} else {
						nextLink = this.ptransition(this.token);
					}
					if (nextLink != null) {
						this.token.setLink(nextLink);
						//this.printHistory(flag, dataStack, boxStack);
						//this.token.transited = true;
					} else {
						//this.gc.collect(); //later...
						this.token.setLink(null);
						play = false;
						playing = false;
						finished = true;
					}
				}
			}

			// printHistory(flag, dataStack, boxStack) {
			// 	flag.val(this.token.rewriteFlag + '\n' + flag.val());
			// 	var dataStr = this.token.dataStack.length == 0 ? '□' : Array.from(this.token.dataStack).reverse().toString() + ',□';
			// 	dataStack.val(dataStr + '\n' + dataStack.val());
			// 	var boxStr = this.token.boxStack.length == 0 ? '□' : Array.from(this.token.boxStack).reverse().toString() + ',□';
			// 	boxStack.val(boxStr + '\n' + boxStack.val());
			// }

		ptransition(token) { // maybe change back to original OO design
			var link = token.link;
			if (token.rewriteFlag == Flag.SEARCH) {
				var to = this.graph.findNodeByKey(link.to);
				var outlinks = to.findLinksOutOf();
				if (to instanceof Atom) {
					token.rewriteFlag = Flag.RETURN;
					return link;
				} else if (to instanceof Op) {
					if (outlinks.length == 0) {
						if (to.active) {
							token.rewriteFlag = Flag.REWRITE;
						} else {
							token.rewriteFlag = Flag.RETURN;
						}
						return link;
					} else {
						return outlinks[0];
					}
				} else if (to instanceof Contract) {
					token.rewriteFlag = Flag.REWRITE; // REWRITE;
					return link;
				}
			} else if (token.rewriteFlag == Flag.RETURN) {
				var from = this.graph.findNodeByKey(link.from);
				var outlinks = from.findLinksOutOf();
				if (this.doneVisiting(link,outlinks)) { // HACKING
					if (from.active) {
						token.rewriteFlag = Flag.REWRITE;
						return from.findLinksInto("s")[0];
					} else {
						token.rewriteFlag = Flag.RETURN;
						return from.findLinksInto("_")[0];
					}
				} else {
					token.rewriteFlag = Flag.SEARCH;
					var j = this.findJ(link,outlinks);
					return outlinks[j];
				}
			}
			return link;
		}

		doneVisiting(link, links) {
			for (let l of links) {
				if ((!l.visited) && (l != link))
					return false;
				}
			return true;
			}

		findJ(link,list) {
			for (var j = 0; j < list.length; j++) {
				if ((!list[j].visited) && (list[j] != link))
					return j;
			}
			return null;
		}

	}

		return GoIMachine;
	}
);
