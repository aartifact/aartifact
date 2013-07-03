/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/Context.js
//   Representation of a logical context consisting of several
//   common components.
//

Include.include('utilities/Array.js');


function Context(environment, equivalenceclasses, premises) {
  this.environment = (environment!=null) ? environment.copy() : new Environment();
  this.equivalenceclasses = (equivalenceclasses!=null) ? equivalenceclasses.copy() : new EquivalenceClasses();
  this.premises = (premises!=null) ? premises.copy() : [];
}

Context.prototype = {
  copy: 
    function(){
      return new Context(this.environment, this.equivalenceclasses, this.premises);
    },
  premises_add:
    function(premises){
      var context = new Context(this.environment, this.equivalenceclasses, this.premises.concat(premises));

      var last_Eq = null;
      var last_premise = this.premises.last();
      if (last_premise != null && last_premise.con == 'Infix' && last_premise.operator == 'Eq')
        last_Eq = last_premise;

      for (var i = 0; i < premises.length; i++) {
        var e = premises[i];
        if (e.con == 'Infix' && e.operator == 'Eq') {
          if (last_Eq != null && e.dat[0].con == 'Constant' && e.dat[0].dat[0] == 'Placeholder') {
            context.equivalenceclasses = context.equivalenceclasses.extend(last_Eq.dat[1], e.dat[1]);
          } else if (e.dat[0].con != 'Constant' || e.dat[0].dat[0] != 'Placeholder') {
            context.equivalenceclasses = context.equivalenceclasses.extend(e.dat[0], e.dat[1]);
            
            if (e.dat[0].con == 'Matrix' && e.dat[1].con == 'Matrix') {
              var dims0 = e.dat[0].dat.dimensions();
              var dims1 = e.dat[1].dat.dimensions();
              
              if (dims0.cols == dims1.cols && dims0.rows == dims1.rows)
                for (var i = 0; i < e.dat[0].dat.length; i++)
                  for (var j = 0; j < e.dat[0].dat[i].length; j++)
                    context.equivalenceclasses = context.equivalenceclasses.extend(e.dat[0].dat[i][j], e.dat[1].dat[i][j]);
            }
          }
          last_Eq = e;
        }
      }

      return context;
    },
  environment_bind:
    function(n, v){
      return new Context(this.environment.bind(n,v), this.equivalenceclasses, this.premises.concat(premises));
    }
};

// eof
