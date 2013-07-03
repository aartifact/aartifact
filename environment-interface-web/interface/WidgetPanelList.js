/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// interface/WidgetPanelList.js
//   Object for representing and rendering a list of panels.
//
// Dependencies:
//   [jQuery 1.7+]
//

Include.include('utilities/UUID.js');


function WidgetPanelList(args) {
  this.id = args.id == null ? UUID() : args.id;
  this.containerId = args.containerId;
  this.panels = [];

  var html = '<div id="'+this.id+'"></div>';

  // If no container element is specified, return the raw HTML.
  if (this.containerId != null && this.containerId != undefined && this.containerId != '' && document.getElementById(this.containerId) != null) {
    document.getElementById(this.containerId).innerHTML = html;
    $('#'+this.id).data("WidgetPanelList", this);
  } else
    return html;
}

WidgetPanelList.prototype.addPanel = function(html) {
  var ix = this.panels.length;
  this.panels.push(html);
  $('#'+this.id).html($('#'+this.id).html()+'<div id="'+this.id+'_'+ix+'" class="info_panel_row_'+(ix%2)+'">'+html+'</div>');
}

WidgetPanelList.prototype.lastPanelHTML = function(html) {
  $('#'+this.id+'_'+(this.panels.length-1)).html(html);
}

//eof
