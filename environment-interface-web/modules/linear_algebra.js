/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// module/linear_algebra.js
//   Static analysis and evaluation of instances of concepts in
//   basic linear algebra.
//

Include.include('utilities/Environment.js');
Include.include('utilities/Sylvester.js');


aartifact.module({
  presentation:
    function(P, fmt, e) {
    },

  analysis:
    function(A, env, e) {
      var E = aartifact.expression.constructors; 
      var EQ = aartifact.equality;

      if (e.analysis.linear_algebra == null)
        e.analysis.linear_algebra = {};

      var r = aartifact.expression.extract(E.Bracks(E.SepBySeq(E.Semicolon,E.SepBySeq(E.Comma,E.X))), e);
      if (r != null) {
        e.analysis.linear_algebra.matrix = r;
        e.analysis.linear_algebra.is_matrix = true;
        e.con = 'Matrix';
        e.operator = null;
        e.op = null;
        e.dat = r;
        var dims = r.dimensions();
        if (!dims) {
          e.analysis.errors.push({text: 'the matrix does not have valid dimensions; each row must be of the same length'});
        } else {
          if (dims.cols == 1) {
            if (e.dat.forall2d(function(e){ return e.analysis.properties.contains(E.In(e, E.R()), EQ.eq_bas);}))
              e.analysis.properties.push(E.In(e, E.Super(E.R(), E.Num(dims.rows))));
 
            //e.analysis.properties.push(TextOp('* is a vector', [e]));
          } else {
            if (e.dat.forall2d(function(e){ return e.analysis.properties.contains(E.In(e, E.R()), EQ.eq_bas);}))
              e.analysis.properties.push(E.In(e, E.Super(E.R(), E.Times(E.Num(dims.rows),E.Num(dims.cols)))));

            if (e.dat.forall2d(function(e){ return e.is(E.Num());})) {
              if ($M(e.dat.map2d(function(e){ return e.dat[0]; })).inv() != null)
                e.analysis.properties.push(E.TextOp('* is invertible', [e]));
              else
                e.analysis.properties.push(E.TextOp('* is singular', [e]));
            }

            //e.analysis.properties.push(TextOp('* is a matrix', [e]));
            //e.analysis.properties.push(TextOp('* is a * by * matrix', [e, E.Num(dims.rows), E.Num(dims.cols)]));
          }
        }
      }

      if (e.con == 'Infix') {
      
        if ( e.op == 'Super' 
         && e.dat[1].is(E.Neg(E.Num(1)))) {
          for (var dims = 1; dims < 11; dims++) {
            if ( e.dat[0].analysis.properties.contains(E.TextOp('* is invertible', [e.dat[0]]), EQ.eq_bas) 
              && e.dat[0].analysis.properties.contains(E.In(e.dat[0], E.Super(E.R(),E.Times(E.Num(dims),E.Num(dims)))), EQ.eq_bas)) {
              e.analysis.properties.push(E.In(e, E.Super(E.R(), E.Times(E.Num(dims),E.Num(dims)))));
            }
          }
        }

        if (e.isOp(['Plus','Minus'])) {
          for (var d = 1; d < 11; d++) {
            if ( A.prop(e.dat[0], E.In(e.dat[0], E.Super(E.R(),E.Num(d))))
              && A.prop(e.dat[1], E.In(e.dat[1], E.Super(E.R(),E.Num(d))))
               ) {
              e.analysis.properties.push(E.In(e, E.Super(E.R(), E.Num(d))));
              e.analysis.linear_algebra.is_matrix = true;
            }
          }
        }

        if (e.isOp(['Mult','Apply'])) {
          for (var d = 1; d < 11; d++) {
            if ( A.prop(e.dat[0], E.In(e.dat[0], E.Super(E.R(),E.Num(d)))) && A.prop(e.dat[1], E.In(e.dat[1], E.R())) ) {
              e.analysis.properties.push(E.In(e, E.Super(E.R(), E.Num(d))));
              e.operator = 'Mult';
              e.analysis.linear_algebra.is_matrix = true;
            }
            if ( A.prop(e.dat[1], E.In(e.dat[1], E.Super(E.R(),E.Num(d)))) && A.prop(e.dat[0], E.In(e.dat[0], E.R())) ) {
              e.analysis.properties.push(E.In(e, E.Super(E.R(), E.Num(d))));
              e.operator = 'Mult';
              e.analysis.linear_algebra.is_matrix = true;
            }
            if ( A.prop(e.dat[0], E.In(e.dat[0], E.Super(E.R(),E.Num(d)))) && A.prop(e.dat[1], E.In(e.dat[1], E.Super(E.R(),E.Num(d)))) ) {
              e.analysis.properties.push(E.In(e, E.R()));
              e.operator = 'Mult';
              e.analysis.linear_algebra.is_matrix_result = true;
            }
            if ( A.prop(e.dat[0], E.In(e.dat[0], E.Super(E.R(),E.Times(E.Num(d),E.Num(d))))) 
              && A.prop(e.dat[1], E.In(e.dat[1], E.Super(E.R(),E.Num(d)))) ) {
              e.analysis.properties.push(E.In(e, E.Super(E.R(),E.Num(d))));
              e.operator = 'Mult';
              e.analysis.linear_algebra.is_matrix_result = true;
            }
          }
        }
    
        if (e.isOp(['Eq','Neq']))
          for (var d = 1; d < 11; d++)
            if ( A.prop(e.dat[0], E.In(e.dat[0], E.Super(E.R(),E.Num(d)))) && A.prop(e.dat[1], E.In(e.dat[1], E.Super(E.R(),E.Num(d)))) )
              e.analysis.linear_algebra.is_matrix_result = true;
      }
  
      if (e.con == 'Prefix') {
        if (e.isOp('Neg')) {
          for (var dims = 1; dims < 11; dims++) {
            if ( e.dat[0].analysis.properties.contains(E.In(e.dat[0], E.Super(E.R(),E.Num(dims))), EQ.eq_bas) ) {
              e.analysis.properties.push(E.In(e, E.Super(E.R(), E.Num(dims))));
              e.analysis.linear_algebra.is_matrix = true;
            }
          }
        }
      }


      if (e.isOp('Norm')) {
        for (var dims = 1; dims < 11; dims++) {
          if ( e.dat[0].analysis.properties.contains(E.In(e.dat[0], E.Super(E.R(),E.Num(dims))), EQ.eq_bas) ) {
            e.analysis.properties.push(E.In(e, E.R()));
            e.analysis.linear_algebra.is_matrix_result = true;
          }
        }
      }

      if (e.isOp('Transpose')) {
        for (var d = 1; d < 11; d++) {
          if ( A.prop(e.dat[0], E.In(e.dat[0], E.Super(E.R(),E.Times(E.Num(d),E.Num(d)))))) {
            e.analysis.properties.push(E.In(e, E.Super(E.R(),E.Times(E.Num(d),E.Num(d)))));
            e.analysis.linear_algebra.is_matrix_result = true;
          }
        }
      }


      if (e.isOp('Span')) {
        if (A.prop(e.dat[0], E.Subset(e.dat[0], E.Super(E.R(),E.Num(2)))))
          e.analysis.properties.push(E.Subset(e, E.Super(E.R(),E.Num(2))));
      }
      

      if (e.isOp('Augment')) {
        var a = e.dat[0];
        if (a.wrapped && a.op == 'Comma') {
          if (A.prop(a.dat[0], E.In(a.dat[0], E.Super(E.R(),E.Num(2)))) && A.prop(a.dat[1], E.In(a.dat[1], E.Super(E.R(),E.Num(2)))))
            e.analysis.properties.push(E.In(e, E.Super(E.R(),E.Times(E.Num(2),E.Num(2)))));
        }
      }

      if (e.is(E.Dim(E.Super(E.R(), E.Num()))))
        e.analysis.properties.push(E.In(e, E.R()));


      if (e.isOp('Det')) {
        
      }

      if (e.isOp('Rref')) {
          
      }

    },

  equality:
    function(EQ, e1, e2, eq_alt, eq_bas) {

      var eq_rec = (eq_bas != null) ? eq_bas : EQ.eq;

      if (e1.isOp('Super') && e2.isOp('Super'))
        return eq_rec(e1.dat[0], e2.dat[0], eq_alt) && eq_rec(e1.dat[1], e2.dat[1], eq_alt);

      if (e1.isOp(['Norm', 'Span', 'Det', 'Basis', 'Dim']) && e1.op == e2.op)
        return eq_rec(e1.dat[0], e2.dat[0], eq_alt);

      if (e1.con == 'Matrix' && e2.con == 'Matrix') {
        if (e1.dat.hasSameDimensions2d(e2.dat)) {
          var r = e1.dat.componentwiseBinaryOp2d(function(e1,e2){return eq_rec(e1,e2,eq_alt);}, e2.dat);
          if (r.forall2d(function(b){return b;}))  return true;
          if (r.exists2d(function(b){return !b;})) return false;
        }
      }

    },

  evaluation:
    function(EV, env, e) {

      var E = aartifact.expression.constructors;
      var A = aartifact.analysis;

      if (e.analysis.linear_algebra.matrix != null) {
        var r = e.analysis.linear_algebra.matrix.map2d(function(e){ return EV.evaluate(env, e); });
        if (r.forall2d(function(e){return e.con == 'Num';})) return A.copy(e,E.Matrix(r));
        else return new Error('only matrices with real number components can be evaluated');
      }

      if (e.is(E.Dim(E.Super(E.R(), E.Num()))))
        return e.dat[0].dat[1];

      if (e.isOp('Neg')) {
        var m = EV.evaluate(env,e.dat[0]); if (m.isError) return m;
        if (m.con == 'Matrix') return E.Matrix(m.dat.map2d(function(e){return E.Num(0 - e.dat[0]);}));
      }

      if (e.isOp('Span')) {
        var v = EV.evaluate(env,e.dat[0]); if (v.isError) return v;
        return E.Span(v);
      }

      if (e.isOp('Norm')) {
        var norm = 0;
        var m = EV.evaluate(env, e.dat[0]); if (m.isError) return m;
        if (m.con == 'Matrix') {
          var dims = m.dat.dimensions();
          if (dims.cols == 1) {
            for (var i = 0; i < dims.rows; i++) {
              if (m.dat[i][0].con == 'Num')
                norm += m.dat[i][0].dat[0] * m.dat[i][0].dat[0];
              else
                return new Error('the norm is only defined on vectors with real number components');
            }
          }
          return E.Num(Math.sqrt(norm));
        }
      }

      if (e.isOp('Orthonormal')) {
        var s = EV.evaluate(env,e.dat[0]); if (s.isError) return s;
        
        if (s.dat.forall(function(e){return e.is(E.Matrix()) &&  e.dat.dimensions().cols == 1;})) {
          var vs = s.dat.map(function(e){return $V(e.dat.map2d(function(x){return x.dat[0];}))});
          for (var i = 0; i < vs.length; i++) {
            for (var j = 0; j < i; j++)
              vs[i] = vs[i].subtract(vs[j].multiply((vs[j].dot(vs[i]))));
            vs[i] = vs[i].toUnitVector();        
          }
          return E.Set(vs.map(function(v){return E.Matrix(v.elements.map(function(x){return [E.Num(x)];}))}));
        }

        return E.Undefined();
      }

      if (e.isOp('Decompose')) {
        var v = EV.evaluate(env,e.dat[0]); if (v.isError) return v;
        if (v.is(E.Matrix())) return E.Set(v.dat.columns().map(function(c){return E.Matrix(c.map(function(x){return [x];}));}));
        return E.Undefined();
      }

      if (e.isOp(['Augment','MatrixMake'])) {
        var s = EV.evaluate(env,e.dat[0]); if (s.isError) return s;
        if (s.is(E.Set()) || (s.is(E.Tuple())) && s.dat.length > 0)
          return E.Matrix(s.dat[0].dat.augmentAll2d(s.dat.slice(1).map(function(x){return x.dat;})));
          
        if (s.wrapped == 'Parens') {
          var ms = s.splitByOp('Comma');
          if (ms.length > 0)
            return E.Matrix(ms[0].dat.augmentAll2d(ms.slice(1).map(function(x){return x.dat;})));
        }

        return E.Undefined();
      }

      if (e.isOp('Det')) {
        var m = EV.evaluate(env,e.dat[0]); if (m.isError) return m;
        if (m.dat.forall2d(function(e){return e.is(E.Num());}))
          return E.Num($M(m.dat.map2d(function(e){ return e.dat[0]; })).det());
        else
          return E.Undefined();
      }

      if (e.isOp('Rref')) {
        var m = EV.evaluate(env,e.dat[0]); if (m.isError) return m;
        if (m.dat.forall2d(function(e){ return e.is(E.Num());})) {
          var r = Math.rref(m.dat.map2d(function(e){ return e.dat[0]; }));
          return (r != null) ? E.Matrix(r.map2d(function(n){ return E.Num(n); })) : E.Undefined();
        } else
          return E.Undefined();
      }

      if (e.isOp('Rank')) {
        var m = EV.evaluate(env,e.dat[0]); if (m.isError) return m;
        if (m.dat.forall2d(function(e){ return e.is(E.Num());}))
          return E.Num($M(m.dat.map2d(function(e){ return e.dat[0]; })).rank());
        else
          return E.Undefined();
      }

      if (e.isOp('Trace')) {
        var m = EV.evaluate(env,e.dat[0]); if (m.isError) return m;
        if (m.dat.forall2d(function(e){ return e.is(E.Num());}))
          return E.Num($M(m.dat.map2d(function(e){ return e.dat[0]; })).trace());
        else
          return E.Undefined();
      }

      if (e.isOp('Transpose')) {
        var m = EV.evaluate(env,e.dat[0]); if (m.isError) return m;
        if (m.dat.forall2d(function(e){ return e.is(E.Num());})) {
          var m = $M(m.dat.map2d(function(e){ return e.dat[0]; })).transpose();
          return (m == null) ? E.Undefined() : E.Matrix(m.elements.map2d(function(n){ return E.Num(n); }));
        } else
          return E.Undefined();
      }

      if (e.con == 'Infix') {
        if (e.operator == 'Super') {
          var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]); if (a.isError) return a; if (b.isError) return b;
          if (a.con == 'Matrix' && b.is(E.Num(-1))) {
            var d1 = a.dat.dimensions();
            if (d1.cols == d1.rows && a.dat.forall2d(function(e){ return e.is(E.Num());})) {
              var m = $M(a.dat.map2d(function(e){ return e.dat[0]; })).inv();
              return (m == null) ? E.Undefined() : E.Matrix(m.elements.map2d(function(n){ return E.Num(n); }));
            } else
              return E.Undefined();
          }
        }

        if (e.operator == 'Plus')  {
          var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]);
          if (a.con == 'Matrix' && b.con == 'Matrix') {
            var a = a.dat.map2d(function(e){return e.dat[0];}), b = b.dat.map2d(function(e){return e.dat[0];});
            if (a.hasSameDimensions2d(b))
              return E.Matrix(a.componentwiseBinaryOp2d(function(x,y){return x+y;}, b).map2d(function(n){ return E.Num(n); }));
            else
              return new Error('vectors or matrices supplied to operator have incompatible dimensions');
          }
        }
    
        if (e.operator == 'Minus')  {
          var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]);
          if (a.con == 'Matrix' && b.con == 'Matrix') {
            var a = a.dat.map2d(function(e){return e.dat[0];}), b = b.dat.map2d(function(e){return e.dat[0];});
            if (a.hasSameDimensions2d(b))
              return E.Matrix(a.componentwiseBinaryOp2d(function(x,y){return x-y;}, b).map2d(function(n){ return E.Num(n); }));
            else
              return new Error('vectors or matrices supplied to operator have incompatible dimensions');
          }
        }

        if (e.operator == 'Mult')  {
          var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]);
          if (a.isError) return a; if (b.isError) return b;

          if (a.con == 'Matrix' && b.con == 'Num') return A.copy(e,E.Matrix(a.dat.map2d(function(e){return E.Num(b.dat[0]*e.dat[0]);})));
          if (a.con == 'Num' && b.con == 'Matrix') return A.copy(e,E.Matrix(b.dat.map2d(function(e){return E.Num(a.dat[0]*e.dat[0]);})));

          if (a.con == 'Matrix' && b.con == 'Matrix') {
          
            var d1 = a.dat.dimensions();
            var d2 = b.dat.dimensions();
            
            // Dot product.
            if (d1.cols == 1 && d2.cols == 1 && d1.rows == d2.rows) {
          
              var dotprod = 0;
              for (var i = 0; i < a.dat.length; i++) {
                for (var j = 0; j < a.dat[i].length; j++) {
                  if (a.dat[i][j].con == 'Num' && b.dat[i][j].con == 'Num')
                    dotprod += a.dat[i][j].dat[0] * b.dat[i][j].dat[0];
                  else
                    return null;
                }
              }
              return A.copy(e, E.Num(dotprod));
            }

            // Matrix multiplication.
            if (d1.cols == d2.rows) {
              var m = [];
              for (var i = 0; i < d1.rows; i++) {
                m.push([]);
                for (var j = 0; j < d2.cols; j++)
                  m[i].push(null);
              }
              for (var k = 0; k < d2.cols; k++) {
                for (var i = 0; i < d1.rows; i++) {
                  var cur_c = 0;
                  for (var j = 0; j < d2.rows; j++) {
                    if (a.dat[i][j].con == 'Num' && b.dat[j][k].con == 'Num')
                      cur_c += a.dat[i][j].dat[0] * b.dat[j][k].dat[0];
                    else
                      return null;
                  }
                  m[i][k] = E.Num(cur_c);
                }
              }
              return A.copy(e, E.Matrix(m));
            }
            
            
          }
        }

        if (e.operator == 'Eq')  {
          var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]);
          if (a.con == 'Matrix' && b.con == 'Matrix')
            return (aartifact.equality.eq(a,b))?E.True():E.False();
        }

        if (e.operator == 'Neq')  {
          var a = EV.evaluate(env,e.dat[0]), b = EV.evaluate(env,e.dat[1]);
          if (a.con == 'Matrix' && b.con == 'Matrix') {
            if (a.dat.length != b.dat.length)
              return false;

            for (var i = 0; i < a.dat.length; i++) {
              for (var j = 0; j < a.dat[i].length; j++) {
                if (a.dat[i][j].con == 'Num' && b.dat[i][j].con == 'Num') {
                  if (a.dat[i][j].dat[0] == b.dat[i][j].dat[0])
                    return false;
                } else
                  return null;
              }
            }
            return true;
          }
        }
      }
    }
});

//eof
