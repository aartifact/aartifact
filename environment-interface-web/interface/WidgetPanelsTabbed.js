/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// interface/WidgetPanelsTabbed.js
//   Object for representing and rendering a tabbed set of stacked
//   HTML panels. Supports normal and one-time-only click handlers
//   (i.e., caching of modifications made by click handler).
//
// Dependencies:
//   [jQuery 1.7+]
//

Include.include('utilities/UUID.js');


function WidgetPanelsTabbed(args) {
  var elementId = args.containerId;
  var names_to_panels = args.content;

  var element = $('#'+elementId);
  if (element == null || element.length == 0)
    return;

  this.id = UUID();
  this.elementId = elementId;
  $('#'+elementId).data("ViewPanelTabbed", this);
  this.panels = names_to_panels;
  
  var html_tabs = '', html_panels = '';
  for (name in this.panels) {
    html_panels += '<div id="'+this.panels[name].id+'" class="panel_out" style="display:none;"></div>';
    html_tabs += '<div id="ViewPanelsTabbedTab_'+this.id+'_'+name+'" class="panel_out_menu_tabbed_tab" '
          + 'onclick="$(\'#'+elementId+'\').data(\'ViewPanelTabbed\').click(\''+name+'\');">'+name+'</div>';
  }

  $('#'+elementId).html(html_tabs + html_panels);
}

WidgetPanelsTabbed.prototype.click = function(name) {
  for (name_tab in this.panels) {
    var panel = this.panels[name_tab];
    ge("ViewPanelsTabbedTab_"+this.id+"_"+name_tab).className = (name_tab == name) ? "panel_out_menu_tabbed_tab_selected" : "panel_out_menu_tabbed_tab";
    ge(panel.id).style.display = (name_tab == name) ? "block" : "none";

    // Only run click handler once if caching is enabled for this tab.
    if (name_tab == name && (!panel.cache || panel.clicked != true)) {
      panel.click();
      panel.clicked = true;
    }
  }
};

//eof
