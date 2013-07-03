/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// module/bit_strings.js
//   Evaluation of bit strings.
//

aartifact.module({
  presentation:
    function(P, fmt, e) {
    },

  analysis:
    function(A, env, e) {
      var E = aartifact.expression.constructors;
      var EQ = aartifact.equality;

      if (e.is(E.Bits())) {
        e.analysis.properties.push(E.In(e, E.BitStrings()));
      }
      
      if (e.isOp(['Mult'])) {
        if (A.prop(e.dat[0], E.In(e.dat[0], E.To(E.BitStrings(),E.BitStrings()))) && A.prop(e.dat[1], E.In(e.dat[1], E.BitStrings()))) {
          e.analysis.properties.push(E.In(e, E.BitStrings()));
        }
      }

      if (e.isOp(['Oplus','Concat','Vee','Wedge']))
        if (A.prop(e.dat[0], E.In(e.dat[0], E.BitStrings())) && A.prop(e.dat[1], E.In(e.dat[1], E.BitStrings())))
          e.analysis.properties.push(E.In(e, E.BitStrings()));
    },

  equality:
    function(EQ, e1, e2, eq_alt, eq_bas) {
      var A = aartifact.analysis;
      var E = aartifact.expression.constructors;
      var eq_rec = (eq_bas != null) ? eq_bas : EQ.eq;

      if (e1.is(E.Oplus()) && e2.is(E.Oplus())) return eq_rec(e1.dat[0], e2.dat[0], eq_alt) && eq_rec(e1.dat[1], e2.dat[1], eq_alt);
      if (e1.is(E.Vee()) && e2.is(E.Vee())) return eq_rec(e1.dat[0], e2.dat[0], eq_alt) && eq_rec(e1.dat[1], e2.dat[1], eq_alt);
      if (e1.is(E.Wedge()) && e2.is(E.Wedge())) return eq_rec(e1.dat[0], e2.dat[0], eq_alt) && eq_rec(e1.dat[1], e2.dat[1], eq_alt);
      if (e1.is(E.Concat()) && e2.is(E.Concat())) return eq_rec(e1.dat[0], e2.dat[0], eq_alt) && eq_rec(e1.dat[1], e2.dat[1], eq_alt);
      if (e1.is(E.Mult()) && e2.is(E.Mult())) return eq_rec(e1.dat[0], e2.dat[0], eq_alt) && eq_rec(e1.dat[1], e2.dat[1], eq_alt);
      if (e1.is(E.Sim()) && e2.is(E.Sim())) return eq_rec(e1.dat[0], e2.dat[0], eq_alt) && eq_rec(e1.dat[1], e2.dat[1], eq_alt);

    }
});

//eof
