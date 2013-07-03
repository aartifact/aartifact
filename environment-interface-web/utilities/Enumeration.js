/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/Enumeration.js
//   Representation of staggered enumeration computation with
//   additional hooks (e.g., for controlling and displaying the
//   progress and results of the enumeration process).
//
//   The constructors for building enumerations constitute a simple
//   programming language.
//

Include.include('utilities/Array.js');


function Enumeration(con, dat) {
  this.root = false;
  this.con = con;
  this.dat = dat;
  this.hook = null;
  this.batch = null;
  this.interval = null;

  this.index = 0;
  if (con == 'Range') this.terminal = dat[1] - dat[0];
  if (con == 'Array') this.terminal = dat.length;
  if (con == 'Sequence') this.terminal = dat.map(function(e){return e.terminal;}).sum();
  if (con == 'Product') this.terminal = dat.map(function(e){return e.terminal;}).prod();
  if (con == 'Map') this.terminal = dat[1].terminal;
  if (con == 'Loop') this.terminal = dat[2].terminal * dat[0]; //Math.pow(dat[2].terminal, dat[0] /* constant */);
  
  this.list = [];
  this.stored = false;
  this.paused = false;
  this.last = null;
}

Enumeration.prototype = {
  isEnumeration: true,
  
  // Constructors.
  Range: function(x,y){ return new Enumeration('Range', [x,y]); },
  Array: function(a){ return new Enumeration('Array', a); },
  Sequence: function(es){ return new Enumeration('Sequence', es); },
  Product: function(es){ return new Enumeration('Product', es); },
  Map: function(f,e){ return new Enumeration('Map', [f,e]); },
  Exponent: 
    function(n, en) {
      var EN = Enumeration.prototype;
      var es = []; for (var i = 0; i < n; i++) es.push(en.copy());
      return EN.Product(es);
    },
  ChooseAtMost: 
    function(n, es) {
      var EN = Enumeration.prototype;
      var ess = []; for (var i = 1; i <= n; i++) ess.push(EN.Exp(i, es));
      return EN.Seq(ess);
    },
  Loop: 
    function(c /* multiplier of base case iterations */, a /* initial array */, f){ 
      return new Enumeration('Loop', [c,f,f(a)]);
    }
};

// Synonyms for constructors.
Enumeration.prototype.Prod = Enumeration.prototype.Product;
Enumeration.prototype.Seq = Enumeration.prototype.Sequence;
Enumeration.prototype.Exp = Enumeration.prototype.Exponent;
Enumeration.prototype.ChooseExactly = Enumeration.prototype.Exponent;

Enumeration.prototype.copy = function() {
  var en = new Enumeration(this.con, this.dat);

  if (this.con == 'Sequence' || this.con == 'Product')
    en.dat = this.dat.map(function(en){return en.copy();});
  else if (this.con == 'Map')
    en.dat = [this.dat[0] /* function */, this.dat[1].copy()];
  else
    en.dat = this.dat;
  
  en.root = this.root;
  en.hook = this.hook;
  en.batch = this.batch;
  en.interval = this.interval;

  return en;
}

Enumeration.prototype.completed = function() { return this.index >= this.terminal; }
Enumeration.prototype.percentage = function() { return Math.floor((this.index * 100.0) / this.terminal); }
Enumeration.prototype.pause = function() { this.paused = true; };
Enumeration.prototype.resume = function() { this.paused = false; this.advance(); };
Enumeration.prototype.reset = function() {
  this.index = 0;
  this.last = null;
  if (this.con == 'Sequence') this.dat.map(function(e){e.reset();});
  if (this.con == 'Product') this.dat.map(function(e){e.reset();});
  if (this.con == 'Map') this.dat[1].reset();
  if (this.con == 'Loop') this.dat[2].reset();
}

Enumeration.prototype.enumerate = function(hook, batch, interval) {
  this.index = 0;
  this.hook = hook;
  this.root = true;
  this.batch = (batch != null) ? batch : 1;
  this.interval = (interval != null) ? interval : 1;
  setTimeout(this.advance(), this.interval);
}

Enumeration.prototype.advance = function() {
  var EN = Enumeration.prototype;

  // If this sequence has already been computed once, we do not
  // do so again; instead, we use the stored result (an array)
  // and cycle through it.
  if (!this.root && this.stored) {  
    if (this.index < this.terminal) {
      this.last = this.list[this.index];
      this.index++;
    }
    return;
  }

  // Handle each possible construct. Subsequences are advanced
  // recursively.
  if (this.con == 'Range') {
    if (this.index <= this.terminal) {
      this.last = this.dat[0] + this.index;
      this.list.push(this.last);
      this.index++;
    }
  }
  
  if (this.con == 'Array') {
    if (this.index < this.terminal) {
      this.last = this.dat[this.index];
      this.list.push(this.last);
      this.index++;
    }
  }

  if (this.con == 'Loop') {
    if (this.index < this.terminal) {
      if (this.dat[2].completed()) {
        this.dat[2] = this.dat[1](this.list.copy());
        this.dat[2].advance();
      } else {
        this.dat[2].advance();
      }

      this.last = this.dat[2].last;
      this.list.push(this.last);
      this.index++;
    }
  }

  if (this.con == 'Map') {
    if (!this.dat[1].completed()) { // One child at a time.
      this.dat[1].advance();
      this.last = this.dat[0](this.dat[1].last); //Apply function.
      this.list.push(this.last);
      this.index++;
    }
  }

  if (this.con == 'Sequence') {
    for (var i = 0; i < this.dat.length; i++) {
      if (!this.dat[i].completed()) { // One child at a time.
        this.dat[i].advance();
        this.last = this.dat[i].last;
        this.list.push(this.last);
        this.index++;
        break;
      }
    }
  }
  
  if (this.con == 'Product') {
    if (this.dat.length > 0) {
      if (this.dat.forall(function(e){return e.completed();})) {
        // All complete; do nothing.
      } else if (this.dat.forall(function(e){return e.index == 0;})) {
        // We must advance all to the first entry.
        this.dat.map(function(e){e.advance();});
        this.last = this.dat.map(function(e){return e.last;});
        this.list.push(this.last);
        this.index++;
      } else {
        // We count up.
        for (var j = 0; j < this.dat.length; j++) {
          if (this.dat[j].completed()) {
            this.dat[j].reset();
            this.dat[j].advance();
          } else {
            this.dat[j].advance();
            break;
          }
        }

        this.last = this.dat.map(function(e){return e.last;});
        this.list.push(this.last);
        this.index++;
      }
    }
  }
  
  self = this;
  if (!this.paused && this.root) {
    if (this.hook != null) this.hook(this);
    if (!this.completed()) {
      if (this.index % this.batch == 0)
        setTimeout(function(){self.advance();}, this.interval);
      else
        self.advance();
    }
  }
  
  if (this.completed())
    this.stored = true;
}

// eof
