/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/Error.js
//   Representation of a errors.
//


function Error(message) {
  this.message = message;
}

Error.prototype = {
  isError: true
};

// eof
