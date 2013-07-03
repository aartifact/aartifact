/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// interface/WidgetTextFilter.js
//   A text input intended for filtering data.
//
// Dependencies:
//   [jQuery 1.7+]
//

function WidgetTextFilter(args) {
  var html = '<div class="panel_table_filter_panel">'
           + '<div style="display:inline; padding:5px;">filter:</div><input type="text" class="panel_table_filter_panel_input" '
           + 'onkeyup="'+args.keyboardHandler+'" '
           + 'onkeypress="'+args.keyboardHandler+'"/></div>';

  return html;
}

//eof
