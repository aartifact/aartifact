/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// regimes/undergrad_instruction_linear_algebra/expression.js
//   Representation of mathematical and logical expressions,
//   and some of their conversion to human-friendly formats.
//

Include.include('aartifact.js');
Include.include('syntax/Exp.js');


/////////////////////////////////////////////////////////////////////
// The aartifact expression component.

aartifact.expression = {
  constructors: function() {
    var A = aartifact;

    var Constant = function(s){ return function(){ return new Exp('Constant', null, [s]); }; };
    var Infix = function(op){ return function(e1,e2){ return new Exp('Infix', op, [e1,e2]); }; };
    var InfixRelation = function(op){ return function(e1,e2){ var e = new Exp('Infix', op, [e1,e2]); e.relation = true; return e; }; };
    var Circumfix = function(op){ return function(e){ return new Exp('Circumfix', op, [e]); }; };
    var Prefix = function(op){ return function(e){ return new Exp('Prefix', op, [e]); }; };
    var Quantifier = function(op){ return function(e1,e2){ return new Exp('Quantifier', op, [e1,e2]); }; };

    var Statement0 = function(op){ return function(es){ return new Exp('Statement', op, []); }; };
    var Statement = function(op){ return function(es){ return new Exp('Statement', op, es); }; };

    return {
    Skip:               Statement0('Skip'),
    Send:               Statement('Send'),
    Receive:            Statement('Receive'),
    IfThenElse:         Statement('IfThenElse'),

    V:                  function(v) { return new Exp('Var', null, v); },
    Num:                function(n) { return new Exp('Num', null, ((n!=null)?[Math.precision(n)]:null)); },
    Bits:               function(b) { return new Exp('Bits', null, ((b!=null)?[b]:null)); },
    BitStrings:         Constant('BitStrings'),
    R:                  Constant('R'),
    True:               Constant('True'),
    False:              Constant('False'),
    Undefined:          Constant('Undefined'),
    Indeterminate:      Constant('Indeterminate'),
    Placeholder:        Constant('Placeholder'),
    Bars:               Circumfix('Bars'),
    Bracks:             Circumfix('Bracks'),
    Braces:             Circumfix('Braces'),
    Norm:               Prefix('Norm'),
    MatrixMake:         Prefix('MatrixMake'),
    Augment:            Prefix('Augment'),
    Decompose:          Prefix('Decompose'),
    Orthonormal:        Prefix('Orthonormal'),
    Rref:               Prefix('Rref'),
    Rank:               Prefix('Rank'),
    Trace:              Prefix('Trace'),
    Transpose:          Circumfix('Transpose'),
    Bottom:             Constant('Bottom'),
    Det:                Prefix('Det'),
    Span:               Prefix('Span'),
    Dim:                Prefix('Dim'),
    Basis:              Prefix('Basis'),
    Ker:                Prefix('Ker'),
    Img:                Prefix('Img'),
    Sqrt:               Prefix('Sqrt'),
    Neg:                Prefix('Neg'),
    Oplus:              Infix('Oplus'),
    Otimes:             Infix('Otimes'),
    Concat:             Infix('Concat'),
    Vee:                Infix('Vee'),
    Wedge:              Infix('Wedge'),
    Plus:               Infix('Plus'),
    Minus:              Infix('Minus'),
    Mult:               Infix('Mult'),
    Apply:              function(e1,e2) { return new Exp('Infix', 'Apply', [e1,e2], null, 'invisible'); },
    Mod:                Infix('Mod'),
    Div:                Infix('Div'),
    Floor:              Circumfix('Floor'),
    Ceiling:            Circumfix('Ceiling'),
    Circ:               Infix('Circ'),
    Iff:                Infix('Iff'),
    And:                Infix('And'),
    Or:                 Infix('Or'),
    Implies:            Infix('Implies'),
    Ldots:              Infix('Ldots'),
    Union:              Infix('Union'),
    Isect:              Infix('Isect'),
    Times:              Infix('Times'),
    Rightarrow:         Infix('Rightarrow'),
    To:                 Infix('Rightarrow'),
    Super:              Infix('Super'),
    In:                 InfixRelation('In'),
    Subset:             InfixRelation('Subset'),
    Subseteq:           InfixRelation('Subseteq'),
    Approx:             InfixRelation('Approx'),
    Equiv:              InfixRelation('Equiv'),
    Sim:                InfixRelation('Sim'),
    Simeq:              InfixRelation('Simeq'),
    Eq:                 InfixRelation('Eq'),
    Neq:                InfixRelation('Neq'),
    Lt:                 InfixRelation('Lt'),
    Gt:                 InfixRelation('Gt'),
    Leq:                InfixRelation('Leq'),
    Geq:                InfixRelation('Geq'),
    Forall:             Quantifier('Forall'),
    Exists:             Quantifier('Exists'),
    Semicolon:          Infix('Semicolon'),
    Comma:              Infix('Comma'),
    Mapsto:             Infix('Mapsto'),
    Space:              Infix('Space'),
    TextOp:             function(op, dat) { return new Exp('TextOp', op, dat); },
    Set:                function(s) { return new Exp('Set', null, s); },
    SetRange:           function(e1,e2) { return new Exp('SetRange', null, [e1,e2]); },
    SetComprehension:   function(e1,e2) { return new Exp('SetComprehension', null, [e1,e2]); },
    Tuple:              function(s) { return new Exp('Tuple', null, s); },
    TupleComprehension: function(e1,e2) { return new Exp('TupleComprehension', null, [e1,e2]); },
    Matrix:             function(m) { return new Exp('Matrix', null, m); },
    WrapParens:         function(e) { e.wrapped = 'Parens'; return e; },
    Infix:              function(op,e1,e2) { return new Exp('Infix', op, [e1,e2]); },
    InfixFoldRight:     function(op,es) { 
                          return (es.length==1)?es[0]:new Exp('Infix',op,[es[0],A.expression.constructors.InfixFoldRight(op,es.slice(1))]); 
                          },
    X:                  'X', // Wildcard in patterns.
    Var:                'Var',
    Constant:           function(s){ return new Exp('Constant', null, [s]) },
    Quantifier:         function(op,e1,e2){ return new Exp('Quantifier', op, [e1,e2]); },
    SepBySeq:           function(s,p) { return new Exp('SepBySeq', null, [s,p]); }
  }; }(),
  collapse:
    function(op, e) {
      if (e.con != 'Infix' || e.op != op().op || e.wrapped != null)
        return [e];
      if (e.con == 'Infix' && e.op == op().op) {
        var items = [];
        for (var i = 0; i < e.dat.length; i++)
          items = items.concat(this.collapse(op, e.dat[i]));
        return items;
      }
    },
  extract:
    function(p, e) {
      if (p == 'X') return e;
      if (p.con == 'Num' && e.con == 'Num' && p.dat == null) return e; // Any number.
      if (p.con == 'SepBySeq') {
        var seq = this.collapse(p.dat[0], e);
        for (var i = 0; i < seq.length; i++) {
          var r = this.extract(p.dat[1], seq[i]);
          if (r == null)
            return null;
          seq[i] = r;
        }
        return seq;
      }
      if (p.con == e.con && p.operator == e.operator)
        return this.extract(p.dat[0], e.dat[0]);
    },
  consistent:
    function (eq, s1, s2) {
      if (s1 == null || s2 == null)
        return false;

      function put_in(bs, name, thing) {
        for (var i = 0; i < bs.length; i++) {
          if (bs[i][0] == name) {
            bs[i][1].push(thing);
            return;
          }
        }
        bs.push([name ,[thing]]);
      }

      var buckets = [];
      for (var i = 0; i < s1.length; i++)
        if (s1[i][0] != null && s1[i][1] != null)
          put_in(buckets, s1[i][0], s1[i][1]);
      for (var i = 0; i < s2.length; i++)
        if (s2[i][0] != null && s2[i][1] != null)
          put_in(buckets, s2[i][0], s2[i][1]);

      for (var j = 0; j < buckets.length; j++) {
        if (buckets[j][1].length >= 2) {
          for (var i = 0; i < buckets[j][1].length-1; i++) {
            var r = aartifact.equality.eq(buckets[j][1][i], buckets[j][1][i+1]);
            if (r == null || r == false)
              return false;
          }
        }
      }

      return true;
    },
  consistent1:
    function (s) {
      if (s == null)
        return false;

      function put_in(bs, name, thing) {
        for (var i = 0; i < bs.length; i++) {
          if (bs[i][0] == name) {
            bs[i][1].push(thing);
            return;
          }
        }
        bs.push([name, [thing]]);
      }

      var buckets = [];
      for (var i = 0; i < s.length; i++)
        if (s[i][0] != null && s[i][1] != null)
          put_in(buckets, s[i][0], s[i][1]);

      for (var j = 0; j < buckets.length; j++)
        if (buckets[j][1].length >= 2)
          for (var i = 0; i < buckets[j][1].length-1; i++)
            if (buckets[j][1][i].eq(buckets[j][1][i+1]) != true)
              return false;

      return true;
    },
  match:
    function(p, e) {
      var subst = [];
      if (p.con == 'Var')
        return [[p.dat,e]];
        
      if (p.con=='Num' && e.con=='Num' && p.dat[0]==e.dat[0])
        return [];
      
      if (p.con == 'Constant' && e.con == 'Constant' && p.dat[0] == e.dat[0])
        return [];

      if (p.con == 'Prefix' && e.con == 'Prefix' && p.operator == e.operator) {
        var s1 = this.match(p.dat[0],e.dat[0]);
        if (s1 == null)
          return null;
        return s1;
      }
      if (p.con == 'Circumfix' && e.con == 'Circumfix' && p.operator == e.operator) {
        var s1 = this.match(p.dat[0],e.dat[0]);
        if (s1 == null)
          return null;
        return s1;
      }
      
      if (p.con == 'Infix' && e.con == 'Infix' && p.operator == e.operator) {
        var substs = [];
        var s1 = this.match(p.dat[0],e.dat[0]);
        var s2 = this.match(p.dat[1],e.dat[1]);
        if (s1 == null || s2 == null)
          return null;
        substs = substs.concat(s1,s2);
        return substs;
      }
      if (p.con == 'TextOp' && e.con == 'TextOp' && p.op == e.op && p.dat.length == e.dat.length) {
        var substs = [];
        for (var i = 0; i < p.dat.length; i++) {
          var s = this.match(p.dat[i],e.dat[i]);
          if (s == null)
            return null;
          else
            substs = substs.concat(s);
        }
        return substs;
      }
      if (p.con == 'Matrix' && e.con == 'Matrix' && p.dat.hasSameDimensions2d(e.dat)) {
        var substs = [];
        for (var i = 0; i < p.dat.length; i++) {
          for (var j = 0; j < p.dat[i].length; j++) {
            var s = this.match(p.dat[i][j], e.dat[i][j]);
            if (s == null) return null;
            substs = substs.concat(s);
          }
        }
        return substs;
      }
      
      if (p.con == 'Set' && e.con == 'Set' && p.dat.length == e.dat.length) {
        var substs = [];
        for (var i = 0; i < p.dat.length; i++) {
          var s = this.match(p.dat[i], e.dat[i]);
          if (s == null) return null;
          substs = substs.concat(s);
          }
        return substs;
      }
    },
  present_constant:
    function(type, c) {
      var arrs = [constants.constants, constants.operators, constants.relations];
      for (var i = 0; i < arrs.length; i++)
        if (c in arrs[i]) 
          return arrs[i][c][(type=='ascii') ? 0 : 1];
      return null;
    },
  keywords:
    function(e) {
      // Base cases.
      if (e.con == 'Var') return [e.dat];
      if (e.con == 'Num') return [e.dat[0]];
      if (e.con == 'Constant') {
        if (e.dat[0] == 'R') return ['R'];
        if (e.dat[0] == 'Bottom') return ['orthogonal', 'complement'];
      }
      
      // Recursive cases: generate the keywords for this
      // node, then make recursive calls.
      var a = [];
      
      if (e.con == 'Infix') {
        var o = e.operator;
        if (o=='In') a = a.concat(['\\in', 'in']); //'element'
        if (o=='Plus') a = a.concat(['+']); //'plus', 'add', 'addition'
        if (o=='Mult') a = a.concat(['*']); //'times', 'multiplication', 'multiply'
        if (o=='Minus') a = a.concat(['-']); //'minus'
        if (o=='Eq') a = a.concat(['=']); //'equal'
        if (o=='Neq') a = a.concat(['\\neq']); //'not equal'
      }

      if (e.con == 'Prefix') {
        var o = e.operator;
        if (o=='Neg') a = a.concat(['-']);
        if (o=='Ker') a = a.concat(['kernel','ker']);
        if (o=='Img') a = a.concat(['image','im','img']);
        if (o=='Span') a = a.concat(['span']);
        if (o=='Dim') a = a.concat(['dim']);
        if (o=='Basis') a = a.concat(['basis']);
        if (o=='Transpose') a = a.concat(['transpose']);
      }

      if (e.con == 'Circumfix') {
        var o = e.operator;
        if (o=='Norm') a = a.concat(['||']);
        if (o=='Sqrt') a = a.concat(['sqrt']);
      }

      if (e.con == 'Matrix') {
        a = a.concat(['[', ']']);
      }

      if (e.con == 'TextOp') {
        a = a.concat(e.op.split(' ').filter(function(x){ return x!='*';}));
      }

      if (e.dat != null) {
        if (e.dat.isArray == true)
          a = a.concat(e.dat.flattenNd().map(aartifact.expression.keywords).flattenNd());
      }

      if (e.terms != null) {
        if (e.terms.isArray == true)
          a = a.concat(e.terms.flattenNd().map(aartifact.expression.keywords).flattenNd());
      }

      return a;
    }
};

