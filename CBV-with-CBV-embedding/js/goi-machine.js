var graph = null;

define('goi-machine',
	function(require) {
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
		var BoxWrapper = require('box-wrapper');

		var Expo = require('nodes/expo');
		var Const = require('nodes/const');
		var Contract = require('nodes/contract');
		var Start = require('nodes/start');
		var Der = require('nodes/der');
		var Var = require('nodes/var')
		var UnOp = require('nodes/unop');
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
				new Link(start.key, term.prin.key, "n", "s").addToGroup(this.graph.child);
				//this.deleteVarNode(this.graph.child);
			}

			// translation
			toGraph(ast, group) {
				var graph = this.graph;

				// VARIABLES
				if (ast instanceof Variable) {
					var c = new Contract(ast.name).addToGroup(group);
					return new Term(c, [c]);

				// BINDINGS
				} else if (ast instanceof Binding) {
					var id = ast.id;
					var param = ast.param;
					var term = this.toGraph(ast.body, group);

					var auxs = Array.from(term.auxs);
					var paramNode;

					paramNode = this.linkBindings(auxs, paramNode, param, group, id.name);
					if (paramNode != null)
						auxs = auxs.concat(paramNode.auxs);

					//createDNet()

					// wrapper.auxs = wrapper.createPaxsOnTopOf(auxs);
					return new Term(term.prin, auxs);

				// OPERATIONS
				} else if (ast instanceof Operation) {
					var op = new Op(ast.name).addToGroup(group);
					var eas = [];
					var DNet = [];

					for (var i = 0; i < ast.type; i++) {
						var next = this.toGraph(ast.eas[i], group);
						new Link(op.key, next.prin.key, "n", "s").addToGroup(group);
						eas.push(next);
					}

					DNet = this.createDNet(ast.ctx, eas, op, group);

					return new Term(op,DNet.auxs);
				}
			}

			createDNet(ctx, outputs, op, group) {
				var auxs = []

				for (var n = 0; n < ctx.length; n++) {
					var c = new Contract(ctx[n].name).addToGroup(group);
					auxs.push(c);

					if (outputs.length == 0)
					 	new Link(op.key, c.key, "n", "s", "gray").addToGroup(group);

					var from;
					var to;
					for (var i = 0; i < outputs.length; i++) {
						for (var j = 0; j < outputs[i].auxs.length; j++) {
							from = outputs[i].auxs[j];
							to = c;
							if (from.name == to.name)
								new Link(from.key, to.key, "n", "s").addToGroup(group);
						}
					}
				}
				return new Term(c,auxs);
			}

			linkBindings(auxs, paramNode, param, group, name) {
				for (let aux of auxs) {
					if (aux.name == name) {
						if (paramNode == null)
							paramNode = this.toGraph(param, group).addToGroup(group);

						var auxNode = aux;
						new Link(auxNode.key, paramNode.prin.key, "n", "s").addToGroup(group);
						//auxs.splice(auxs.indexOf(auxNode), 1);
					}

					//this.linkBindings(aux.auxs, paramNode, param, group, name);

				}
				return paramNode;
			}

			deleteVarNode(group) {
				for (let node of Array.from(group.nodes)) {
					if (node instanceof Group)
						this.deleteVarNode(node);
					else if (node instanceof Var)
						node.deleteAndPreserveOutLink();
				}
			}

			// machine step
			pass(flag, dataStack, boxStack) {
				if (!finished) {
					this.count++;
					if (this.count == 200) {
						this.count = 0;
						this.gc.collect();
					}

					var node;
					if (!this.token.transited) {

						if (this.token.link != null) {
							var target = this.token.forward ? this.token.link.to : this.token.link.from;
							node = this.graph.findNodeByKey(target);
						}
						else
							node = this.graph.findNodeByKey("nd1");


						this.token.rewrite = false;
						var nextLink = node.transition(this.token, this.token.link);
						if (nextLink != null) {
							this.token.setLink(nextLink);
							this.printHistory(flag, dataStack, boxStack);
							this.token.transited = true;
						}
						else {
							this.gc.collect();
							this.token.setLink(null);
							play = false;
							playing = false;
							finished = true;
						}
					}
					else {
						var target = this.token.forward ? this.token.link.from : this.token.link.to;
						node = this.graph.findNodeByKey(target);
						var nextLink = node.rewrite(this.token, this.token.link);
						if (!this.token.rewrite) {
							this.token.transited = false;
							this.pass(flag, dataStack, boxStack);
						}
						else {
							this.token.setLink(nextLink);
							this.printHistory(flag, dataStack, boxStack);
						}
					}
				}
			}

			printHistory(flag, dataStack, boxStack) {
				flag.val(this.token.rewriteFlag + '\n' + flag.val());
				var dataStr = this.token.dataStack.length == 0 ? '□' : Array.from(this.token.dataStack).reverse().toString() + ',□';
				dataStack.val(dataStr + '\n' + dataStack.val());
				var boxStr = this.token.boxStack.length == 0 ? '□' : Array.from(this.token.boxStack).reverse().toString() + ',□';
				boxStack.val(boxStr + '\n' + boxStack.val());
			}

		}

		return GoIMachine;
	}
);
