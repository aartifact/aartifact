/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// interface/ViewListTable.js
//   Object for representing and updating an HTML one-column table.
//   Support for keyword-based filtering included.
//
// Dependencies:
//   [jQuery 1.7+]
//

function ViewListTable(id, html) {
  this.id = id;
  this.array = [];
  this.html = html;
}

ViewListTable.prototype.append = function (items) {
  if (!items.isArray)
    items = [items];

  for (var i = 0; i < items.length; i++) {
    var index = this.array.length;
    this.array.push(items[i]);
    var d = document.createElement("div");
    d.innerHTML = this.html(items[i]).html;
    d.className = 'panel_table_item_'+(index%2);
    $(d).addClass(this.id);
    $(d).data("ViewListTable_item", items[i]);
    document.getElementById(this.id).appendChild(d);
  }
};

// This behaves like append, but does not add duplicates.
ViewListTable.prototype.include = function (items, eq) {
  if (!items.isArray)
    items = [items];

  for (var i = 0; i < items.length; i++) {
    if (!this.array.contains(items[i], eq)) {
      var index = this.array.length;
      this.array.push(items[i]);
      var d = document.createElement("div");
      d.innerHTML = this.html(items[i]).html;
      d.className = 'panel_table_item_'+(index%2);
      $(d).addClass(this.id);
      $(d).data("ViewListTable_item", i);
      document.getElementById(this.id).appendChild(d);
    }
  }
};



//eof
