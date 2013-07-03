/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/StaggeredIterator.js
//   Functions for performing staggered evaluation implemented
//   using a continuation-passing style and the JavaScript timing
//   functions; includes support for grouping operations into
//   staggered chunks, performing hooks at each step and batch step,
//   and control of the iterator via a reference to a flag.
//

function StaggeredIterator(interval, batch, kontinue, step_actions, batch_actions, flag_obj) {
  // The amount of time to wait before proceeding after a
  // step or batch.
  this.interval = (interval != null && interval > 0) ? interval : 1;
  
  // The number of continuations to process before waiting
  // for an interval (specified above).
  this.batch = (batch != null && batch > 0) ? batch : 1;
  
  // Counter to keep track of progress through the current
  // batch.
  this.counter = 0;
  
  // The first continuation to evaluate.
  this.first = kontinue;
  
  // Procedure to execute every time a step is made
  // (including the last step in a batch).
  this.step_actions = step_actions;
  
  // Procedure to execute only every time a batch is finished.
  this.batch_actions = batch_actions;
  
  // Reference to a flag; processing will only continue
  // as long as the value of "this.flag_obj.status" is "true"
  // (or the reference "flag_obj" is "null").
  this.flag_obj = flag_obj;
}

StaggeredIterator.prototype = {
  start: function () { this.iterate(this.first); },
  iterate:
    function(kontinue) {
      var self = this;

      self.counter++; // Progress through batch.

      var kontinue = kontinue(); // Generate the next continuation.

      if (kontinue != null && kontinue != undefined && (self.flag_obj == null || self.flag_obj.status == true)) {
        if (self.counter > self.batch) {
          // Take user-specified actions.
          if (self.step_actions != null)
            self.step_actions();
          if (self.batch_actions != null)
            self.batch_actions();
          
          // Reset the counter.
          self.counter = 0;
          
          // Continue after the specified interval.
          setTimeout(function() { self.iterate(kontinue); }, self.interval);
        } else {
          // Take user-specified actions.
          if (self.step_actions != null)
            self.step_actions();

          // Continue immediately.
          self.iterate(kontinue);
        }
      }
    },
  // Allow a caller to create and start without storing an object.
  anonymousStart: 
    function(interval, batch, kontinue, step_actions, batch_actions, flag_obj) {
      var si = new StaggeredIterator(interval, batch, kontinue, step_actions, batch_actions, flag_obj);
      si.start();
    }
};

//eof
