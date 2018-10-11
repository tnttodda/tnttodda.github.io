// edited by todd

define('ast/term', function() {
  class Term {
    constructor(type) {
      this.type = type;
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
    constructor(value, name) {
      super(0);
      this.value = value;
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
    constructor(name) {
      super(0);
      this.name = name;
    }
  }
  return Atom;
});

define('ast/operation', function(require) {
  var Term = require('ast/term');
  
  class Operation extends Term {
    constructor(type, name, eas, das) {
      super(type);
      this.name = name;
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
    constructor(id, param, body) {
      super(0);
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
    constructor(id, param, body) {
      super(0);
      this.id = id;
      this.param = param;
      this.body = body;
    }
  }
  return Reference;
});

// not sure if thunks are in the ast...
define('ast/thunk', function(require) {
  var Term = require('ast/term');
  class Thunk extends Term {
    constructor(name,num) {
      super(num);
      this.name = name;
    }
  }
  return Thunk;
});

