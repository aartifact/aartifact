/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// interface/WidgetPanelsTabbedCollapsible.js
//   Code for creating a HTML/JavaScript tabbed panel that has a set
//   of collapsible sub-panals.
//

Include.include('utilities/UUID.js');


function WidgetPanelsTabbedCollapsible(args) {
  var uniqid = (args.id == null) ? UUID() : args.id;
  var containerId = args.containerId;
  var label_to_content = args.content;
  var clickhook_str = args.clickHandlerString;

  if (clickhook_str == null)
    clickhook_str = '';

  var html = '';
  var labels = [];
  var labels_array_str = [];

  for (var label in label_to_content) {
    labels.push(label);
    labels_array_str.push("'"+label+"'");
  }
  labels_array_str = '['+labels_array_str.join(',')+']';

  var cls = 'menu_tabbed_tab_selected';

  for (var i = 0; i < labels.length; i++) {
    var ids = 'panel_tabbed_'+uniqid+'_'+labels[i];
    html += '<div id="'+(ids+'_tab')+'" class="'+cls+'" onclick="WidgetPanelsTabbedCollapsible.prototype.click(\''+uniqid+'\', '+labels_array_str+', '+i+'); '+clickhook_str+';">'+labels[i]+' <div id="'+ids+'_expand" style="display:none"><img src="images/panel_tabbed_expand.gif"/></div></div>';
    cls = 'menu_tabbed_tab';
  }

  var display = 'block';
  for (var i = 0; i < labels.length; i++) {
    var ids = 'panel_tabbed_'+uniqid+'_'+labels[i];
    html += '<div id="'+ids+'" style="padding:4px; display:'+display+';" class="menu_tabbed_content">'+label_to_content[labels[i]]+'</div>';
    html += '<div id="'+ids+'_collapsed" style="padding:4px; display:none;" class="menu_tabbed_content"></div>';
    display = 'none';
  }

  html = '<div>'+html+'</div>';

  // If no container element is specified, return the raw HTML.
  if (containerId != null && containerId != undefined && containerId != '' && document.getElementById(containerId) != null)
    document.getElementById(containerId).innerHTML = html;
  else
    return html;
}

WidgetPanelsTabbedCollapsible.prototype.click = function(uniqid, labels, tab, clickhook) {
  function ge(id) { return document.getElementById(id); }

  for (var i = 0; i < labels.length; i++) {
  
    var ids = 'panel_tabbed_'+uniqid+'_'+labels[i];
    if (i == tab) {
      if ( ge(ids+'_tab').className != 'menu_tabbed_tab_selected') {
        ge(ids+'_tab').className = 'menu_tabbed_tab_selected';
        ge(ids).style.display = 'block';
        ge(ids+'_expand').style.display = 'none';
        ge(ids+'_collapsed').style.display = 'none';
      } else { // already selected, collapse or expand
        ge(ids+'_collapsed').style.display = ge(ids).style.display == 'block' ? 'block' : 'none';
        ge(ids+'_expand').style.display = ge(ids).style.display == 'block' ? 'inline-block' : 'none';
        ge(ids).style.display = ge(ids).style.display != 'block' ? 'block' : 'none';
      }
    } else {
      ge(ids+'_tab').className = 'menu_tabbed_tab';
      ge(ids).style.display = 'none';
    }
  }
}

//eof
