/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/Array.js
//   Representation and manipulation of arrays.
//


Array.prototype.isArray = true;

Array.prototype.isArrayOfArrays = function() {
  for (var i = 0; i < this.length; i++)
    if (!this[i].isArray)
      return false;
  return (this.length > 0) ? true : false;
}

// Get the dimensions of an array of arrays.
// If the array is not rectangular, returns false;
// Otherwise, returns {rows:..., cols: ...}.
Array.prototype.dimensions = function() {
  if (this.length == 0)
    return false;
  var rows = this.length, cols = this[0].length;
  for (var r = 0; r < rows; r++)
    if (this[r].length != cols)
      return false;
  return {rows:rows, cols:cols};
};

Array.prototype.pushAll = function(a) { for (var i = 0; i < a.length; i++) this.push(a[i]); }

// Returns the last element by default. If an argument is
// supplied, returns the suffix with the specified number
// of elements.
Array.prototype.last = function(n) {
  if (n == null)
    return (this.length > 0) ? this[this.length-1] : null;
  else if (n >= 0)
    return this.slice(this.length-n);
}

// This function checks whether an element is in an array.
// An optional equality function can be supplied; otherwise,
// the supplied object's own equality function is used.
// Reference equality is always checked.
Array.prototype.contains = function(e, eq) {
  if (eq != null) {
    for (var i = 0; i < this.length; i++)
      if (this[i] == e || eq(this[i], e))
        return true;
  } else if (e.equals != null) {
    for (var i = 0; i < this.length; i++)
      if (this[i] == e || e.equals(this[i]))
        return true;
  }
  return false;
}

Array.prototype.containsAll = function(a, eq) {
  if (eq != null) {
    for (var i = 0; i < a.length; i++)
      if (!this.contains(a[i], eq))
        return false;
  }
  return true;
}

Array.prototype.remove = function(y, eq) { return this.filt(function(x){return !eq(x,y);}); }
Array.prototype.removeAll = function(ys, eq) { return this.filt(function(x){return !ys.contains(x,eq);})}

Array.prototype.append = function(x) {
  return this.concat([x]);
}

// This function filter duplicate entries out of the array.
// An optional equality function can be supplied; otherwise,
// the objects' own equality functions are used. Reference
// equality is always checked.
Array.prototype.distinct = function(eq) {
  var a = [];
  for (var i = 0; i < this.length; i++)
    if (!a.contains(this[i], eq))
      a.push(this[i]);
  return a;
}

Array.prototype.sum = function() { var s = 0; for (var i = 0; i < this.length; i++) s += this[i]; return s; }
Array.prototype.prod = function() { var p = 1; for (var i = 0; i < this.length; i++) p *= this[i]; return p; }

Array.prototype.map = function(f) {
  var a = [];
  for (var i = 0; i < this.length; i++)
    a.push(f(this[i]));
  return a;
};

Array.prototype.copy = function() {
  return this.map(function(x){return x;});
}

Array.prototype.copy2d = function() {
  return this.map2d(function(x){return x;});
}

Array.prototype.filt = function(f) {
  var a = [];
  for (var i = 0; i < this.length; i++)
    if (f(this[i])) a.push(this[i]);
  return a;
};

Array.prototype.map2d = function(f) {
  return this.map(function(a){ return a.map(f); });
};

Array.prototype.augment2d = function(a) {
  var d1 = this.dimensions(), d2 = a.dimensions();
  if ( d1 != false && d2 != false 
    && d1 != null && d2 != null
    && d1.rows == d2.rows
     ) {
    var b = [], rows = d1.rows, cols = d1.cols + d2.cols;
    
    for (var i = 0; i < rows; i++) {
      b.push([]);
      for (var j = 0; j < cols; j++)
        b[i].push(null);
    }

    for (var i = 0; i < rows; i++)
      for (var j = 0; j < cols; j++)
        b[i][j] = (j < d1.cols) ? this[i][j] : a[i][j-d1.cols];

    return b;
  }
  return null;
}

