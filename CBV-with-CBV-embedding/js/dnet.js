
define('dnet', function(require) {

	var Group = require('group');
	var Link = require('link');
	var Contract = require('nodes/contract');

	class DNet extends Group {

		constructor(cs, inputs) {
			super(null, null, null);
      this.inputs = inputs;

      this.outputs = this.createDNet(cs, inputs);
		}

    createDNet(cs, inputs) {
      var c;
      var from;
      var to;
      var cList = [];

      for (var n = 0; n < cs; n++) {
        c = new Contract().addToGroup(this);
        cList.push(c);
        //from = c; to = outputs[n];
        //new Link(from.key, to.key, "n", "s").addToGroup(this);
        for (var i = 0; i < inputs.length; i++) {
          from = inputs[i]; to = c;
          new Link(from.key, to.key, "n", "s").addToGroup(this);
        }
      }

      return cList;
    }

}

	return DNet;
});
