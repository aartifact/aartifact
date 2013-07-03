/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// components/analysis.js
//   Wrapper static analysis object for expressions; to be extended
//   by other modules that add their own hooks corresponding to
//   specific kinds of static analyses.
//
//   The results of an analysis are added directly to the abstract
//   syntax tree. An expression that has been analyzed has an abstract
//   syntax tree node that has been extended with an "analysis" field.
//
//   Each module defining analysis hooks should create a distinct
//   namespace for its own analysis results; the exception to this is
//   the built-in "analysis" namespace, which are shared across all
//   modules:
//
//   * errors
//   * properties
//   * interpretations
//   * evaluation
//     - steps_upper_bound // upper bound on no. of evaluation steps
//

Include.include('utilities/Error.js');
Include.include('utilities/UUID.js');
Include.include('utilities/Environment.js');
Include.include('utilities/EquivalenceClasses.js');

Include.include('aartifact.js');


aartifact.analysis = {
  hooks: [],
  // Copy the properties of an expression analysis to a value.
  copy: function (e,v) { v.analysis = e.analysis; return v; },
  // Check if an expression has a property.
  prop: 
    function (e,p) { 
      if (e.analysis != null && e.analysis.properties != null)
        return e.analysis.properties.contains(p, aartifact.equality.eq_bas); 
    },
  // Assemble all the properties in an expression.
  properties_all:
    function(e) {
      var properties = [];
      if (e != null && e.analysis != null && e.analysis.properties != null)
        properties = e.analysis.properties.copy();
      if (e != null && e.dat != null && e.dat.isArray) {
        var es = e.dat.flattenNd();
        for (var i = 0; i < es.length; i++)
          properties = properties.concat(this.properties_all(es[i]));
      }
      return properties;
    },
  analyze:
    function(env, t) {
      var A = this;
      var E = aartifact.expression.constructors;
    
      // If we are not looking at a node, or an analysis has
      // already been performed on this node, do nothing.
      if (t == null || t.typ != 'Term' || t.analysis != null)
        return;

      // Extend the node with the analysis field and default
      // subfields.
      if (t.analysis == null)
        t.analysis = {
          errors: [],
          properties: [],
          interpretations: [],
          evaluation: {
            steps_upper_bound: null
            }
          };

      // Check common/generic cases.
      if (t.con == 'Var') {
        t.has_variables = true;
        if (!env.bound(t.dat)) {
          t.unbound = true;
          t.has_unbound = true;
        } else {
          var e_found = env.retrieve(t.dat);
          if (e_found != null && e_found.analysis != null && e_found.analysis.properties != null) {
            t.analysis.properties = t.analysis.properties.concat(e_found.analysis.properties);
            var z = e_found.analysis.properties[0];
            if (z != null && z.is(E.In(E.R(), E.Indeterminate())))
              t.analysis.properties.push(E.In(t,E.R()));

            t = A.copy(e_found, t);
          }
        }
      }

      // If this is a formula, give it a unique formula ID.
      // This can be used by other modules (e.g. to relate formulas
      // to the document elements generated from them).
      if ((true || t.statement == true) && (t.is(E.TextOp()) || t.relation))
        t.analysis.formulaid = UUID();

      // Make all possible recursive calls to analyze the subtrees
      // of this node; an analysis must exhausively check every
      // subtree from the bottom up.
      
      var env_new = env;
      if (t.con == 'Quantifier') {
        var variable = t.dat[0].dat[0].dat;
        var e_new = aartifact.expression.constructors.Indeterminate();
        e_new.analysis = {properties: [t.dat[0]]};      
        env_new = env.bind(variable, e_new);
      }

      var e = t;
      if (e.con == 'SetComprehension') {
        if (e.dat[0].con == 'In' && e.dat[0].dat[0].con == 'Var') {
          e_new = E.SetComprehension(e.dat[0].dat[0], E.Infix('Comma', e.dat[0], e.dat[1]));
          e_new = A.copy(e_new, e_new);
          e.dat = e_new.dat;
        
          //var dom = e.dat[0].dat[1];
          //if (A.prop(dom, E.Subset(dom, E.R())))
          //  e.dat[0].dat[0].analysis.properties.push(E.Subset(e,E.R()));
        }
      }

      if (e.con == 'SetComprehension' || e.con == 'TupleComprehension') {
        var es = aartifact.expression.extract(E.SepBySeq(E.Comma,E.X), e.dat[1]);
        var env_new = env;
        for (var i = 0; i < es.length; i++) {
          if (es[i].isOp('In')) {
            var m = es[i].dat[0].vars().map(function(v){return [v,E.Indeterminate];});
            m.isMap = true;
            env_new = env_new.bindFromMap(m);
            aartifact.analysis.analyze(env_new, es[i]);
          }
        }
        aartifact.analysis.analyze(env_new, e.dat[0]);
      }
      
      if (e.op == 'And' || e.op == 'Implies') {
        var p = e.dat[0], c = e.dat[1];
        aartifact.analysis.analyze(env_new, p);
        if (p.con == 'TextOp' && p.dat.length == 1 && p.dat[0].con == 'Var') {
          var e_found = env.retrieve(p.dat[0].dat);
          if (e_found != null && e_found.analysis != null && e_found.analysis.properties != null)
            e_found.analysis.properties.push(p);
        }
        aartifact.analysis.analyze(env_new, c);
      }
      
      t = e;

      if (t.dat != null && t.dat.length != null && t.dat.length > 0) {
        for (var i = 0; i < t.dat.length; i++) {
          if (t.dat[i].isArray == true) {
            for (var j = 0; j < t.dat[i].length; j++) {
              aartifact.analysis.analyze(env_new, t.dat[i][j]);
              if (t.dat[i][j].unbound == true || t.dat[i][j].has_unbound == true)
                t.has_unbound = true;
            if (t.dat[i][j].has_variables == true)
              t.has_variables = true;
            }
          } else {
            aartifact.analysis.analyze(env_new, t.dat[i]);
            if (t.dat[i].unbound == true || t.dat[i].has_unbound == true) t.has_unbound = true;
            if (t.dat[i].has_variables == true) t.has_variables = true;
          }
        }
      }

      // Call every analysis hook. Hooks may add to
      // the "analysis" field of "t", but will not change the
      // tree or return a result of any kind.
      for (var i = 0; i < this.hooks.length; i++)
        this.hooks[i](this, env, t);
    }
};

//eof
