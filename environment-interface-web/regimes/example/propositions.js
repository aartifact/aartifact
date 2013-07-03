/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// regimes/undergrad_instruction_linear_algebra/propositions.js
//   Propositions to be included in the library.
//

//"\\forall x \\in \\R, \\forall y \\in \\R, x > y \\iff y < x",

aartifact.library.propositions = [

  ['<b>R</b><sup>3</sup> (vector space axioms)', [
    "\\forall u,v \\in \\R^3, u+v = v+u",
    "\\forall u,v,w \\in \\R^3, u+(v+w) = (u+v)+w",
    "\\forall v \\in \\R^3, [0;0;0]+v = v",
    "\\forall v \\in \\R^3, v+(-v) = [0;0;0]",
    "\\forall v \\in \\R^3, 1*v = v",
    "\\forall u,v \\in \\R^3, \\forall s \\in \\R, s*(u+v) = (s*u)+(s*v)",
    "\\forall u,v \\in \\R^3, \\forall s \\in \\R, (u+v)*s = (u*s)+(v*s)",
    "\\forall v \\in \\R^3, \\forall a,b \\in \\R, a*(b*v) = (a*b)*v"
  ]],

  ['<b>R</b><sup>3</sup> (other derived algebraic properties)', [
    "\\forall v \\in \\R^3, v+[0;0;0] = v",
    "\\forall v \\in \\R^3, v*1 = v",
    "\\forall v \\in \\R^3, -(-v) = v",
    "\\forall v \\in \\R^3, -1 * -v = v",
    "\\forall v \\in \\R^3, -1*v = -v",
    "\\forall u,v \\in \\R^3, -1*(v-u) = u-v",
    "\\forall u,v \\in \\R^3, u+(-v) = u-v",
    "\\forall v \\in \\R^3, \\forall a,b \\in \\R, (a+b)*v = a*v + b*v",
    "\\forall v \\in \\R^3, \\forall a,b \\in \\R, (a-b)*v = a*v - b*v"
  ]],

  ['<b>R</b><sup>2&times;2</sup> (matrices and vectors)', [
    "\\forall a,b,c,d \\in \\R,             [a,b;c,d]^\\t = [a,c;b,d]",
    "\\forall a,b,c,d,x,y \\in \\R,         [a,b;c,d] * [x;y] = [a*x+b*y;c*x+d*y]",
    "\\forall M \\in \\R^(2 \\times 2),     M * [0;0] = [0;0]",
    "\\forall a,b,c,d,a',b',c',d' \\in \\R, [a,b;c,d] * [a',b';c',d'] = [a*a'+b*c', a*b'+b*d'; c*a'+d*c', c*b'+d*d']",
    "\\forall a,b,c,d \\in \\R, \\det [a,b;c,d] = a*d - b*c",
    "\\forall M \\in \\R^(2 \\times 2), `(M) is invertible` \\implies M^(-1) * M = [1,0;0,1]",
    "\\forall M \\in \\R^(2 \\times 2), `(M) is invertible` \\iff \\det M \\neq 0",
    "\\forall v \\in \\R^2, [1,0;0,1] * v = v",
    "\\forall A,B \\in \\R^(2 \\times 2), \\forall v \\in \\R^2, A*(B*v) = (A*B)*v",
    "\\forall A \\in \\R^(2 \\times 2), (A^\\t)^\\t = A",
    "\\forall A,B \\in \\R^(2 \\times 2), (A*B)^\\t = B^\\t * A^\\t",
    "\\forall A \\in \\R^(2 \\times 2), \\rank A \\leq \\rank (A^\\t)"
  ]],
  
  ['<b>R</b><sup>2</sup> (operator definitions)', [
    "\\forall a,b,x,y \\in \\R, [a;b]+[x;y] = [a+x;b+y]",
    "\\forall x,y \\in \\R, -[x;y] = [-x;-y]",
    "\\forall x,y,s \\in \\R, s*[x;y] = [s*x;s*y]",
    "\\forall x,y,s \\in \\R, [x;y]*s = [x*s;y*s]",
    "\\forall x,y,x',y' \\in \\R, [x;y]*[x';y'] = x*x'+y*y'",
    "\\forall x,y,x',y' \\in \\R, [x;y]*[x';y'] = [x';y']*[x;y]",
    "\\forall x,y,x',y' \\in \\R, `([x;y]) and ([x';y']) are linearly dependent` \\iff x*y' = y*x'",
    "\\forall x,y,x',y' \\in \\R, `([x;y]) and ([x';y']) are linearly independent` \\iff x*y' \\neq y*x'",
    "\\forall x,y,x',y' \\in \\R, `([x;y]) and ([x';y']) are orthogonal` \\iff [x;y]*[x';y'] = 0",
    "\\forall u,v \\in \\R^2, `(u) and (v) are orthogonal` \\implies `(u) and (v) are linearly independent`",
    "\\forall v \\in \\R^2, `(v) is a unit vector` \\implies ||v|| = 1",
    "\\forall x,y \\in \\R, x*x+y*y = 1 \\iff ||[x;y]|| = 1",
    "\\forall x,y \\in \\R, ||[x;y]|| = \\sqrt(x*x+y*y)"
  ]],

  ['<b>R</b> (algebraic properties)', [
    "\\forall x,y \\in \\R, x+y = y+x",
    "\\forall x,y,z \\in \\R, x+(y+z) = (x+y)+z",
    "\\forall x \\in \\R, 0+x = x",
    "\\forall x \\in \\R, x+(-x) = 0",
    "\\forall s,x,y \\in \\R, s*(x+y) = (s*x)+(s*y)",
    "\\forall x,y \\in \\R, x*y = y*x",
    "\\forall x,y,z \\in \\R, x*(y*z) = (x*y)*z",
    "\\forall x \\in \\R, 1*x = x",
    "\\forall x \\in \\R, 0*x = 0",
    "\\forall x,y \\in \\R, x \\neq y \\iff y \\neq x",
    "\\forall x,y \\in \\R, x-y = x+(-y)",
    "\\forall x \\in \\R, -1*x = -x"
  ]]
];

aartifact.library.propositions.prepare = function(){
  var P = aartifact.parseExpFromStr, L = aartifact.library, A = aartifact.analysis;
  for (var i = 0; i < L.propositions.length; i++) {
    for (var j = 0; j < L.propositions[i][1].length; j++) {
      L.propositions[i][1][j] = P(L.propositions[i][1][j]);
      A.analyze(new Environment(), L.propositions[i][1][j]);
    }
  }
}();

//eof
