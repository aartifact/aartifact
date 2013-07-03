/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// module/algebra_of_sets.js
//   Static analysis and evaluation of sets.
//

aartifact.module({
  presentation:
    function(P, fmt, e) {
    },

  analysis:
    function(A, env, e) {
      var E = aartifact.expression.constructors; 
      var EQ = aartifact.equality;

      if (e.analysis.algebra_of_sets == null)
        e.analysis.algebra_of_sets = {};

      if (e.isOp('Bars'))
        if (e.dat[0].con == 'Set') 
          e.analysis.properties.push(E.In(e, E.R()));

      if (e.is(E.Braces(E.Ldots()))) { e.mimic(E.SetRange(e.dat[0].dat[0], e.dat[0].dat[1])); return; }

      var r = aartifact.expression.extract(E.Braces(E.SepBySeq(E.Comma,E.X)), e);
      if (r != null) {
        e.con = 'Set';
        e.dat = r;

        if (r.forall(function(e){ return A.prop(e,E.In(e,E.R()));}))
          e.analysis.properties.push(E.Subset(e,E.R()));
        for (var d = 1; d < 11; d++)
          if (r.forall(function(e){ return A.prop(e,E.In(e,E.Super(E.R(),E.Num(d))));}))
            e.analysis.properties.push(E.Subset(e,E.Super(E.R(),E.Num(d))));
      }
    },

  equality:
    function(EQ, e1, e2, eq_alt, eq_bas) {
      var eq = (eq_bas != null) ? eq_bas : EQ.eq;

      if (e1.con == 'Set' && e2.con == 'Set')
        return e1.dat.containsAll(e2.dat, eq) && e2.dat.containsAll(e1.dat, eq);

    },

  evaluation:
    function(EV, env, e) {
      var EX = aartifact.expression, E = EX.constructors;
      var EQ = aartifact.equality;
      var A = aartifact.analysis;
    
      if (e.con == 'Set') {
        var vs = e.dat.map(function(e){ return EV.evaluate(env,e); });
        return A.copy(e,E.Set(vs.distinct()));
      }
      
      if (e.con == 'SetRange') {
        var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]);
        if (a.con == 'Num' && b.con == 'Num') {
          var vs = [];
          for (var i = a.dat[0]; i <= b.dat[0]; i++)
            vs.push(E.Num(i));
          return E.Set(vs);
        }
        if (a.con == 'Matrix' && b.con == 'Matrix') {
          var da = a.dat.dimensions(), db = b.dat.dimensions();
          if (da.cols == db.cols && da.cols == 1 && da.rows == db.rows && da.rows == 2) {
          
            var vs0 = [];
            var vs1 = [];
            var vsr = [];
            for (var i = a.dat[0][0].dat[0]; i <= b.dat[0][0].dat[0]; i++)
                vs0.push(E.Num(i));
            for (var i = a.dat[1][0].dat[0]; i <= b.dat[1][0].dat[0]; i++)
                vs1.push(E.Num(i));
            for (var i = 0; i < vs0.length; i++) {
              for (var j = 0; j < vs1.length; j++) {
                vsr.push(E.Matrix([[vs0[i]],[vs1[j]]]));
              }
            }

            return E.Set(vsr);
          }
        }
      }

      if (e.isOp('Bars')) {
        var v = EV.evaluate(env,e.dat[0]);
        if (v.con == 'Set')
          return E.Num(v.dat.length);
      }

      if (e.isOp('Comma')) {
        var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]);
        var v = E.Comma(a,b);
        if (e.wrapped == 'Parens')
          v.wrapped = 'Parens';
        return v;
      }
      
      if (e.con == 'Infix') {
        var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]);
        if (a.con == 'Set' && b.con == 'Set') {
          if (e.isOp('Minus'))  return E.Set(a.dat.removeAll(b.dat));
          if (e.isOp('Union'))  return E.Set(a.dat.concat(b.dat).distinct());
          if (e.isOp('Isect'))  return E.Set(a.dat.filt(function(x){return a.dat.contains(x) && b.dat.contains(x)}));
          if (e.isOp('Eq'))     return EQ.eq(a, b) ? E.True() : E.False();
          if (e.isOp('Neq'))    return EQ.eq(a, b) ? E.False() : E.True();
          if (e.isOp('Subset')) return b.dat.containsAll(a.dat) ? E.True() : E.False();
        }
        if (b.con == 'Set')
          if (e.isOp('In')) return b.dat.contains(a) ? E.True() : E.False();
      }

      if (e.is(E.SetComprehension())) {
        var es = EX.extract(E.SepBySeq(E.Comma,E.X), e.dat[1]);
        var env_temp = env.copy();
        env_temp.recomputevalue = true;
        var vs = eval_comprehension(env_temp, new Environment(), es,e.dat[0]);
        return E.Set(vs.distinct());
      }

      if (e.is(E.TupleComprehension())) {
        var es = EX.extract(E.SepBySeq(E.Comma,E.X), e.dat[1]);
        var env_temp = env.copy();
        env_temp.recomputevalue = true;
        var vs = eval_comprehension(env_temp, new Environment(), es,e.dat[0]);
        return E.Tuple(vs);
      }
    }
});

