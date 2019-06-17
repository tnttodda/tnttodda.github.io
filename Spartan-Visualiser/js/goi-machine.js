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
		var PairOp = require('nodes/ops/pair');
		var FstOp = require('nodes/ops/fst');
		var SndOp = require('nodes/ops/snd');
		var PlusOp = require('nodes/ops/plus');
		var MinusOp = require('nodes/ops/minus');
		var TimesOp = require('nodes/ops/times');
		var ModOp = require('nodes/ops/mod');
		var LeqOp = require('nodes/ops/leq');
		var AndOp = require('nodes/ops/and');
		var OrOp = require('nodes/ops/or');
		var NotOp = require('nodes/ops/not');
		var EqualsOp = require('nodes/ops/equals');
		var IfOp = require('nodes/ops/if');
		var SuccOp = require('nodes/ops/succ');
		var LambdaOp = require('nodes/ops/lambda');
		var AppOp = require('nodes/ops/app');
		var RefOp = require('nodes/ops/ref');
		var DerefOp = require('nodes/ops/deref');
		var AssignOp = require('nodes/ops/assign');
		var UnitOp = require('nodes/ops/unit');
		var SecOp = require('nodes/ops/sec');
		var AbortOp = require('nodes/ops/abort');
		var CallccOp = require('nodes/ops/callcc');
		var RecOp = require('nodes/ops/rec');
		var ScopeOp = require('nodes/ops/scope');
		var BreakOp = require('nodes/ops/break');
		var ContOp = require('nodes/ops/cont');
		var ReturnOp = require('nodes/ops/return');

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
				var start = new Start().changeToGroup(this.graph.child);
				var term = this.toGraph(ast,[]).changeToGroup(this.graph.child);
				this.term = term;
				var link = new Link(start.key, term.prin.key).changeToGroup(this.graph.child);
				this.token.reset(link);
			}

			// translation
			toGraph(ast) {
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
						auxs = Contract.createDNet(([].concat.apply([], ast.ctx)).length, [], term);
						prin = auxs[ast.ctx[0].indexOf(ast.name)];
					} else {
						auxs = auxs.concat(Contract.createDNet(ast.ctx[0].length+i, [], term));
						prin = new Instance().changeToGroup(term);
						auxs.push(prin);
						auxs = auxs.concat(Contract.createDNet(ast.ctx[1].length-i-1, [], term));
					}
					term.set(prin, auxs);

				// BINDINGS & REFERENCES
				} else if ((ast instanceof Binding) || (ast instanceof Reference))  {
					var body = this.toGraph(ast.body).changeToGroup(term);
					var param = this.toGraph(ast.param).changeToGroup(term);

					var auxs = body.auxs;
					const i = ([].concat.apply([], ast.body.ctx)).indexOf(ast.id);
					var auxNode = auxs[i];
					auxs.splice(i,1);
					auxs = auxs.concat(param.auxs);

					if (ast instanceof Reference) {
						var atomNode = new Atom().changeToGroup(param);
						new Link(atomNode.key, param.prin.key).changeToGroup(param);
						param.prin = atomNode;
					}
					new Link(auxNode.key, param.prin.key).changeToGroup(term);

					auxs = Contract.createDNet(([].concat.apply([], ast.ctx)).length, auxs, term);
					term.set(body.prin, auxs);

				// OPERATIONS
				} else if (ast instanceof Operation) {
					var op = this.toOp(ast.name,ast.active).changeToGroup(term);

					var auxs = [];

					var next;
					for (var i = 0; i < ast.sig[0]; i++) {
						next = this.toGraph(ast.eas[i]).changeToGroup(term);
						new Link(op.key, next.prin.key,i).changeToGroup(term);
						auxs = auxs.concat(next.auxs);
					}
					for (var i = 0; i < ast.sig[1]; i++) {
						next = this.toGraph(ast.das[i]).changeToGroup(term);
						var link = new Link(op.key, next.prin.key,i+ast.sig[0]);
						link.changeToGroup(term);
						auxs = auxs.concat(next.auxs);
					}

					auxs = Contract.createDNet(([].concat.apply([], ast.ctx)).length, auxs, term);
					term.set(op, auxs);
				}

				term.buxs = [];
				while (bounds.length > 0) {
					term.buxs.push(auxs[ast.ctx[0].indexOf(bounds[0])]);
					auxs.splice(ast.ctx[0].indexOf(bounds[0]),1);
					bounds.splice(0,1);
				}

				return term;
			}

			toOp(name) {
				if (Number.isInteger(parseInt(name))) {
					return new IntOp(name);
				} else if (name == "true" || name == "false") {
					return new BoolOp(name);
				} else if (name == "P") {
					return new PairOp();
		    } else if (name == "π₁") {
					return new FstOp();
				} else if (name == "π₂") {
					return new SndOp();
				} else if (name == "++") {
					return new SuccOp();
				} else if (name == "+") {
					return new PlusOp();
				} else if (name == "-") {
					return new MinusOp();
				} else if (name == "*") {
					return new TimesOp();
				} else if (name == "%") {
					return new ModOp();
				} else if (name == "<=") {
					return new LeqOp();
				} else if (name == "∧") {
					return new AndOp();
				} else if (name == "∨") {
					return new OrOp();
				} else if (name == "¬") {
					return new NotOp();
				} else if (name == "==") {
					return new EqualsOp();
				} else if (name == "if") {
					return new IfOp();
				} else if (name == "λ") {
					return new LambdaOp();
				} else if (name == "@") {
					return new AppOp();
				} else if (name == "ref") {
					return new RefOp();
				} else if (name == "!") {
					return new DerefOp();
				} else if (name == ":=") {
					return new AssignOp();
				} else if (name == "()") {
					return new UnitOp();
				} else if (name == ";") {
					return new SecOp();
				} else if (name == "abort") {
					return new AbortOp();
				} else if (name == "callcc") {
					return new CallccOp();
				} else if (name == "μ") {
					return new RecOp();
				} else if (name == "scope") {
					return new ScopeOp();
				} else if (name == "break") {
					return new BreakOp();
				} else if (name == "cont.") {
					return new ContOp();
				} else if (name == "ret.") {
					return new ReturnOp();
				} else if (name == "coin") {
					return new CoinOp();
				} else {
					return new Op(name);
				}
			}

			// machine step
			transition() {
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
					} else {
						this.token.setLink(null);
						play = false;
						playing = false;
						finished = true;
					}
				}
			}

			pass(token) { // this needs cleaning up!
				var link = token.link;
				if (token.rewriteFlag == Flag.SEARCH) {
					var to = this.graph.findNodeByKey(link.to);
					var outlinks = to.findLinksOutOf();
					if (to.text == "I" || to instanceof Instance) { // fix
						token.rewriteFlag = Flag.RETURN;
					} else if (to instanceof Op) {
						if (outlinks.filter(x => !this.graph.findNodeByKey(x.to).isBoxed()).length == 0) {
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
				links = links.filter(x => !this.graph.findNodeByKey(x.to).isBoxed());
				return (links.length == (1 + links.findIndex(x => (x == link))));
			}

		}
		return GoIMachine;
	}
);
