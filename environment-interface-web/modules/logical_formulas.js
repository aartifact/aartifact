/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// module/logical_formulas.js
//   Static analysis and evaluation of logical formulas.
//

Include.include('utilities/Environment.js');
Include.include('utilities/Context.js');
Include.include('utilities/EquivalenceClasses.js');

Include.include('aartifact.js');


Exp.prototype.logical_formula_as_premises = function(){
  var e = this;
  return (e.isOp('And')) ? e.dat[0].logical_formula_as_premises().concat(e.dat[1].logical_formula_as_premises()) : [e];
};

Exp.prototype.logical_formulas_statements_mark = function(){
  var e = this;
  if (e.statement == true && (e.con == 'Quantifier' || e.isOp(['And','Implies','Iff']))) {
    for (var i = 0; i < e.dat.length; i++) {
      if (e.dat[i].statement != true) {
        e.dat[i].statement = true;
        e.dat[i].logical_formulas_statements_mark();
      }
    }
  }
};

aartifact.module({
  presentation: 
    function(P, fmt, e) {
    },

  analysis:
    function(analysis, env, e) {
      e.logical_formulas_statements_mark();
    },

  evaluation:
    function(EV, env, e) {
      var E = aartifact.expression.constructors;
      var A = aartifact.analysis;

      var bothBool = function(a,b){ return a.isExp && b.isExp && (a.is(E.True())||a.is(E.False())) && (b.is(E.True())||b.is(E.False())); };

      var logical_formulas_evals = [
        ['Implies', bothBool, function(a,b){return (a.is(E.False())||b.is(E.True()))?E.True():E.False();}],
        ['And',     bothBool, function(a,b){return (a.is(E.True())&&b.is(E.True()))?E.True():E.False();}],
        ['Or',      bothBool, function(a,b){return (a.is(E.True())||b.is(E.True()))?E.True():E.False();}],
        ['Iff',     bothBool, function(a,b){return (a.dat[0]==b.dat[0])?E.True():E.False();}]
      ];

      if (e.is(E.True()) || e.is(E.False())) return e;

      if (e.con == 'Infix') {
        for (var i = 0; i < logical_formulas_evals.length; i++) {
          var chk = logical_formulas_evals[i][1], evl = logical_formulas_evals[i][2];
          if (e.operator == logical_formulas_evals[i][0]) {
            var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]);
            if (chk(a,b)) 
              return evl(a,b);
          }
        }
      }

      if (e.con == 'Quantifier') {
        var draw = e.dat[0];
        if (draw.is(E.In(E.V(),null))) {
          var variable = draw.dat[0].dat;

          var v = EV.evaluate(env, draw.dat[1]);
          if (v.isError) return v;

          if (v.is(E.Set())) {
            if (e.isOp('Forall')) {
              for (var i = 0; i < v.dat.length; i++) {
                var v_e = EV.evaluate(env.bind(variable, v.dat[i]), e.dat[1]);
                if (v_e.is != null && v_e.is(E.False())) return E.False();
                else if (v_e.is != null && v_e.is(E.True())) { /*continue*/ }
                else return null;
              }
              return E.True();
            }
            if (e.isOp('Exists')) {
              for (var i = 0; i < v.dat.length; i++) {

                var env_new = env.bind(variable, v.dat[i]);
                env_new.recomputevalue = true;

                var v_e = EV.evaluate(env_new, e.dat[1]);
                if (v_e.is(E.True())) { return E.True(); }
                else if (v_e.is(E.False())) { /*continue*/ } 
                else return null;
              }
              return E.False();
            }
          } else // Evaluate any subexpressions.
            return EV.evaluate(env, e.dat[1]);
        }
      }

    },

  verification:
    function(V, context, e) {

      var E = aartifact.expression.constructors;

      if (e.is(E.TextOp()) || e.relation)
        e.verification = V.Unverifiable;

      // Base and recursive cases.
      if (e.is(E.True())) { e.verification = V.VerifiablyTrue; return; }
      if (e.is(E.False())) { e.verification = V.VerifiablyFalse; return; }

      if (e.isOp('Implies')) {
        e.dat[0].is_premise = true;
        return [ [context, e.dat[0]], [context.premises_add(e.dat[0].logical_formula_as_premises()), e.dat[1]] ];
      }
      if (e.isOp('And')) {
        if (e.is_premise == true) {
          e.dat[0].is_premise = true;
          e.dat[1].is_premise = true;
        }
        return [ [context, e.dat[0]], [context.premises_add(e.dat[0].logical_formula_as_premises()), e.dat[1]] ];
      }
      if (e.is(E.Forall())) {
        var context_new = context.copy();

        if ( e.dat.length != null && e.dat.length > 0 && e.dat[0].dat != null 
          && e.dat[0].dat.length != null && e.dat[0].dat.length > 0 && e.dat[0].dat[0] != null && e.dat[0].dat[0].dat != null) {  
          context_new.environment = context_new.environment.bind(e.dat[0].dat[0].dat, aartifact.expression.constructors.Indeterminate());
        }
        return [ [context_new.premises_add(e.dat[0]), e.dat[1]] ];
      }


      // Extra checks for this particular expression.
      if (e.has_unbound != true) {
        function eq_true(e1,e2) { var r = aartifact.equality.eq(e1,e2,context); return (r != null && r == true); }

        if (context.premises.contains(e, eq_true)) { e.verification = V.VerifiablyTrue; return; }

        // Check implication.
        var premisesExt = context.premises.chooseAtMost(2).map(function(es){return E.InfixFoldRight('And',es);});
        if (e.is(E.TextOp()) || e.relation) {
          //if (e.analysis.properties.contains(e, function(e1,e2){return e1.equals(e2);})) { e.verification = V.VerifiablyTrue; return; }
          if (context.premises.contains(e, aartifact.equality.eq)) { e.verification = V.VerifiablyTrue; return; }
          if (premisesExt.exists(function(pr) { return aartifact.equality.imp(pr, e); })) { e.verification = V.VerifiablyTrue; return; }
        }

        if (e.isOp(['Eq'])) {
          if (e.dat[0].is(E.Placeholder())) {
            if (context.premises.length > 0 && context.premises.last().isOp(e.op) && eq_true(e.dat[1], context.premises.last().dat[1])) {
              e.verification = V.VerifiablyTrue;
              return;
            }
          } else {
            if (eq_true(e.dat[0], e.dat[1])) { e.verification = V.VerifiablyTrue; return; }
            if (context.equivalenceclasses.equivalent(e.dat[0], e.dat[1])) { e.verification = V.VerifiablyTrue; return; }
          }
        }

        if (e.evaluation == null && e.has_variables != true)
          var v = aartifact.evaluation.evaluate(new Environment(), e);

        if (e.evaluation != null && e.evaluation.value != null) {
          var v = e.evaluation.value;
          if (v.is(E.True())) { e.verification = (e.verification == V.VerifiablyFalse) ? V.Contradictory : V.VerifiablyTrue; return; }
          if (v.is(E.False())) { e.verification = (e.verification == V.VerifiablyTrue) ? V.Contradictory : V.VerifiablyFalse; return; }
        }

      } // no unbound variables

    } // verification hook
}); // module

//eof
