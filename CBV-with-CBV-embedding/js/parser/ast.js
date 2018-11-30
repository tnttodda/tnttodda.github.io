// edited by todd

define('ast/term', function() {
  class Term {
    constructor(ctx) {
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
      super(ctx);
      this.name = name;
    }
  }
  return Var;
});

define('ast/operation', function(require) {
  var Term = require('ast/term');

  class Operation extends Term {
    constructor(ctx, sig, name, active, eas, das) {
      super(ctx);
      this.sig = sig;
      this.name = name;
      this.active = active;
      this.eas = eas;
      this.das = das;
    }
  }
  return Operation;
});

define('ast/thunk', function(require) {
  var Term = require('ast/term');

  class Thunk extends Term {
    constructor(ctx, inner) {
      super(ctx);
      this.inner = inner;
    }
  }
  return Thunk;
});

define('ast/binding', function(require) {
  var Term = require('ast/term');
    /**
     * param here is the name of the variable of the abstraction. Body is the
     * subtree  representing the body of the abstraction.
     */

  class Binding extends Term {
    constructor(ctx, id, param, body) {
      super(ctx);
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
      super(ctx);
      this.id = id;
      this.param = param;
      this.body = body;
    }
  }
  return Reference;
});
