/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/Include.js
//   Facility for including JavaScript files.
//
//   You cannot currently use the "Include.include()" and
//   "Include.includes()" functions to load JavaScript files while
//   testing on your local file system using Google Chrome. Google
//   Chrome treats any access to a different file in the file system
//   as a cross-domain request.
//
// Dependencies:
//   [jQuery 1.7+]
//   [head.js 0.96+]
//

var Include = {
  // In case this JavaScript file is loaded more than once,
  // recover its state.
  included: (Include != null && Include != undefined && Include.included != null && Include.included.length > 0) ? Include.included : [],

  // Include multiple JavaScript files (load and execute using external library [head.js]).
  includes: head.js,
  include: head.js,

  // Include a JavaScript file (load and execute using jQuery).
  include_deprecated:
    function(url, kontinue) {
      // Do not load and run a script if it has already been loaded.
      for (var i = 0; i < this.included.length; i++)
        if (this.included[i] == url)
          return;

      var self = this;
      //$.getScript(url, function(){ self.included.push(url); if (kontinue != null) kontinue(); });
    }
};

// eof
