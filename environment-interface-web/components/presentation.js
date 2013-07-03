/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// components/presentation.js
//   Wrapper presentation object for expressions; to be extended
//   by other modules that add their own hooks corresponding to
//   specific expression patterns.
//

Include.include('utilities/Error.js');
Include.include('utilities/UUID.js');

Include.include('aartifact.js');
Include.include('components/verification.js');


aartifact.presentation = {
  hooks: [],

  Indent: [{formatting: 'Indent'}],
  Unindent: [{formatting: 'Unindent'}],
  Newline: [{formatting: 'Newline'}],
  Space: [{formatting:'Atom', type:'Space', html:'&nbsp;'}],
  AtomFixed: function(h) { return [{formatting:'Atom', type:'Normal',html:h}]; },
  AtomPredWord: function(h) { return [{formatting:'Atom', type:'Normal',html:'<div style="text-decoration:underline;" class="vcenter">'+h+'</div>'}]; },
  Atom: function(h) { return [{formatting:'Atom', type:'Normal',html:'<div class="vcenter">'+h+'</div>'}]; },
  Left: function(h) { return [{formatting:'Atom', type:'Normal',html:'<div class="vcenter">'+h+'&nbsp;</div>'}]; },
  Right: function(h) { return [{formatting:'Atom', type:'Normal',html:'<div class="vcenter">&nbsp;'+h+'</div>'}]; },
  Mid: function(h) { return [{formatting:'Atom', type:'Normal',html:'<div class="vcenter">&nbsp;'+h+'&nbsp;</div>'}]; },
  AtomTop: function(h) { return [{formatting:'Atom', type:'Normal',html:'<div class="vtop">'+h+'</div>'}]; },
  Relation: function(h) { return [{formatting:'Atom', type:'Relation', html:'<div class="vcenter">'+h+'</div>'}]; },
  FormulaOp: function(h) { return [{formatting:'Atom', html:'<div class="vcenter formulaop">'+h+'</div>'}]; },
  Formatting: function(h) { return [{formatting:'Formatting', type:'Formatting', html:h}]; },
  OpInfix: function(f,e) { P=this; return P.Concat([P.present(f, e.dat[0]), P.Space, P.Atom(P.C(f, e.op)), P.Space, P.present(f, e.dat[1])]); },
  RelInfix: function(f,e) { P=this; return P.Concat([P.present(f, e.dat[0]), P.Space, P.Relation(P.C(f, e.op)), P.Space, P.present(f, e.dat[1])]); },
  Concat: function(cs) { return cs.flatten(); },
  ConcatSpaces: function(cs) { return cs.intersperse(this.Space).flatten(); },

  html:
    function(atoms) {
    
      function line_is_equation(line) {
        var count_relations = 0;
        for (var i = 0; i < line.atoms.length; i++)
          if (line.atoms[i].type == 'Relation')
            count_relations++;
        return (count_relations == 1);
      }
    
      // Gather the atoms in lines.
      var lines = [], line = {indent:null, atoms:[]}, indent = 0;
      for (var i = 0; i < atoms.length; i++) {
        // The first case is necessary for IE8 (why is it ever null?)
        if (atoms[i] == null) 
          continue;
        else if (atoms[i].formatting == 'Indent')
          indent += 15;
        else if (atoms[i].formatting == 'Unindent')
          indent -= 15;
        else if (atoms[i].formatting == 'Newline') {
          line.equation = line_is_equation(line);
          lines.push(line);
          line = {indent:null, atoms:[]};
        } else {
          if (line.indent == null)
            line.indent = indent;
          line.atoms.push(atoms[i]);
        }
      }
      line.equation = line_is_equation(line);
      lines.push(line);

      // Identify blocks of equations.
      var block_id = null, in_block = false, lines_with_equation_blocks = [];
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].equation) {
          in_block = true;
          if (i == 0 || !lines[i-1].equation) {
            block_id = UUID();
            lines_with_equation_blocks.push({equation_block:'start', block_id:block_id});
          }
        } else {
          if (in_block)
            lines_with_equation_blocks.push({equation_block:'end'});
          in_block = false;
          block_id = null;
        }
        //lines[i].equation_block = block_id;
        lines_with_equation_blocks.push(lines[i]);
      }
      if (in_block)
        lines_with_equation_blocks.push({equation_block:'end'});

      lines = lines_with_equation_blocks;

      var html = '';
      var block_id = null;
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].equation_block != null) {
          if (lines[i].equation_block == 'start') {
            html += '<div>';
            block_id = lines[i].block_id;
          }
          else if (lines[i].equation_block == 'end') {
            html += '</div>';
            block_id = null;
          }
        } else {
          var line_id = UUID();
          var equation_block_id_str = (block_id!=null)?'eqn_block_'+block_id+'_'+line_id:'';
          
          var id_str = equation_block_id_str;
          var cls_str = (equation_block_id_str!='')?'equation'+' '+'eqn_block_'+block_id:'';
        
          html += '<div id="'+id_str+'" class="'+cls_str+'"'
                   +' style="padding-top:2px; padding-bottom:2px; position:relative; padding-left:'+lines[i].indent+'px;">';
          for (var j = 0; j < lines[i].atoms.length; j++) {
            if (lines[i].atoms[j].type == 'Relation' && block_id != null)
              html += '<div id="'+equation_block_id_str+'_rel" class="relation vcenter eqn_block_rel_'+block_id+'">'+lines[i].atoms[j].html+'</div>';
            else
              html += lines[i].atoms[j].html;
          }
          html += '</div>';
        }
      }

      return html;
    },

  C: function(fmt, c) { return (aartifact.expression.present_constant(fmt,c)); },

  render_math_equations_html: function() {
    // This function should be called on any interface click.
  
    // Vertically center or align appropriate elements.
    $(".vcenter").each(function(){
      var ah = $(this).height(), ph = $(this).parent().height();
      if (ph > ah)
        $(this).css('top', 2 - Math.ceil((ph-ah)/2));
    });
    $(".vtop").each(function(){
      var ah = $(this).height(), ph = $(this).parent().height();
      $(this).css('top', 20-ph);
    });
   
    // Align any consecutive equations.
    var blocks = {};
    var block_ids = [];
    var block_max_rel = {};
    
    $(".equation").each(function(){
      var id = $(this).attr('id').split('_');
      var blockid = id[2];
      if (blocks[blockid] == null) {
        blocks[blockid] = [];
        block_ids.push(blockid);
      }
      blocks[blockid].push($(this).attr('id'));
    });

    for (var i = 0; i < block_ids.length; i++) {
      var block_id = block_ids[i];
      var eqn_ids = blocks[block_id];
      
      // Only if a block has more than one equation.
      if (eqn_ids.length >= 2) {
        var rel_left = 0;
        for (var j = 0; j < eqn_ids.length; j++) {
          $('#'+eqn_ids[j]).css('position', 'relative');
          rel_left = Math.max(rel_left, $('#'+eqn_ids[j]+'_rel').position().left);
        }
        for (var j = 0; j < eqn_ids.length; j++) {
          var shift = rel_left - $('#'+eqn_ids[j]+'_rel').position().left;
          $('#'+eqn_ids[j]).css('left', shift);
          $('#'+eqn_ids[j]).css('width', parseFloat($('#'+eqn_ids[j]).css('width')) - shift);
        }
      }
    }
  },

  formatted: function(fmt /*'html' or 'ascii'*/, e) { return this.html(this.present(fmt, e)); },
  present:
    function(fmt /*'html' or 'ascii'*/, e) {
      var P = this;
      var V = aartifact.verification;

      var r = null;

      // Handle wrapped expressions.
      var wrap = (e.wrapped == 'Parens') ? function(p){return P.Concat([P.Left('('), p, P.Right(')')]);} : function(p){return p;};

      if (e.con == 'Var') return (e.unbound) ? wrap(P.Atom('<span class="unbound">'+e.dat+'</span>')) : wrap(P.Atom(e.dat));

      // Call every presentation hook.
      for (var i = 0; i < this.hooks.length; i++) {
        r = this.hooks[i](this, fmt, e);
        if (r != null) break;
      }

      if (e.isError) return '<span style="color:firebrick; font-weight:bold;">an error has occurred</span>';

      // The default cases. Module hooks can preempt
      // and override these if necessary.

      if (e.is(E.Skip()))
        return P.Concat([P.Atom('skip')]);


      if (e.is(E.Send()))
        return P.Concat([
                 P.Atom('send'), P.present(fmt, e.dat[0]), P.Atom(':'), P.Newline,
                 P.Indent, P.present(fmt, e.dat[1]),
                 P.Unindent
               ]);


      if (e.isOp('And')) 
        return P.Concat([P.present(fmt, e.dat[0]), P.Space, P.FormulaOp(P.C(fmt, e.op)), P.Newline, P.present(fmt, e.dat[1])]);

      if (e.isOp(['Implies', 'Iff']))
        return P.Concat([
                 P.Indent, P.present(fmt, e.dat[0]), P.Unindent,
                 P.Newline, P.FormulaOp(P.C(fmt, e.op)), P.Newline,
                 P.Indent, P.present(fmt, e.dat[1]), P.Unindent
               ]);

      if (e.is(E.Forall()) || e.is(E.Exists())) {
        if (e.dat[1].con != 'Quantifier' && e.statement == true) {
          return P.Concat([
                   P.FormulaOp(P.C(fmt, e.op)), P.present(fmt, e.dat[0]), P.Atom(',&nbsp;'),
                   P.Newline, P.Indent, P.present(fmt, e.dat[1])
                 ]);
        } else {
          //return P.Concat([P.FormulaOp(P.C(fmt, e.op)), P.present(fmt, e.dat[0]), P.Atom(',&nbsp;'), P.present(fmt, e.dat[1])]);

          var l = [P.FormulaOp(P.C(fmt, e.op))], e_cur = e, q_cur = e.op;
          while (e_cur.con == 'Quantifier' && e_cur.op == q_cur) {
            l.pushAll([P.present(fmt, e_cur.dat[0]) /* ,P.Atom(',&nbsp;') */]);
            if (e_cur.statement == true && e_cur.dat[1].con != 'Quantifier')
              l.pushAll([P.Newline,P.Indent]);
            e_cur = e_cur.dat[1];
          }
          l.push(P.present(fmt, e_cur));
          return P.Concat(l);
        }
      }

      if (e.is(E.Matrix())) {
        var cls = (e.dat.dimensions().cols == 1) ? 'html_vector_entry' : 'html_matrix_entry';
        return P.Atom(
          '<table cellpadding="0" cellspacing="0"><tr><td class="html_matrix_lft">&nbsp;</td><td>'
        + '<table cellpadding="0" cellspacing="0" style="font-size:10px;">'
        + e.dat.map(function(r){return '<tr>'+r.map(function(e){return '<td class="'+cls+'">'+P.formatted(fmt, e)+'</td>';}).join('')+'</tr>';}).join('')
        + '</table>'
        +'</td><td class="html_matrix_rgt">&nbsp;</td></tr></table>'
          );
      }

      if (e.isOp('Norm')) {
        return P.Atom(
           '<table cellpadding="0" cellspacing="0"><tr><td class="html_norm_lft">&nbsp;</td><td class="html_norm_lft">&nbsp;</td><td>'
          +'<table cellpadding="0" cellspacing="0"><tr><td>'
          +P.formatted(fmt, e.dat[0])
          +'</td></tr></table>'
          +'</td><td class="html_norm_rgt">&nbsp;</td><td class="html_norm_rgt">&nbsp;</td></tr></table>'
          );
      }

      if (e.isOp('Bars')) {
        return P.Atom(
           '<table cellpadding="0" cellspacing="0"><tr><td class="html_norm_lft">&nbsp;</td><td>'
          +'<table cellpadding="0" cellspacing="0"><tr><td>'
          +P.formatted(fmt, e.dat[0])
          +'</td></tr></table>'
          +'</td><td class="html_norm_rgt">&nbsp;</td></tr></table>'
          );
      }

      // Special cases for superscripts.

      if (e.op == 'Super' && e.dat[1].dat[0] == 'Bottom') return wrap(P.Concat([P.present(fmt, e.dat[0]), P.Atom('<sup>&perp;</sup>')]));
      if (e.isOp('Super') && e.dat[1].con == 'Num') 
        return wrap(P.Concat([P.present(fmt, e.dat[0]), P.Atom('<span style="margin-top:-1px;"><sup>'+e.dat[1].dat[0]+'</sup></span>')]));      
      if (e.is(E.Super(E.Matrix(), E.Neg(E.Num(1))))) return wrap(P.Concat([P.present(fmt, e.dat[0]), P.AtomTop('-1')]));
      if (e.is(E.Super(E.R(), E.Num()))) return wrap(P.Concat([P.Atom(P.C(fmt, e.dat[0].dat)+'<sup>'+e.dat[1].dat[0]+'</sup>')]));
      if (e.is(E.Super(E.R(), E.Times(E.Num(),E.Num()))))
        return wrap(P.Concat([P.Atom(P.C(fmt, e.dat[0].dat)+'<sup>'+e.dat[1].dat[0].dat[0]+P.C(fmt, e.dat[1].op)+e.dat[1].dat[1].dat[0]+'</sup>')]));
      if (e.is(E.Super(E.V(), E.Neg(E.Num(1))))) 
        return wrap(P.Concat([P.present(fmt, e.dat[0]), P.Atom('<span style="margin-top:-1px;"><sup>-1</sup></span>')]));

      // Temporary hack for functions.
      //if (e.isOp('Mult')) return wrap(P.Concat([ P.present(fmt, e.dat[0]), P.Space, P.Atom('&nbsp;('), P.present(fmt, e.dat[1]), P.Atom(')')]));

    if (e.con=='Set') r = P.Concat([P.Left('{'),P.Concat(e.dat.map(function(e){return P.present(fmt, e);}).intersperse(P.Left(','))),P.Right('}')]);
    if (e.con=='Tuple') return P.Concat([P.Left('('),P.Concat(e.dat.map(function(e){return P.present(fmt, e);}).intersperse(P.Left(','))),P.Right(')')]);
      if (e.con=='SetRange')         return P.Concat([P.Left('{'), P.present(fmt, e.dat[0]), P.Mid('...'), P.present(fmt, e.dat[1]), P.Right('}')]);
      if (e.con=='SetComprehension') return P.Concat([P.Left('{'), P.present(fmt, e.dat[0]), P.Mid('|'), P.present(fmt, e.dat[1]), P.Right('}')]);
      if (e.con=='TupleComprehension') return P.Concat([P.Left('('), P.present(fmt, e.dat[0]), P.Mid('|'), P.present(fmt, e.dat[1]), P.Right(')')]);

      if (e.isOp('Comma')) return wrap(P.Concat([P.present(fmt, e.dat[0]), P.Relation(P.C(fmt, e.op)), P.Space, P.present(fmt, e.dat[1])]));

      if (e.isOp('Parens')) return wrap(P.Concat([P.Atom('('), P.present(fmt, e.dat[0]), P.Atom(')')]));
      if (e.isOp('Transpose')) return wrap(P.Concat([P.present(fmt, e.dat[0]), P.Atom('<sup>&#8868;</sup>')]));
      if (e.isOp('Super')) {
        if (e.dat[1].wrapped) return wrap(P.Concat([P.present(fmt, e.dat[0]), P.Atom(P.C(fmt, e.op)), P.present(fmt, e.dat[1]),]));
        else return wrap(P.Concat([P.present(fmt, e.dat[0]), P.Atom(P.C(fmt, e.op)), P.Left('('), P.present(fmt, e.dat[1]), P.Right(')')]));
      }

      if (e.con == 'Prefix')  return P.Concat([P.Atom(P.C(fmt, e.op)), P.Space, P.present(fmt, e.dat[0])]);
      if (e.isOp('Apply')) return wrap(P.Concat([ P.present(fmt, e.dat[0]), P.Space, P.present(fmt, e.dat[1])]));
      if (e.isOp(['Oplus','Concat','Vee','Wedge','Rightarrow','Plus','Minus','Mult','Div','Mod','Times','Union','Isect','Circ'])) return wrap(P.OpInfix(fmt,e));
      if (e.relation) r = wrap(P.RelInfix(fmt, e));
      if (e.is(E.True()) || e.is(E.False())) return P.Atom(P.C(fmt, e.dat[0]));
      if (e.is(E.Bits(E.X))) return P.Concat([P.Atom('<b>'+e.dat[0]+'</b>')]);
      if (e.is(E.BitStrings())) return P.Atom('<b>BitStrings</b>'); // P.Atom('{0,1}<sup>*</sup>');
      if (e.con == 'Constant') return wrap(P.Atom(P.C(fmt, e.dat[0])));
      if (e.is(E.Num())) return wrap(P.Atom(e.dat[0]));

      if (e.con == 'TextOp') {
        var parts = e.op.split(' '), parts_result = [], cur_words = [], term_index = 0;
        for (var i = 0; i < parts.length; i++) {
          if (parts[i] == '*') {
            if (cur_words.length > 0)
              parts_result.push(P.AtomPredWord(cur_words.join(' ')));
            cur_words = [];
            var r = P.present(fmt, e.dat[term_index++]);
            if (r == null) return null;
            parts_result.push(r);
          } else
            cur_words.push(parts[i]);
        }
        if (cur_words.length > 0)
          parts_result.push(P.AtomPredWord(cur_words.join(' ')));
        r = P.ConcatSpaces(parts_result);
      }

      if (r != null && e.analysis != null && e.analysis.formulaid != null) {
        function vwrap(c) {return P.Concat([P.Formatting('<div id="f'+e.analysis.formulaid+'" class="vcenter '+c+'">'), r, P.Formatting('</div>')])};
        if (e.verification == V.VerifiablyTrue) return vwrap('verifiablytrue');
        if (e.verification == V.VerifiablyFalse) return vwrap('verifiablyfalse');
        if (e.verification == V.Unverifiable) return vwrap('unverifiable');
        return vwrap('formula');
      }
      return r;

    },
    
  formatted2: function(fmt /*'html' or 'ascii'*/, e) { return this.html(this.present2(fmt, e)); },
  present2:
    function(fmt /*'html' or 'ascii'*/, e) {
      var P = this;
      var V = aartifact.verification;

      var r = null;

      // Handle wrapped expressions.
      var wrap = (e.wrapped == 'Parens') ? function(p){return P.Concat([P.Left('('), p, P.Right(')')]);} : function(p){return p;};

      if (e.con == 'Var') return (e.unbound) ? wrap(P.Atom('<span class="unbound">'+e.dat+'</span>')) : wrap(P.Atom(e.dat));

      // Call every presentation hook.
      for (var i = 0; i < this.hooks.length; i++) {
        r = this.hooks[i](this, fmt, e);
        if (r != null) break;
      }

      if (e.isError) return '<span style="color:firebrick; font-weight:bold;">an error has occurred</span>';

      // The default cases. Module hooks can preempt
      // and override these if necessary.

      if (e.is(E.Skip()))
        return P.Concat([P.Atom('skip')]);


      if (e.is(E.Send()))
        return P.Concat([
                 P.Atom('send'), P.present2(fmt, e.dat[0]), P.Atom(':'), P.Newline,
                 P.Indent, P.present2(fmt, e.dat[1]),
                 P.Unindent
               ]);


      if (e.isOp('And'))
        return P.Concat([P.present2(fmt, e.dat[0]), P.Space, P.FormulaOp(P.C(fmt, e.op)), P.Newline, P.present2(fmt, e.dat[1])]);

      if (e.isOp(['Implies', 'Iff']))
        return P.Concat([
                 P.Indent, P.present2(fmt, e.dat[0]), P.Unindent,
                 P.Newline, P.FormulaOp(P.C(fmt, e.op)), P.Newline,
                 P.Indent, P.present2(fmt, e.dat[1]), P.Unindent
               ]);

      if (e.is(E.Forall()) || e.is(E.Exists())) {
        if (e.dat[1].con != 'Quantifier' && e.statement == true) {
          return P.Concat([
                   P.FormulaOp(P.C(fmt, e.op)), P.present2(fmt, e.dat[0]), P.Atom(',&nbsp;'),
                   P.Newline, P.Indent, P.present2(fmt, e.dat[1])
                 ]);
        } else {
          //return P.Concat([P.FormulaOp(P.C(fmt, e.op)), P.present2(fmt, e.dat[0]), P.Atom(',&nbsp;'), P.present2(fmt, e.dat[1])]);

          var l = [P.FormulaOp(P.C(fmt, e.op))], e_cur = e, q_cur = e.op;
          while (e_cur.con == 'Quantifier' && e_cur.op == q_cur) {
            l.pushAll([P.present2(fmt, e_cur.dat[0]) /* ,P.Atom(',&nbsp;') */]);
            if (e_cur.statement == true && e_cur.dat[1].con != 'Quantifier')
              l.pushAll([P.Newline,P.Indent]);
            e_cur = e_cur.dat[1];
          }
          l.push(P.present2(fmt, e_cur));
          return P.Concat(l);
        }
      }

      if (e.is(E.Matrix())) {
        var cls = (e.dat.dimensions().cols == 1) ? 'html_vector_entry' : 'html_matrix_entry';
        return P.Atom(
          '<table cellpadding="0" cellspacing="0"><tr><td class="html_matrix_lft">&nbsp;</td><td>'
        + '<table cellpadding="0" cellspacing="0" style="font-size:10px;">'
        + e.dat.map(function(r){return '<tr>'+r.map(function(e){return '<td class="'+cls+'">'+P.formatted(fmt, e)+'</td>';}).join('')+'</tr>';}).join('')
        + '</table>'
        +'</td><td class="html_matrix_rgt">&nbsp;</td></tr></table>'
          );
      }

      if (e.isOp('Norm')) {
        return P.Atom(
           '<table cellpadding="0" cellspacing="0"><tr><td class="html_norm_lft">&nbsp;</td><td class="html_norm_lft">&nbsp;</td><td>'
          +'<table cellpadding="0" cellspacing="0"><tr><td>'
          +P.formatted(fmt, e.dat[0])
          +'</td></tr></table>'
          +'</td><td class="html_norm_rgt">&nbsp;</td><td class="html_norm_rgt">&nbsp;</td></tr></table>'
          );
      }

      if (e.isOp('Bars')) {
        return P.Atom(
           '<table cellpadding="0" cellspacing="0"><tr><td class="html_norm_lft">&nbsp;</td><td>'
          +'<table cellpadding="0" cellspacing="0"><tr><td>'
          +P.formatted(fmt, e.dat[0])
          +'</td></tr></table>'
          +'</td><td class="html_norm_rgt">&nbsp;</td></tr></table>'
          );
      }

      // Special cases for superscripts.

      if (e.op == 'Super' && e.dat[1].dat[0] == 'Bottom') return wrap(P.Concat([P.present2(fmt, e.dat[0]), P.Atom('<sup>&perp;</sup>')]));
      if (e.isOp('Super') && e.dat[1].con == 'Num')
        return wrap(P.Concat([P.present2(fmt, e.dat[0]), P.Atom('<span style="margin-top:-1px;"><sup>'+e.dat[1].dat[0]+'</sup></span>')]));
      if (e.is(E.Super(E.Matrix(), E.Neg(E.Num(1))))) return wrap(P.Concat([P.present2(fmt, e.dat[0]), P.AtomTop('-1')]));
      if (e.is(E.Super(E.R(), E.Num()))) return wrap(P.Concat([P.Atom(P.C(fmt, e.dat[0].dat)+'<sup>'+e.dat[1].dat[0]+'</sup>')]));
      if (e.is(E.Super(E.R(), E.Times(E.Num(),E.Num()))))
        return wrap(P.Concat([P.Atom(P.C(fmt, e.dat[0].dat)+'<sup>'+e.dat[1].dat[0].dat[0]+P.C(fmt, e.dat[1].op)+e.dat[1].dat[1].dat[0]+'</sup>')]));
      if (e.is(E.Super(E.V(), E.Neg(E.Num(1)))))
        return wrap(P.Concat([P.present2(fmt, e.dat[0]), P.Atom('<span style="margin-top:-1px;"><sup>-1</sup></span>')]));

      // Temporary hack for functions.
      //if (e.isOp('Mult')) return wrap(P.Concat([ P.present2(fmt, e.dat[0]), P.Space, P.Atom('&nbsp;('), P.present2(fmt, e.dat[1]), P.Atom(')')]));

    if (e.con=='Set') r = P.Concat([P.Left('{'),P.Concat(e.dat.map(function(e){return P.present2(fmt, e);}).intersperse(P.Left(','))),P.Right('}')]);
    if (e.con=='Tuple') return P.Concat([P.Left('('),P.Concat(e.dat.map(function(e){return P.present2(fmt, e);}).intersperse(P.Left(','))),P.Right(')')]);
      if (e.con=='SetRange')         return P.Concat([P.Left('{'), P.present2(fmt, e.dat[0]), P.Mid('...'), P.present2(fmt, e.dat[1]), P.Right('}')]);
      if (e.con=='SetComprehension') return P.Concat([P.Left('{'), P.present2(fmt, e.dat[0]), P.Mid('|'), P.present2(fmt, e.dat[1]), P.Right('}')]);
      if (e.con=='TupleComprehension') return P.Concat([P.Left('('), P.present2(fmt, e.dat[0]), P.Mid('|'), P.present2(fmt, e.dat[1]), P.Right(')')]);

      if (e.isOp('Comma')) return wrap(P.Concat([P.present2(fmt, e.dat[0]), P.Relation(P.C(fmt, e.op)), P.Space, P.present2(fmt, e.dat[1])]));

      if (e.isOp('Parens')) return wrap(P.Concat([P.Atom('('), P.present2(fmt, e.dat[0]), P.Atom(')')]));
      if (e.isOp('Transpose')) return wrap(P.Concat([P.present2(fmt, e.dat[0]), P.Atom('<sup>&#8868;</sup>')]));
      if (e.isOp('Super')) {
        if (e.dat[1].wrapped) return wrap(P.Concat([P.present2(fmt, e.dat[0]), P.Atom(P.C(fmt, e.op)), P.present2(fmt, e.dat[1]),]));
        else return wrap(P.Concat([P.present2(fmt, e.dat[0]), P.Atom(P.C(fmt, e.op)), P.Left('('), P.present2(fmt, e.dat[1]), P.Right(')')]));
      }

      if (e.con == 'Prefix')  return P.Concat([P.Atom(P.C(fmt, e.op)), P.Space, P.present2(fmt, e.dat[0])]);
      if (e.isOp('Apply')) return wrap(P.Concat([ P.present2(fmt, e.dat[0]), P.Space, P.present2(fmt, e.dat[1])]));
      if (e.isOp(['Oplus','Concat','Vee','Wedge','Rightarrow','Plus','Minus','Mult','Div','Mod','Times','Union','Isect','Circ'])) return wrap(P.OpInfix(fmt,e));
      if (e.relation) r = wrap(P.OpInfix(fmt, e));
      if (e.is(E.True()) || e.is(E.False())) return P.Atom(P.C(fmt, e.dat[0]));
      if (e.is(E.Bits(E.X))) return P.Concat([P.Atom('<b>'+e.dat[0]+'</b>')]);
      if (e.is(E.BitStrings())) return P.Atom('<b>BitStrings</b>'); // P.Atom('{0,1}<sup>*</sup>');
      if (e.con == 'Constant') return wrap(P.Atom(P.C(fmt, e.dat[0])));
      if (e.is(E.Num())) return wrap(P.Atom(e.dat[0]));

      if (e.con == 'TextOp') {
        var parts = e.op.split(' '), parts_result = [], cur_words = [], term_index = 0;
        for (var i = 0; i < parts.length; i++) {
          if (parts[i] == '*') {
            if (cur_words.length > 0)
              parts_result.push(P.AtomPredWord(cur_words.join(' ')));
            cur_words = [];
            var r = P.present2(fmt, e.dat[term_index++]);
            if (r == null) return null;
            parts_result.push(r);
          } else
            cur_words.push(parts[i]);
        }
        if (cur_words.length > 0)
          parts_result.push(P.AtomPredWord(cur_words.join(' ')));
        r = P.ConcatSpaces(parts_result);
      }

      if (r != null && e.analysis != null && e.analysis.formulaid != null) {
        function vwrap(c) {return P.Concat([P.Formatting('<div id="f'+e.analysis.formulaid+'" class="vcenter '+c+'">'), r, P.Formatting('</div>')])};
        if (e.verification == V.VerifiablyTrue) return vwrap('verifiablytrue');
        if (e.verification == V.VerifiablyFalse) return vwrap('verifiablyfalse');
        if (e.verification == V.Unverifiable) return vwrap('unverifiable');
        return vwrap('formula');
      }
      return r;

    }
};

//eof
