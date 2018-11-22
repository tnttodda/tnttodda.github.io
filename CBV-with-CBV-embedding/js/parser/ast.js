// edited by todd

define('ast/term', function() {
  class Term {
    constructor(type, ctx) {
      this.type = type;
      this.ctx = ctx;
    }
  }
  return Term;
});

define('ast/var', function(require) {
  var Term = require('ast/term');
    /**
     * name is the string matched for this identifier.
     */
  class Var extends Term {
    constructor(ctx, name) {
      super(0,ctx);
      this.name = name;
    }
  }
  return Var;
});

define('ast/atom', function(require) {
  var Term = require('ast/term');
    /**
     * name is the string matched for this identifier.
     */
  class Atom extends Term {
    constructor(ctx, name) {
      super(0);
      this.name = name;
    }
  }
  return Atom;
});

define('ast/operation', function(require) {
  var Term = require('ast/term');

  class Operation extends Term {
    constructor(ctx, type, name, active, eas, das) {
      super(type, ctx);
      this.name = name;
      this.active = active;
      this.eas = eas;
      this.das = das;
    }
  }
  return Operation;
});

define('ast/binding', function(require) {
  var Term = require('ast/term');
    /**
     * param here is the name of the variable of the abstraction. Body is the
     * subtree  representing the body of the abstraction.
     */

  class Binding extends Term {
    constructor(ctx, id, param, body) {
      super(0, ctx);
      this.id = id;
      this.param = param;
      this.body = body;
    }
  }
  return Binding;
});

define('ast/reference', function(require) {
  var Term = require('ast/term');
    /**
     * param here is the name of the variable of the reference. Body is the
     * subtree  representing the body of the abstraction.
     */

  class Reference extends Term {
    constructor(ctx, id, param, body) {
      super(0, ctx);
      this.id = id;
      this.param = param;
      this.body = body;
    }
  }
  return Reference;
});
