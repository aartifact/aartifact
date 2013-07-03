/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// aartifact.js
//   Wrapper object (and namespace) for the functionalities provided 
//   by the system.
//
// Dependencies:
//   [jQuery 1.7+]
//

Include.include('utilities/Array.js');


// The main aartifact object and namespace. This object contains
// three built-in fields ("modules", "module", "regimes", and "regime");
// each additional field corresponds to a component.
var aartifact = {
  modules: [],
  module:
    // Function for adding a module. A module consists
    // of a hook for one or more components. Hooks specified in a
    // module for a certain component are only added if that
    // component exists.
    function (m) {
      // Reference equality, unless modules have their 
      // own equality functions.
      if (!this.modules.contains(m)) {
        this.modules.push(m);
        for (component in m)
          if (component in this)
            this[component].hooks.push(m[component]);
      }
    },
  regimes: [],
  regime:
    // Function for adding a regime. A regime consists of a
    // configuration that includes interface layout and functionality
    // and a selection of modules.
    function (r) {
      // Reference equality, unless regimes have their 
      // own equality functions.
      if (!this.regimes.contains(r)) { 
        this.regimes.push(r);
      }
    }
};

//eof
