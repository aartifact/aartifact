/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/EquivalenceClasses.js
//   Representation of a collection of equivalence classes.
//

Include.include('utilities/Array.js');


function EquivalenceClasses(eqf, classes) {
  this.classes = (classes!=null) ? classes.map(function(c) {return c.copy()}) : [];
  this.eqf = eqf;
}

EquivalenceClasses.prototype = {
  add: 
    function (x) {
      var classes = this.classes.copy();
      for (var i = 0; i < classes.length; i++) {
        for (var j = 0; j < classes[i].length; j++) {
          if (this.eqf(classes[i][j], x))
            classes[i].push(x);
            return new EquivalenceClasses(this.eqf, classes);
        }
      }
      return new EquivalenceClasses(this.eqf, classes.concat([x]));
    },
  extend:
    function(x,y) {
      var xec = this.equivalence_class(x);
      var yec = this.equivalence_class(y);
      var eqvcls = new EquivalenceClasses(this.eqf, this.classes);
      
      if (xec == null && yec != null) {
        eqvcls.classes[yec].push(x);
      } else if (xec != null && yec == null) {
        eqvcls.classes[xec].push(y);
      } else if (xec == null && yec == null) {
        eqvcls.classes.push([x,y]);
      } else if (xec != yec) { // Must merge.
        var classes = [];
        var class_new = [x,y];
        for (var i = 0; i < eqvcls.classes.length; i++) {
          if (i == xec || i == yec)
            class_new = class_new.concat(eqvcls.classes[i]);
          else
            classes.push(eqvcls.classes[i]);
        }
        classes.push(class_new);
        eqvcls.classes = classes;
      } else { // Already in the same class.
        eqvcls.classes[xec].push(x);
        eqvcls.classes[yec].push(y);
      }

      return eqvcls; 
    },
  equivalence_class:
    function (x) {
      for (var i = 0; i < this.classes.length; i++)
        for (var j = 0; j < this.classes[i].length; j++)
          if (this.eqf(this.classes[i][j], x))
            return i;
      return null;
    },
  equivalent:
    function(x,y) {
      var xec = this.equivalence_class(x);
      var yec = this.equivalence_class(y);
      return (xec != null && yec != null && xec == yec);
    },
  copy:
    function() {
      return new EquivalenceClasses(this.eqf, this.classes);
    }
};

// eof
