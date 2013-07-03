/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// components/equality.js
//   Wrapper equality object for expressions; to be extended
//   by other modules that add their own hooks corresponding to
//   specific kinds of equality.
//

Include.include('utilities/Error.js');
Include.include('utilities/EquivalenceClasses.js');

Include.include('aartifact.js');


aartifact.library = {
  hooks: [],
  propositions_user: [],
  propositions: []
};

//eof
