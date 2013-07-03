/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// interface/WidgetPanel.js
//   Object for representing and rendering a simple table that holds
//   some HTML content.
//
// Dependencies:
//   [jQuery 1.7+]
//

Include.include('utilities/UUID.js');
Include.include('utilities/String.js');


function WidgetPanel(args) {
  if (args == null)
    return '<div style="background-color:#FFFFFF; padding:4px 8px 4px 8px;"></div>';

  var id, containerId, html;
  if (args.isString)
    html = args;
  else {
    id = args.id;
    containerId = args.containerId;
    html = args.content; 
  }

  html = '<div style="background-color:#FFFFFF; padding:4px 8px 4px 8px;">'+html+'</div>';

  // If no container element is specified, return the raw HTML.
  if (containerId != null && containerId != undefined && containerId != '' && document.getElementById(containerId) != null)
    document.getElementById(containerId).innerHTML = html;
  else
    return html;
}

//eof
