/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/Math.js
//   Various mathematical utilities.
//

Math.isInteger = function(n) { return Math.floor(n)==n;}
Math.isNatural = function(n) { return (n >= 0 && num_isInteger(n));}
Math.precision = function(n){
  //if (n < 1e-10) return 0;
  if (Math.abs(Math.ceil(n) - n) < 1e-8) return Math.ceil(n);
  if (Math.abs(Math.floor(n) - n) < 1e-8) return Math.floor(n);
  return n;
}

Math.rref = function(m) {
  var dims = m.dimensions();
  var rows = dims.rows, cols = dims.cols;
  m = m.copy2d();

  var lead = 0;
  for (var r = 0; r < rows; r++) {
    if (cols <= lead)
      return m;

    var i = r;
    while (Math.abs(m[i][lead]) < 1e-8) { // ==0
      i++;
      if (rows == i) {
        i = r;
        lead++;
        if (cols == lead)
          return m;
      }
    }
 
    var tmp = m[i];
    m[i] = m[r];
    m[r] = tmp;
 
    var val = m[r][lead];
    for (var j = 0; j < cols; j++)
      m[r][j] /= val;
 
    for (var i = 0; i < rows; i++) {
      if (i == r)
        continue;
      val = m[i][lead];
      for (var j = 0; j < cols; j++) {
        m[i][j] -= val * m[r][j];
      }
    }
    lead++;
  }
  return m;
};

//eof
