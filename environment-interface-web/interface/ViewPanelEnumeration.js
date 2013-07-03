/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// interface/ViewPanelEnumeration.js
//   Object for representing and updating an HTML panel with
//   controls and output (a ViewListTable) dealing with an
//   Enumeration object.
//
// Dependencies:
//   [jQuery 1.7+]
//

Include.include('utilities/UUID.js');


function ViewPanelEnumeration(enumeration, present) {
  this.id = UUID();
  this.enumeration = enumeration;
  this.present = present;
  this.viewlisttable = new ViewListTable('vpe_'+this.id+'_results', present);
}

ViewPanelEnumeration.prototype.enumerate = function() {
  $('#vpe_'+this.id+'_dash').data("enumeration", this.enumeration);

  var self_vpe = this;
  this.enumeration.enumerate(
    function(en){
      $('#vpe_'+self_vpe.id+'_progress').width(en.percentage()+'%');
      $('#vpe_'+self_vpe.id+'_progress').html('&nbsp;'+en.index+' / '+en.terminal);
      var cs = en.last;
      if (cs != null)
        self_vpe.viewlisttable.append(cs);
    },
    100);
}

ViewPanelEnumeration.prototype.initialize = function() {
  $('vpe_'+this.id+'_dash').data("enumeration", this.enumeration);
};

ViewPanelEnumeration.prototype.pause = function(id) {
  var enumeration = $('#vpe_'+id+'_dash').data("enumeration");
  if (!enumeration.paused) {
    enumeration.pause();
    $('#vpe_'+id+'_progress_button').html("resume");
  } else {
    enumeration.resume();
    $('#vpe_'+id+'_progress_button').html("pause")
  }
};

ViewPanelEnumeration.prototype.pause = function(id) {
  var enumeration = $('#vpe_'+id+'_dash').data("enumeration");
  if (!enumeration.paused) {
    enumeration.pause();
    $('#vpe_'+id+'_progress_button').html("resume");
  } else {
    enumeration.resume();
    $('#vpe_'+id+'_progress_button').html("pause")
  }
};

ViewPanelEnumeration.prototype.filter = function(id, s) {
  var e = aartifact.parseExpFromStr(s);

  $('.vpe_'+id+'_results').each(function(elem){
    var item = $(this).data("ViewListTable_item");
    if (e != null && !item.contains(e))
      $(this).hide();
    else
      $(this).show();
  });
};

ViewPanelEnumeration.prototype.html = function() {
  var filt_kp_js = 'ViewPanelEnumeration.prototype.filter(\''+this.id+'\', this.value);';
  return ''
    + '<div id="vpe_'+this.id+'_dash">'
      + '<div class="widget_filter">'
        + '<div class="widget_filter_label">filter:</div>'
        + '<input type="text" class="widget_filter_input" id="vpe_'+this.id+'_filter"'
          + 'onkeyup="'+filt_kp_js+'" onkeypress="'+filt_kp_js+'"'
        + '/>'
      + '</div>'
      + '<div class="widget_progress"><div id="vpe_'+this.id+'_progress" class="widget_progress_bar">&nbsp;</div></div>'
      + '<div class="widget_button" id="vpe_'+this.id+'_progress_button" onclick="ViewPanelEnumeration.prototype.pause(\''+this.id+'\');">pause</div>'
    + '</div>'
    + '<div id="vpe_'+this.id+'_results"></div>';
};

//eof
