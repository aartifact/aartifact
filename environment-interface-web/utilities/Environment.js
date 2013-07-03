/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/Environment.js
//   Representation of a context of variable bindings.
//

Include.include('utilities/Array.js');


function Environment(variables, constants, params) {
  this.variables = (variables != null) ? variables.copy() : [];
  this.constants = (constants != null) ? constants.copy() : [];

  this.params = {};
  if (params != null)
    for (p in params)
      this.params[p] = params[p];
}

Environment.prototype = {
  constant_add:  function (c) { this.constants.push(c); },
  constants_add: function (cs) { this.constants = this.constants.concat(cs); },
  constant_is:
    function (c) {
      for (var i = 0; i < this.constants.length; i++)
        if (this.constants[i] == c) return true;
      return false;
    },

  bound:
    function (v) {
      for (var i = 0; i < this.variables.length; i++)
        if (this.variables[i][0] == v) return true;
      return false;
    },
  domain:
    function (v) {
      var vs = [];
      for (var i = 0; i < this.variables.length; i++)
        vs.push(this.variables[i][0]);
      return vs;
    },

  bind: function (v, x) {
    var bindings = [[v,x]];
    return new Environment(bindings.concat(this.variables), this.constants, this.params);
  },
  bindFromMap: function(m) {
    if (m.isMap) {
      var bindings = m;
      return new Environment(bindings.concat(this.variables), this.constants, this.params);
    }
    return null;
  },
  bind_ref: function (v, x) { this.variables.push([v,x]) },
  unbind_ref: function () { this.variables.pop(); },

  retrieve:
    function (v, err) {
      for (var i = 0; i < this.variables.length; i++)
        if (v == this.variables[i][0])
          return this.variables[i][1];
      return err;
    },
  get:
    function (v, err) {
      for (var i = 0; i < this.variables.length; i++)
        if (v == this.variables[i][0])
          return this.variables[i][1];
      return err;
    },

  copy:
    function () {
      return new Environment(this.variables, this.constants);
    }
};

// eof
