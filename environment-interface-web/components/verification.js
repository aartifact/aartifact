/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// components/verification.js
//   Wrapper verification object for expressions; to be extended
//   by other modules that add their own hooks corresponding to
//   specific kinds of verification.
//
//   The verification results are added directly to the abstract
//   syntax tree. An expression that has been verified has an abstract
//   syntax tree node that has been extended with a "verification"
//   field.
//
//   Each module defining verification hooks should create a distinct
//   namespace for its own verification results.
//
// Dependencies:
//   [jQuery 1.7+]
//

Include.include('utilities/Error.js');
Include.include('utilities/Environment.js');
Include.include('utilities/Context.js');
Include.include('utilities/EquivalenceClasses.js');

Include.include('aartifact.js');


aartifact.verification = {
  hooks: [],
  VerifiablyTrue: 'VerifiablyTrue',
  VerifiablyFalse: 'VerifiablyFalse',
  Unverifiable: 'Unverifiable',
  verify:
    function(context, e) {
      // Verification is staggered to prevent the browser from
      // hanging.
      this.verify_step([[context,e]]);
    },
  verify_step:
    function(continuations) {

      V = this;
      var E = aartifact.expression.constructors;

      if (continuations.length == 0)
        return;

      var context = continuations[0][0], e = continuations[0][1];
      continuations = continuations.slice(1);

      // Extend the abstract syntax tree with the verification
      // field.
      if (e.verification == null)
        e.verification = {};

      // Call every verification hook.
      for (var i = 0; i < V.hooks.length; i++) {
        var r = V.hooks[i](V, context, e);
        if (r != null) {
          continuations = r.concat(continuations);
          break;
        }
      }

      // Check for contradictions.
      if (e.has_unbound != true && e.evaluation != null && e.evaluation.value != null) {
        if (e.evaluation.value.is(E.True()))
          e.verification = (e.verification == V.VerifiablyFalse) ? V.Contradictory : V.VerifiablyTrue;
        else if (e.evaluation.value.is(E.False()))
          e.verification = (e.verification == V.VerifiablyTrue) ? V.Contradictory : V.VerifiablyFalse;
      }

      // Make updates to the document.
      if (e.analysis.formulaid != null) {
        if (e.is_premise == true) {
          if (e.has_unbound != true) {
            $('#f'+e.analysis.formulaid).addClass('premise');
          } else {
            e.verification = V.Unverifiable;
            $('#f'+e.analysis.formulaid).addClass('unverifiable');
          }
        } else {
          if (e.verification == V.VerifiablyTrue)  $('#f'+e.analysis.formulaid).addClass('verifiablytrue');
          if (e.verification == V.VerifiablyFalse) $('#f'+e.analysis.formulaid).addClass('verifiablyfalse');
          if (e.verification == V.Unverifiable)    $('#f'+e.analysis.formulaid).addClass('unverifiable');
          if (e.verification == V.Contradictory)   $('#f'+e.analysis.formulaid).addClass('contradictory');
        }
      }
    
      // Verification is staggered to prevent the browser from hanging.      
      setTimeout(function() { aartifact.verification.verify_step(continuations); }, 50); 
    }
};

//eof
