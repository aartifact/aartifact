/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/Map.js
//   Representation of finite maps (arrays of pairs).
//

Include.include('utilities/Array.js');


function Map() {
  
}

Map.prototype.isMap = true;

Map.prototype.domain = function() {
  return this.map(function(p){ return p[0]; });
}

Map.prototype.range = function() {
  return this.map(function(p){ return p[1]; });
}

//eof