function eval_comprehension(env, env_local, es, e) {
  var EV = aartifact.evaluation;
  var EX = aartifact.expression;

  if (es.length == 0) {
    return [EV.evaluate(env, e)];
  } else {
    var e0 = es[0];
    if (e0.is(E.In())) { // && !env_local.bound(e0.dat[0].dat)) {
      var d0 = EV.evaluate(env, e0.dat[1]);
      if (d0.con == 'Set') {
        var vs = [];
        for (var i = 0; i < d0.dat.length; i++) {
          var s = EX.match(e0.dat[0], d0.dat[i]);
          if (s == null)
            return new Error('pattern in set comprehension does not match value');
          
          s.isMap = true;
          var env_new = env.bindFromMap(s);
          var env_local_new = env_local.bindFromMap(s);

          env_new.params = {recomputevalue: true};
          var vs1 = eval_comprehension(env_new, env_local_new, es.slice(1), e);
          if (vs1 != null && !vs1.isError)
            vs = vs.concat(vs1);
        }
        return vs;
      }
    } else {
      var v0 = EV.evaluate(env,e0);
      if (v0.con == 'Constant' && v0.dat[0] == 'True')
        return eval_set_comprehension(env, env_local, es.slice(1), e);
      else if (v0.con == 'Constant' && v0.dat[0] == 'False')
        return [];
      else if (v0.isError)
        return v0;
      else
        return null;
    }
  }
}



/* aartifact.analysis.hooks.push(function(analysis, env, t) {
  // Ellipses notation.
  if (t.con == 'Circumfix' && t.operator == 'Braces')
    if (t.dat[0].con == 'Infix' && t.dat[0].operator == 'Ldots')
      if (t.dat[0].dat[1].con == 'Num' && t.dat[0].dat[1].con == 'Num')
        t.analysis.evaluation.steps_upper_bound = Math.max(0, t.dat[0].dat[1].dat - t.dat[0].dat[0].dat);
});

aartifact.evaluation.hooks.push(function(kontinue, evaluation, env, t) {

  // Ellipses notation.
  if (t.con == 'Circumfix' && t.operator == 'Braces') {
    if (t.dat[0].con == 'Infix' && t.dat[0].operator == 'Ldots') {

      var kontinueP = function(rs) {
        var a = rs[0], b = rs[1];
        if (a.con == 'Num' && b.con == 'Num') {

          var kontinueI = function(cs) { return (function() { return kontinue({typ:'TermValue', con:'Set', components:cs}) }); };

          return Continuation.unfold_range([], 
            (function (k, i) { return k({typ:'Term', con:'Num', dat:i}); }), kontinueI, 
            a.dat, b.dat);

        }
      };

      return Continuation.map([], 
        (function(k, a) { return evaluation.eval(k, env, a); }),
        kontinueP, 
        [t.dat[0].dat[0], t.dat[0].dat[1]]);
    }
  }
});*/

//eof
