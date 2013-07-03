/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// interface/WidgetFilterableListTable.js
//   Object for representing and rendering a table that allows for
//   filtering of entries and for staggered dynamic insertion of new
//   entries.
//
// Dependencies:
//   [jQuery 1.7+]
//

Include.include('utilities/UUID.js');


function WidgetFilterableListTable(args) {
  var uniqid = (args.id == null) ? UUID() : args.id;
  var containerId = args.containerId;
  var items = args.items;
  var empty_content = args.default;
  var filtering = (args.filtering == true);
  var global_class = args.itemClass;

  global_class = (global_class != null) ? ' '+global_class+' ' : ' ';

  if (items.length == 0)
    return (empty_content!=null) ? '<div class="panel_table_item_0">'+empty_content+'</div>' : '';

  var html = '';
  if (filtering)
    html += '<div class="panel_table_filter_panel">'
            + '<div class="widget_filter_label">filter:</div>'
            + '<input type="text" class="panel_table_filter_panel_input"'
              + 'onkeyup="WidgetFilterableListTable.prototype.filter(this,\''+uniqid+'\');" '
              + 'onkeypress="WidgetFilterableListTable.prototype.filter(this,\''+uniqid+'\');"/>'
          + '</div>';

  for (var i = 0; i < items.length; i++) {
    var ids = 'panel_table_'+uniqid+'_item_'+i;
    if (items[i].isString) {
      html += '<div id="'+ids+'" class="'+global_class+' panel_table_'+uniqid+'_item panel_table_item_'+(i%2)+'">'+items[i]+'</div>';
    } else {
      html += '<div id="'+ids+'" class="'+global_class+' panel_table_'+uniqid+'_item panel_table_item_'+(i%2)+'">'
            + items[i].content+'<div name="keywords" id="'+ids+'_keywords" style="display:none;">'+items[i].keywords.join(' ')+'</div>'
            + '</div>';
    }
  }

  // If no container element is specified, return the raw HTML.
  if (containerId != null && containerId != undefined && containerId != '' && document.getElementById(containerId) != null)
    document.getElementById(containerId).innerHTML = html;
  else
    return html;
}

WidgetFilterableListTable.prototype.filter = function(inp, uniqid) {
  $('.panel_table_'+uniqid+'_item').each(function(){
    var id = $(this).attr("id");
    if (inp.value == '')
      $(this).css("display", "block");
    if ($('#'+id+'_keywords').html().indexOf(inp.value) == -1)
      $(this).css("display", "none");
  });
}

WidgetFilterableListTable.prototype.filter_global = function(inp, cls) {
  $('.'+cls).each(function(){
    var id = $(this).attr("id");
    if (inp.value == '')
      $(this).css("display", "block");
    
    var ks = inp.value.split(' ');
    var ks_item = $('#'+id+'_keywords').html().split(' ');
    for (var i = 0; i < ks.length; i++)
      //if (!ks_item.countains(ks[i], function(s1,s2){ return s1==s2;}))
      if ($('#'+id+'_keywords').html().indexOf(ks[i]) == -1)
        $(this).css("display", "none");
  });
}

//eof
