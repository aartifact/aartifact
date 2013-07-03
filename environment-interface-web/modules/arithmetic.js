/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// modules/arithmetic.js
//   Static analysis and evaluation of arithmetic expressions.
//

Include.include('utilities/Environment.js');


aartifact.module({
  presentation:
    function(P, fmt, e) {
    },

  analysis:
    function(A, env, e) {
      var E = aartifact.expression.constructors;
      var EQ = aartifact.equality;

      if (e.is(E.Num())) {
        e.analysis.evaluation.steps_upper_bound = 1;
        e.analysis.properties.push(E.In(e, E.R()));
      }

      if (e.isOp(['Neg','Bars']))
        if (A.prop(e.dat[0], E.In(e.dat[0], E.R()))) 
          e.analysis.properties.push(E.In(e, E.R()));

      if (e.isOp('Apply')) {
        if (A.prop(e.dat[0], E.In(e.dat[0], E.R())) && A.prop(e.dat[1], E.In(e.dat[1], E.R()))) {
          e.operator = 'Mult';
          e.analysis.properties.push(E.In(e, E.R()));
        }

        var f = e.dat[0], a = e.dat[1];
        f.analysis.properties.map(function(pf){
          if (pf.is(E.In(f,E.Rightarrow()))) {
            var dom = pf.dat[1].dat[0], cod = pf.dat[1].dat[1];
            return a.analysis.properties.map(function(pa){
              if (pa.is(E.In())) {
                var set = pa.dat[1];
                if (set.equals(dom))
                  e.analysis.properties.push(E.In(e, cod));
              }
            });
          }
        });        
      }


      if (e.isOp('Img')) {
        var f = e.dat[0];
        f.analysis.properties.map(function(pf){
          if (pf.is(E.In(f,E.Rightarrow()))) {
            var fdom = pf.dat[1].dat[0], fcod = pf.dat[1].dat[1];
            e.analysis.properties.push(E.Subset(e, fcod)); 
          }
        });        
      }

      if (e.isOp('Ker')) {
        var f = e.dat[0];
        f.analysis.properties.map(function(pf){
          if (pf.is(E.In(f,E.Rightarrow()))) {
            var fdom = pf.dat[1].dat[0], fcod = pf.dat[1].dat[1];
            e.analysis.properties.push(E.Subset(e, fdom)); 
          }
        });        
      }

      if (e.isOp('Circ')) {
        var f = e.dat[0], g = e.dat[1];
        f.analysis.properties.map(function(pf){
          if (pf.is(E.In(f,E.Rightarrow()))) {
            var fdom = pf.dat[1].dat[0], fcod = pf.dat[1].dat[1];
            return g.analysis.properties.map(function(pg){
              if (pg.is(E.In(g,E.Rightarrow()))) {
                var gdom = pg.dat[1].dat[0], gcod = pg.dat[1].dat[1];
                if (gcod.equals(fdom))
                  e.analysis.properties.push(E.In(e, E.Rightarrow(gdom, fcod)));
              }
            });
          }
        });        
      }

      if (e.isOp(['Plus','Minus','Mult']))
        if (A.prop(e.dat[0], E.In(e.dat[0], E.R())) && A.prop(e.dat[1], E.In(e.dat[1], E.R())))
          e.analysis.properties.push(E.In(e, E.R()));
    },
  equality:
    function(EQ, e1, e2, eq_alt, eq_bas) {
      var A = aartifact.analysis;
      var eq_rec = (eq_bas != null) ? eq_bas : EQ.eq;

      if (e1.con == 'Num' && e2.con == 'Num' && e1.dat[0] == e2.dat[0])
        return true;
  
      if (e1.con == 'Constant' && e2.con == 'Constant' && e1.dat[0] == e2.dat[0])
        return true;

      if (e1.con == 'Prefix' && e2.con == 'Prefix' && e1.operator == e2.operator)
        return eq_rec(e1.dat[0], e2.dat[0], eq_alt);

      if (e1.con == 'Circumfix' && e2.con == 'Circumfix' && e1.operator == e2.operator)
        return eq_rec(e1.dat[0], e2.dat[0], eq_alt);

      if (e1.con == 'Infix' && e2.con == 'Infix' && e1.operator == e2.operator)
        return eq_rec(e1.dat[0], e2.dat[0], eq_alt) && eq_rec(e1.dat[1], e2.dat[1], eq_alt);
    },
  evaluation:
    function(EV, env, e) {

      var EX = aartifact.expression, E = EX.constructors;
      var EQ = aartifact.equality;
      var A = aartifact.analysis;

      if (e.is(E.R())) return e;
      //if (e.is(E.Super(E.R(), E.Num()))) return e;
      if (e.is(E.Num())) return e;

      if (A.prop(e, E.In(e, E.R()))) {
        if (e.isOp('Parens'))
          return EV.evaluate(env, e.dat[0]);
    
        if (e.isOp('Neg')) {
          var v = EV.evaluate(env, e.dat[0]);
          if (v.con == 'Num')
            return E.Num(0 - v.dat[0]);
        }
      }

      if (e.isOp('Sqrt')) {
        if (A.prop(e.dat[0], E.In(e.dat[0], E.R()))) {
          var v = EV.evaluate(env,e.dat[0]);
          if (v.con == 'Num' && v.dat[0] >= 0)
            return E.Num(Math.sqrt(v.dat[0]));
        }
      }

      if (e.isOp('Bars')) {
        var v = EV.evaluate(env,e.dat[0]);
        if (v.isExp && v.is(E.Num()))
          return E.Num(Math.abs(v.dat[0]));
      }

      var bothNum = function(a,b){return a.isExp && b.isExp && a.is(E.Num()) && b.is(E.Num());};
      var arithmetic_evals = [
        ['Plus',   bothNum, function(a,b){return E.Num(a.dat[0]+b.dat[0]);}],
        ['Minus',  bothNum, function(a,b){return E.Num(a.dat[0]-b.dat[0]);}],
        ['Mult',   bothNum, function(a,b){return E.Num(a.dat[0]*b.dat[0]);}],
        ['Apply',  bothNum, function(a,b){return E.Num(a.dat[0]*b.dat[0]);}],
        ['Super',  bothNum, function(a,b){return E.Num(Math.pow(a.dat[0],b.dat[0]));}],
        ['Div',    bothNum, function(a,b){return (b.dat[0]!=0) ? E.Num(a.dat/b.dat) : E.Undefined();}],
        ['Mod',    bothNum, function(a,b){return (b.dat[0]!=0) ? E.Num(a.dat%b.dat) : E.Indeterminate();}],
        ['Eq',     bothNum, function(a,b){return a.dat[0]==b.dat[0]?E.True():E.False();}],
        ['Neq',    bothNum, function(a,b){return a.dat[0]!=b.dat[0]?E.True():E.False();}],
        ['Lt',     bothNum, function(a,b){return a.dat[0]<b.dat[0]?E.True():E.False();}],
        ['Gt',     bothNum, function(a,b){return a.dat[0]>b.dat[0]?E.True():E.False();}],
        ['Geq',    bothNum, function(a,b){return a.dat[0]<=b.dat[0]?E.True():E.False();}],
        ['Leq',    bothNum, function(a,b){return a.dat[0]>=b.dat[0]?E.True():E.False();}],
        ['In',     function(a,b){return a.isExp && b.isExp && a.is(E.Num()) && b.is(E.R());}, function(a,b){return E.True();}]
        ];

      if (e.con == 'Infix') { // && A.prop(e.dat[0], E.In(e.dat[0], E.R())) && A.prop(e.dat[1], E.In(e.dat[1], E.R()))) {
        for (var i = 0; i < arithmetic_evals.length; i++) {
          var chk = arithmetic_evals[i][1], evl = arithmetic_evals[i][2];
          if (e.isOp(arithmetic_evals[i][0])) {
            var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]); 
            if (chk(a,b)) return evl(a,b);
          }
        }
      }
    }
}); 

//eof
