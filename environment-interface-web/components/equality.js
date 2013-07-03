/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// components/equality.js
//   Wrapper equality object for expressions; to be extended
//   by other modules that add their own hooks corresponding to
//   specific kinds of equality.
//

Include.include('utilities/Error.js');
Include.include('utilities/EquivalenceClasses.js');

Include.include('aartifact.js');


aartifact.equality = {
  hooks: [],
  check_proposition:
    function (law, e1, e2) {
      var EX = aartifact.expression;
      var EQ = aartifact.equality;
      var E = aartifact.expression.constructors;

      function do_check(e1,e2,law1,law2,has_prop) {
       var s1 = EX.match(law1, e1), s2 = EX.match(law2, e2);
       if (s1 != null && s2 != null && s1.forall(has_prop) && s2.forall(has_prop) && EX.consistent(EQ.eq_bas, s1, s2)) return true;
      }

      var var_to_domain = [];
      var vars_no_domain = [];
      while (law.con == 'Quantifier') {
        if (law.dat[0].con == 'Var') vars_no_domain.push(law.dat[0].dat);  
        if (law.dat[0].is(E.In())) var_to_domain.push([law.dat[0].dat[0].dat, law.dat[0].dat[1], E.In]);
        if (law.dat[0].is(E.Subset())) var_to_domain.push([law.dat[0].dat[0].dat, law.dat[0].dat[1], E.Subset]);
        law = law.dat[1];
      }
      var exp_to_formula = function(v,e) {
        for (var i = 0; i < var_to_domain.length; i++)
          if (var_to_domain[i][0] == v)
            return var_to_domain[i][2](e, var_to_domain[i][1]);
      };

      var has_prop1 = function(s){
        var f = exp_to_formula(s[0],s[1]);
        if (vars_no_domain.contains(s[0])) return true;
        return (f==null)?false:s[1].analysis.properties.contains(f, EQ.eq_bas);
      };

      if (law.isOp('Eq')) {
        if (do_check(e1,e2,law.dat[0],law.dat[1],has_prop1)) return true;
        if (do_check(e1,e2,law.dat[1],law.dat[0],has_prop1)) return true;
      }

      if (law.isOp('Iff')) {
        var imp1 = law.dat[1].splitByOp('And'); for (var i=0; i<imp1.length; i++) if (do_check(e1,e2,law.dat[0],imp1[i],has_prop1)) return true;
        var imp0 = law.dat[0].splitByOp('And'); for (var i=0; i<imp0.length; i++) if (do_check(e1,e2,law.dat[1],imp0[i],has_prop1)) return true;
      }

      if (law.isOp('Implies')) {
        var has_prop = function(s){ 
          var f = exp_to_formula(s[0],s[1]); 
          return (f==null)?false:s[1].analysis.properties.contains(f, EQ.eq);
        };
        var imp = law.dat[1].splitByOp('And'); for (var i=0; i<imp.length; i++) if (do_check(e1,e2,law.dat[0],imp[i],has_prop)) return true;
      }

      return false;
    },
  eq_bas:
    function(e1, e2, eq_alt) {
      var E = aartifact.expression.constructors;
      var EX = aartifact.expression;
      var EQ = aartifact.equality;

      if (e1.isError || e2.isError) return false;
      if (e1.is(E.Placeholder()) || e2.is(E.Placeholder())) return false;

      // We have a reference to the same object.
      if (e1 != null && e2 != null && e1 == e2) return true;

      // Call every equality hook.
      for (var i = 0; i < EQ.hooks.length; i++) {
        var r = EQ.hooks[i](EQ, e1, e2, false, EQ.eq_bas);
        if (r != null) return r;
      }

      // Handle the generic cases.
      if (e1.con == 'Var' && e2.con == 'Var' && e1.dat == e2.dat)
        return true;
      if (e1.con == 'TextOp' && e2.con == 'TextOp') {
        if (e1.op == e2.op && e1.dat.length == e2.dat.length) {
          for (var i = 0; i < e1.dat.length; i++) {
            if (!EQ.eq_bas(e1.dat[i], e2.dat[i]))
              return false;
          }
          return true;
        }
      }
    },
  eq:
    function(e1, e2, eq_alt) {
      var E = aartifact.expression.constructors;    
      var EX = aartifact.expression;
      var EQ = aartifact.equality;
      var L = aartifact.library;

      if (e1.isError || e2.isError) return false;
      if (e1.is(E.Placeholder()) || e2.is(E.Placeholder())) return false;

      // We have a reference to the same object.
      if (e1 != null && e2 != null && e1 == e2) return true;

      // Check for equality of values.
      if (e1.evaluation != null && e2.evaluation != null && e1.evaluation.value != null && e2.evaluation.value != null)
        if (aartifact.equality.eq_bas(e1.evaluation.value, e2.evaluation.value))
          return true;

      // Check the alternative equality function.
      if (eq_alt != null && eq_alt.equivalenceclasses.equivalent(e1,e2)) return true;

      // Check for equality implied by propositions.
      for (var i = 0; i < L.propositions.length; i++)
        for (var j = 0; j < L.propositions[i][1].length; j++)
          if (EQ.check_proposition(L.propositions[i][1][j], e1, e2))
            return true;
      for (var i = 0; i < L.propositions_user.length; i++)
        if (EQ.check_proposition(L.propositions_user[i], e1, e2))
          return true;

      // Call every equality hook.
      for (var i = 0; i < EQ.hooks.length; i++) {
        var r = EQ.hooks[i](EQ, e1, e2, eq_alt);
        if (r != null)
          return r;
      }

      // Handle the generic cases that module hooks can preempt/override.
      if (e1.con == 'Var' && e2.con == 'Var' && e1.dat == e2.dat)
        return true;
      if (e1.con == 'TextOp' && e2.con == 'TextOp') {
        if (e1.op == e2.op && e1.dat.length == e2.dat.length) {
          for (var i = 0; i < e1.dat.length; i++) {
            if (!EQ.eq_bas(e1.dat[i], e2.dat[i]))
              return false;
          }
          return true;
        }
      }
    },
  imp:
    function(e1, e2) {
      var E = aartifact.expression.constructors;
      var EX = aartifact.expression;
      var EQ = aartifact.equality;
      var L = aartifact.library;

      if (e1.isError || e2.isError) return null;

      // We have a reference to the same object.
      if (e1 == e2) return true;

      // Check laws to see if anything is implied.
      for (var i = 0; i < L.propositions.length; i++)
        for (var j = 0; j < L.propositions[i][1].length; j++)
          if (EQ.check_proposition(L.propositions[i][1][j], e1, e2))
            return true;
      for (var i = 0; i < L.propositions_user.length; i++)
        if (EQ.check_proposition(L.propositions_user[i], e1, e2))
          return true;
    }
};

//eof
