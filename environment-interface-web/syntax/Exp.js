/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// syntax/Exp.js
//   Representation of mathematical and logical expressions,
//   their syntactic equivalence, and their conversion to human-
//   friendly formats.
//

Include.include('utilities/Array.js');


/////////////////////////////////////////////////////////////////////
// The expression abstract syntax tree data structure.

function Exp (con, op, dat, wrapped, invisible) {
  // Basic data for syntax.
  this.typ = 'Term';
  this.con = con;
  this.operator = op;
  this.op = op;
  this.dat = dat;

  // Categorization.
  this.relation = false;

  // Presentation-level data.
  this.wrapped = wrapped;
  if (invisible == 'invisible')
    this.invisible = true;


  // Does the expression have free variables?
  // Does the expression have any variables?

  // Is the expression a statement?

}

Exp.prototype.copy = function() {
  var e = new Exp(this.con, this.op, this.dat, this.wrapped, this.invisible);
  e.relation = this.relation;
  if (e.dat.isArray && e.dat.isArrayOfArrays())
    e.dat = e.dat.map2d(function(e){ return e.copy(); });
  else if (e.dat.isArray)
    e.dat = e.dat.map(function(e){ return e.isExp ? e.copy() : e; });
  return e;
}

Exp.prototype.isExp = true;

// Concise matching of expressions and expression patterns.
Exp.prototype.is = function(e) {

  // Special cases.
  if (this.con == 'TextOp' && e.con == 'TextOp' && e.op == null && e.dat == null) // Wildcard "TextOp" pattern.
    return true;

  // General cases and wildcard cases.
  if (e == 'X') return true; // Wildcard.
  if (e == null) return false;
  if (this.con == null || e.con == null) return false;
  if (this.con != e.con) return false;
  if (this.op != e.op) return false;

  if (this.dat == null) return false;
  if (e.dat == null) return true; // Wildcard -- no arguments in pattern.

  if (this.dat.length == null && e.dat.length == null) {
    if (this.dat != e.dat) 
      return false;
    else
      return true;
  } else if (this.dat.length != e.dat.length) {
    return false;
  } else { // same lengths
    
    for (var i = 0; i <  this.dat.length; i++) {
      if (e.dat[i] == null) // Wildcard -- no arguments for pattern subtrees.
        continue;
    
      if (this.dat[i].isExp && e.dat[i].isExp) {
        if (!this.dat[i].is(e.dat[i]))
          return false;
      } else if (this.dat[i].isExp == null && e.dat[i].isExp == null) {
        if (this.dat[i] != e.dat[i] && e.dat[i] != 'X') //Wildcard.
          return false;
      } else {
        return false;
      }
    }
  }
  return true;
};

Exp.prototype.eq = function(e) {
  if ( this.typ == e.typ && this.con == e.con && this.op == e.op && this.wrapped == e.wrapped) {
    if (this.dat.isArray && e.dat.isArray)
      return this.dat.eq(e.dat, function(e1,e2){ return (e1.isExp && e2.isExp && e1.eq(e2)) || (e1==e2); });
    else
      return this.dat == e.dat;    
  }
  return false;
};

Exp.prototype.equals = Exp.prototype.eq;

Exp.prototype.contains = function(e) {  
  if (this.eq(e))
    return true;
  if (this.dat.isArray) {
    for (var i = 0; i < this.dat.length; i++) {
      if (this.dat[i].isExp && this.dat[i].contains(e))
        return true;
      if (this.dat[i].isArray)
        for (var j = 0; j < this.dat[i].length; j++)
          if (this.dat[i][j].isExp && this.dat[i][j].contains(e))
            return true;
    }
  }
  return false;
}

Exp.prototype.subst = function(s /* array of pairs */) {
  if (this.con == 'Var') {
    for (var i = 0; i < s.length; i++)
      if (s[i][0] == this.dat)
        return s[i][1].copy();
    return this.copy();
  }

  if (this.con == 'Quantifier' || this.con == 'SetComprehension')
    return this.copy();

  var e = new Exp(this.con, this.op, this.dat, this.wrapped, this.invisible);
  e.relation = this.relation;

  if (e.dat.isArray && e.dat.isArrayOfArrays())
    e.dat = e.dat.map2d(function(e){ return e.isExp ? e.subst(s) : e; });
  else if (e.dat.isArray)
    e.dat = e.dat.map(function(e){ return e.isExp ? e.subst(s) : e; });

  return e;
}

Exp.prototype.isOp = function(opOrOps) {
  if (opOrOps.isArray) {
    for (var i = 0; i < opOrOps.length; i++)
      if (opOrOps[i] == this.op)
        return true;
    return false;
  } else
    return this.op == opOrOps;
}

Exp.prototype.mimic = function(e) {
  if (e.isExp) {
    this.typ = e.typ;
    this.con = e.con;
    this.operator = e.op;
    this.op = e.op;
    this.dat = e.dat;
    this.wrapped = e.wrapped;
    this.invisible = e.invisible;
  }
}

Exp.prototype.vars = function() {
  if (this.con == 'Var')
    return [this.dat];
  else if (this.dat.isArray)
    return this.dat.flattenNd().map(function(e){return e.vars();}).flattenNd();
}

Exp.prototype.splitByOp = function(op) {
  if (this.op == op) {
    var es = [];
    for (var i = 0; i < this.dat.length; i++)
      es = es.concat(this.dat[i].splitByOp(op));
    return es;
  } else
    return [this];
}

// Split an expression with a quantifier into the
// bindings and body.
Exp.prototype.splitQuant = function(q) {
  var binds = [];
  var e_cur = this;
  while (e_cur.op == q) {
    binds.push(e_cur.dat[0]);
    e_cur = e_cur.dat[1];
  }
  return {binds: binds, body: e_cur};
}

//eof
