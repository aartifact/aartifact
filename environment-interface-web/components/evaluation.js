/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// components/evaluation.js
//   Wrapper evaluation object for expressions; to be extended by
//   other modules that add their own hooks corresponding to
//   specific kinds of evaluation algorithms.
//
//   All evaluation hooks will be run on every subtree of an
//   expression. Thus, each hook must ensure that if it evaluates
//   any subexpressions, it must return a result.
//
//   Evaluation hooks in certain modules may take advantage of
//   information stored in the "analysis" field of a node by the
//   analysis hooks in those modules. However, this module has no
//   dependencies on the analysis module ("analysis.js").
//

Include.include('utilities/Error.js');
Include.include('utilities/Environment.js');

Include.include('aartifact.js');


aartifact.evaluation = {
  hooks: [],
  // Basic evaluation; may hang for long periods of time
  // if the expression's evaluation complexity is high.
  evaluate:
    function(env, e) {

      // If an attempt has already been made to evaluate, do not try again.
      //if (e.has_variables && e.evaluation != null)
      //  return e;
    
    
      // Extend the abstract syntax tree with the evaluation
      // field.
      if (e.evaluation == null || e.evaluation.value == null)
        e.evaluation = {value: null};
      
      if ((env.params.recomputevalue != true || e.has_variables != true) && (e.evaluation != null && e.evaluation.value != null))
        return e.evaluation.value;

      // Do not call hooks if there is no hope of evaluating; simply recurse.
      /*if (e.has_variables) {
        if (e.dat.isArray) {
          var a = e.dat.flattenNd();
          for (var i = 0; i < a.length; i++)
            aartifact.evaluation.evaluate(env, a[i]);
        }
        return e;
      }*/

      // Call every evaluation hook.
      if (e.con != 'Var') {
        for (var i = 0; i < this.hooks.length; i++) {
          var r = this.hooks[i](this, env, e);
          if (r != null) {
            if (!r.isError && r.isExp) {
              e.evaluation.value = r;
              r = aartifact.analysis.copy(e,r);
            }
            return r;
          }
        }
      }

      // Handle the generic situations. Hooks can overload
      // and preempt these if necessary.
      if (e.isError) return e;
      if (e.con == 'Var') {
        if (env.constant_is(e.dat)) {
          var v = {typ:'Term', con:'ConstantUser', dat:[t.dat]};
          if (!v.isError)
            e.evaluation.value = v;
          return v;
        } else {
          var v = env.retrieve(e.dat, new Error('unbound variable: '+e.dat));
          if (!v.isError)
            e.evaluation.value = v;
          return v;
        }
      }

      // None of the hooks returned a result.
      return new Error('no matching evaluation algorithm');
    }
};

//eof