Array.prototype.augmentAll2d = function(bs) {
  var a = this;
  for (var i = 0; i < bs.length; i++) {
    a = a.augment2d(bs[i]);
    if (a == null) return null;
  }
  return a;
}

Array.prototype.forall = function(p) {
  for (var i = 0; i < this.length; i++)
    if (!p(this[i]))
      return false;
  return true;
};

Array.prototype.forall2d = function(p) {
  return this.forall(function(a){ return a.forall(p); });
};

Array.prototype.exists = function(p) {
  for (var i = 0; i < this.length; i++)
    if (p(this[i]))
      return true;
  return false;
};

Array.prototype.exists2d = function(p) {
  return this.exists(function(a){ return a.exists(p); });
};

// Take the n-fold product of the array. Returns a 2-dimensional
// array; each subarray is an n-tuple of elements from
// the original array.
Array.prototype.exp = function(n) {
  n = Math.max(0,Math.floor(n));

  if (n == 0)
    return [];
  else if (n == 1)
    return this.map(function(x){ return [x]; });
  else {
    var ps = this.exp(n-1);
    var rs = [];
    for (var i = 0; i < ps.length; i++)
      for (var j = 0; j < this.length; j++)
        rs.push(ps[i].concat([this[j]]));
    return rs;
  }
}

Array.prototype.chooseAtMost = function(n) {
  var a = [];
  for (var i = 1; i <= n; i++)
    a = a.concat(this.exp(i));
  return a;
}

// Returns an array consisting of the columns of a
// two-dimensional array.
Array.prototype.columns = function() {
  var d = this.dimensions();
  if (d == null)
    return null;
  else {
    var cols = [];
    for (var i = 0; i < d.cols; i++) {
      cols.push([]);
      for (var j = 0; j < d.rows; j++)
        cols[i].push(this[j][i]);
    }
    return cols;
  }
}

Array.prototype.hasSameDimensions2d = function(a) {
  var d1 = this.dimensions(), d2 = a.dimensions();
  return d1.cols == d2.cols && d1.rows == d2.rows;
};

Array.prototype.componentwiseBinaryOp2d = function(f,a) {
  var d1 = this.dimensions(), d2 = a.dimensions();
  if (d1.cols == d2.cols && d1.rows == d2.rows) {
    var r = [];
    for (var i = 0; i < d1.rows; i++) {
      var row = [];
      for (var j = 0; j < d1.cols; j++)
        row.push(f(this[i][j], a[i][j]));
      r.push(row);
    }
    return r;
  } else
    return null;
};

Array.prototype.intersperse = function(x) {
  var a = [];
  for (var i = 0; i < this.length; i++) {
    a.push(this[i]);
    if (i+1 < this.length)
      a.push(x);
  }
  return a;
}

// Returns a copy of a flat array of all the elements in
// an array of arrays.
Array.prototype.flatten = function() {
  var a = [];
  for (var i = 0; i < this.length; i++)
    a = a.concat(this[i]);
  return a;
}

// Returns a copy of a flat array of all the elements in
// an arbitrarily deeply nested array of arrays of arrays etc.
Array.prototype.flattenNd = function() {
  var a = [];
  for (var i = 0; i < this.length; i++)
    a = a.concat((this[i].isArray) ? this[i].flattenNd() : [this[i]]);
  return a;
}

// Returns a copy of a flat array of all the elements in
// an arbitrarily deeply nested array of arrays of arrays etc.
Array.prototype.flattenNd = function() {
  var a = [];
  for (var i = 0; i < this.length; i++)
    a = a.concat((this[i].isArray) ? this[i].flattenNd() : [this[i]]);
  return a;
}

// Recursive equality of nested arrays, with optional
// equality function for non-array entries (otherwise,
// reference equality is used). Order must match.
Array.prototype.eq = function(a, eq) {
  if (a.length != this.length)
    return false;

  for (var i = 0; i < this.length; i++) {
    if (this[i].isArray && a[i].isArray) {
      if (!this[i].eq(a[i], eq))
        return false;
    } else {
      if (eq != null && !eq(this[i], a[i]))
        return false;
      if (eq == null && this[i] != a[i])
        return false;
    }
  }
  return true;
}

//eof
