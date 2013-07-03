/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/String.js
//   Representation and manipulation of strings.
//

String.prototype.isString = true;

String.prototype.ltrim = function() {
  return this.replace(/^\s+/,"");
};

String.prototype.trim = function() {
  return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

String.prototype.countLeadingSpaces = function() {
  var a = this.match(/^\s*/);
  if (a != null && a.length > 0 && a[0].isString)
    return a[0].length;
}

//eof
