/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// interface/WidgetTextAreaResizable.js
//   A resizable textarea HTML element.
//
// Dependencies:
//   [jQuery 1.7+]
//

function WidgetTextAreaResizable(args) {
  this.id = args.id;
  this.containerId = args.containerId;

  // Create the element if none exists.
  if (document.getElementById(this.id) == null)
    document.getElementById(this.containerId).innerHTML = 
        '<textarea id="'+this.id+'" rows="20"'
      + ' onkeydown="$(\'#'+this.id+'\').data(\'WidgetTextAreaResizable\').fit();"'
      + ' onkeypress="$(\'#'+this.id+'\').data(\'WidgetTextAreaResizable\').fit();"'
      + ' onkeyup="$(\'#'+this.id+'\').data(\'WidgetTextAreaResizable\').fit();"'
      + ' onclick="$(\'#'+this.id+'\').data(\'WidgetTextAreaResizable\').fit();"'
      + ' onblur="$(\'#'+this.id+'\').data(\'WidgetTextAreaResizable\').fit();"'
      + ' onfocus="$(\'#'+this.id+'\').data(\'WidgetTextAreaResizable\').fit();"'
      + '>'
      + '</textarea>';

  this.element = document.getElementById(this.id);
  $('#'+this.id).data("WidgetTextAreaResizable", this);
}

WidgetTextAreaResizable.prototype.fit = function(id) {
  var elem = (id == null) ? this.element : document.getElementById(id);
  var lines = elem.value.split("\n");
  var rows = 0;
  for (var i = 0; i < lines.length; i++)
    rows += 1; //Math.floor(lines[i].length / this.element.cols);
  elem.rows = Math.max(20, rows+2);
};

//eof