var constants = {
  constants: {
    Placeholder: ['``', ''],
    True: ['\\true', '<b>true</b>'],
    False: ['\\false', '<b>false</b>'],
    Not: ['\\not', '<b>not</b>'],
    Undefined: ['?', '<b>?</b>'],
    Indeterminate: ['\\indeterminate', '<b>indeterminate</b>'],
    Emptyset: ['\\emptyset', '&#8709;'],
    R: ['\\R', '<b>R</b>'],
    Infinity: ['\\infty', '&#8734;'],
    Sqrt: ['\\sqrt', '&radic;'],
    Rref: ['\\rref', 'rref'],
    Rank: ['\\rank', 'rank'],
    Trace: ['\\trace', 'trace'],
    Det: ['\\det', 'det'],
    Augment: ['\\augment', 'augment'],
    Decompose: ['\\decompose', 'decompose'],
    Orthonormal: ['\\orthonormal', 'orthonormal'],
    MatrixMake: ['\\matrix', 'matrix'],
    Span: ['\\span', 'span'],
    Dim: ['\\dim', 'dim'],
    Basis: ['\\basis', 'basis'],
    Ker: ['\\ker', 'ker'],
    Img: ['\\img', 'img'],
    Powerset: ['\\powerset', '<b><i>P</i></b>'],
    Max: ['\\max', 'max'],
    Min: ['\\min', 'min'],
    Dom: ['\\dom', 'dom'],
    Ran: ['\\ran', 'ran'],
    Neg: ['-', '&#8722;'],
    Top: ['\\top', '&#8868;'],
    Bottom: ['\\bottom', '&perp;']
  },
  operators: {
    Forall: ['\\forall', '&#8704;'],
    Exists: ['\\exists', '&#8707;'],
    Implies: ['\\implies', '<b>implies</b>'],
    Iff: ['\\iff', '<b>iff</b>'],
    And: ['\\and', '<b>and</b>'],
    Or: ['\\or', '<b>or</b>'],

    Comma: [',', ','],
    Semicolon: [';', ';'],

    Oplus: ['\\oplus', '&#8853;'],
    Otimes: ['\\otimes', '&#8855;'],
    Concat: ['\\concat', '||'],
    Vee: ['\\vee', '&or;'],
    Wedge: ['\\wedge', '&and;'],

    Plus: ['+', '+'],
    Minus: ['-', '&#8722;'], 
    Mult: ['*','&#8226;'],
    Mod: ['\\mod', 'mod'],
    Div: ['/', '/'],

    Union: ['\\cup', '&#8746;'],
    Isect: ['\\cap', '&#8745;'],
    Times: ['\\times', '&#215;'],
    Rightarrow: ['\\to', '&#8594;'],
    Mapsto: [':->', '&#x21A6;'],

    Circ: ['\\circ', '<span style="font-size:10px;">o</span>'],

    Super: ['^', '^'],
    Sub: ['_', '_'],
    Sum: ['\\sum_{', '<b>&Sigma;</b>'],
    Prod: ['\\prod_{', '<b>&Pi;</b>'],

    Braces: [['{','}'], ['{','}']],
    Bars: [['|','|'], ['|','|']],
    Floor: [['\\lfloor','\\rfloor'], ['&lfloor;','&rfloor;']],
    Ceiling: [['\\lceil','\\rceil'], ['&lceil;','&rceil;']],

    Ldots: ['...', '&hellip;'],

    BNFAltBar: ['|', '|']
  },
  relations: {
    BNFAssign: ['::=', '::='],
    Eqdef: [':=', ':='],
    Simeq: ['\\simeq', '&sime;'],
    Sim: ['\\sim', '&sim;'],
    Approx: ['\\approx', '&asymp;'],
    Equiv: ['\\equiv', '&equiv;'],
    Eq: ['=', '='],
    Neq: ['\\neq', '&#8800;'],
    Lt: ['<', '&lt;'],
    Gt: ['>', '&gt;'],
    Leq: ['\\leq', '&#8804;'],
    Geq: ['\\geq', '&#8805;'],
    In: ['\\in', '&#8712;'],
    Subset: ['\\subset', '&#8834;'],
    Subseteq: ['\\subseteq', '&#8838;'] 
  }
};

//eof
