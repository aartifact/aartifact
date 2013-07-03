/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// regimes/example/regime.js
//   Regime file for variant of environment intended for instruction
//   of an undergraduate-level linear algebra course.
//



Include.includes(
  'syntax/Exp.js',

  'components/presentation.js',
  'components/library.js',
  'components/analysis.js',
  'components/equality.js',
  'components/evaluation.js',
  'components/verification.js',

  'modules/arithmetic.js',
  'modules/logical_formulas.js',
  'modules/algebra_of_sets.js',
  'modules/linear_algebra.js',

  'regimes/example/expression.js',

  'regimes/example/language.js',

  function(){


  ////////////////////////////////////////////////////////////////
  // Create and populate the interface panels (including their
  // click handlers), then load the parser and library.

  new WidgetTextAreaResizable({containerId:"input_widget_container", id:"input_text"});
  $('#input_text').data('WidgetTextAreaResizable').fit();
  var panel_out = new WidgetPanelsTabbed({containerId:"panels_tabbed", content:{

    'click to process': {
      id: "panel_process",
      click: function(){ 

        var panels = new WidgetPanelList({containerId: "panel_process"});
        
        var s = ge('input_text').value;
        var input_split_up = split_into_blocks_starting_with_unindented_line(ge('input_text').value, '@');
        
        var stmts = input_split_up.statements;
        
        var parser = {
          expanded:
            { 'Stmt':
                { cases:
                    [ { constructor: 'Stmt', sequence: [{con:'Entity', dat:['Formula']}] }]
                },
              'Formula':
                { cases:
                    [ { constructor: 'Expr', sequence: [{con:'Entity', dat:['Exp.9']}] }]
                },
              'Exp.9': { cases: [{ sequence: [{con:'Entity', dat:['Exp.8']}, {con:'Entity', dat:['Exp.9.Suffix']}], creation: suffixCreation }] },
              'Exp.9.Suffix':
                { cases:
                    [ { constructor: 'Implies',
                        sequence: [{con:'Line', dat:[]}, {con:'Terminal', dat:['\\implies']}, {con:'Line', dat:[]}, {con:'Entity', dat:['Exp.9']}],
                        creation: (function(a) { return new Exp('Infix', 'Implies', [a[0]]); })},
                      { sequence: [] }
                    ]
                },
              'Exp.8': { cases: [{ sequence: [{con:'Entity', dat:['Exp.7']}, {con:'Entity', dat:['Exp.8.Suffix']}], creation: suffixCreation }] },
              'Exp.8.Suffix':
                { cases:
                    [ { constructor: 'And',
                        sequence: [{con:'Line', dat:[]}, {con:'Entity', dat:['Exp.8']}],
                        creation: (function(a) { return new Exp('Infix', 'And', [a[0]]); })},
                      { constructor: 'And',
                        sequence: [{con:'Terminal', dat:['\\and']}, {con:'Entity', dat:['Exp.8']}],
                        creation: (function(a) { return new Exp('Infix', 'And', [a[0]]); })},
                      { sequence: [] }
                    ]
                },
              'Exp.7': { cases: [{ sequence: [{con:'Entity', dat:['Exp.6']}, {con:'Entity', dat:['Exp.7.Suffix']}], creation: suffixCreation }] },
              'Exp.7.Suffix':
                { cases:
                    [ pOpSuf('Exp.7','Semicolon',';'),
                      pOpSuf('Exp.7','Comma',','),
                      { sequence: [] }
                    ]
                },
              'Exp.6': { cases: [{ sequence: [{con:'Entity', dat:['Exp.5']}, {con:'Entity', dat:['Exp.6.Suffix']}], creation: suffixCreation }] },
              'Exp.6.Suffix':
                { cases:
                    [ pRelSuf('Exp.6','Eq','='),
                      pRelSuf('Exp.6','Neq','\\neq'),
                      pRelSuf('Exp.6','Lt','<'),
                      pRelSuf('Exp.6','Gt','>'),
                      pRelSuf('Exp.6','Leq','\\leq'),
                      pRelSuf('Exp.6','Geq','\\geq'),
                      { sequence: [] }
                    ]
                },

              'Exp.5': { cases: [{ sequence: [{con:'Entity', dat:['Exp.4']}, {con:'Entity', dat:['Exp.5.Suffix']}], creation: suffixCreation }] },
              'Exp.5.Suffix':
                { cases:
                    [ pOpSuf('Exp.5','Plus','+'),
                      pOpSuf('Exp.5','Minus','-'),
                      { sequence: [] }
                    ]
                },
              'Exp.4': { cases: [{ sequence: [{con:'Entity', dat:['Exp.3']}, {con:'Entity', dat:['Exp.4.Suffix']}], creation: suffixCreation }] },
              'Exp.4.Suffix':
                { cases:
                    [ pOpSuf('Exp.4','Mult','*'),
                      pOpSuf('Exp.4','Times',"\\times"),
                      { sequence: [] }
                    ]
                },

              'Exp.3': { cases: [{ sequence: [{con:'Entity', dat:['Exp.2']}, {con:'Entity', dat:['Exp.3.Suffix']}], creation: suffixCreation }] },
              'Exp.3.Suffix':
                { cases:
                    [ pOpSuf('Exp.3','Super','^'),
                      { sequence: [] }
                    ]
                },

              'Exp.2':
                { cases:
                    [ { constructor: 'Neg',
                          sequence: [{con:'Terminal', dat:["-"]}, {con:'Entity', dat:['Exp.1']}],
                          creation: (function(a) { return E.Neg(a[0]); })},
                      { sequence: [{con:'Entity', dat:['Exp.1']}], creation: function(a){ return a[0]; } }
                    ]
                },

              'Exp.1': { cases: [{ sequence: [{con:'Entity', dat:['Exp.0']}, {con:'Entity', dat:['Exp.1.Suffix']}], creation: suffixCreation }] },
              'Exp.1.Suffix':
                { cases:
                    [ { constructor: 'Apply',
                        sequence: [{con:'Entity', dat:['Exp.1']}],
                        creation: (function(a) { return new Exp('Infix', 'Apply', [a[0]], null, 'invisible'); })},
                      { sequence: [] }
                    ]
                },
              'Exp.0':
                { cases:
                    [ { constructor: 'Forall',
                          sequence:
                            [   {con:'Terminal', dat:["\\forall"]}, 
                              {con:'Entity', dat:["1[,Variable]"]},
                              {con:'Terminal', dat:["\\in"]},
                              {con:'Entity', dat:['Exp.3']}, 
                              {con:'Terminal', dat:[","]},
                              {con:'Entity', dat:['Exp.9']}
                            ], 
                          creation: (function(a) {return mkQuant('Forall', {vars:a[0], domain:a[1], relOp: E.In}, a[2]);}) },
                      { constructor: 'Sqrt',
                          sequence: [ {con:'Terminal', dat:["\\sqrt"]}, {con:'Entity', dat:["Exp.9"]} ], 
                          creation: (function(a) {return E.Sqrt(a[0]);}) },
                      { constructor: 'Float', 
                          sequence: [{con:'RegEx', dat:["[0-9]+\\.[0-9]+"]}], 
                          creation: (function(a) {return E.Num(parseFloat(a[0]));}) },
                      { constructor: 'Int', 
                          sequence: [{con:'RegEx', dat:["[0-9]+"]}], 
                          creation: (function(a) {return E.Num(parseInt(a[0]));}) },
                      { constructor: 'Var', sequence: [{con:'Entity', dat:["Variable"]}], creation: (function(a) {return mkVar(a[0]);}) },
                      { sequence: [{con:'Terminal', dat:["||"]}, {con:'Entity', dat:['Exp.9']}, {con:'Terminal', dat:["||"]}], 
                          creation: (function(a) { return E.Norm(a[0]); }) },
                      { sequence: [{con:'Terminal', dat:["["]}, {con:'Entity', dat:['Exp.9']}, {con:'Terminal', dat:["]"]}], 
                          creation: (function(a) { return E.Bracks(a[0]); }) },
                      { sequence: [{con:'Terminal', dat:["{"]}, {con:'Entity', dat:['Exp.9']}, {con:'Terminal', dat:["}"]}], 
                          creation: (function(a) { return E.Braces(a[0]); }) },
                      { sequence: [{con:'Terminal', dat:["("]}, {con:'Entity', dat:['Exp.9']}, {con:'Terminal', dat:[")"]}], 
                          creation: (function(a) { a[0].wrapped = 'Parens'; return a[0]; }) },
                      { constructor: 'R', sequence: [{con:'Terminal', dat:["\\R"]}], creation: (function(a) {return E.Constant('R');}) },
                      { constructor: 'True', sequence: [{con:'Terminal', dat:["\\true"]}], creation: (function(a) {return E.Constant('True');}) },
                      { constructor: 'False', sequence: [{con:'Terminal', dat:["\\false"]}], creation: (function(a) {return E.Constant('False');}) },
                      { constructor: 'Placeholder', sequence: [{con:'Terminal', dat:["``"]}], creation: (function(a) {return E.Placeholder();}) },
                      { constructor: '?', sequence: [{con:'Terminal', dat:["?"]}], creation: (function(a) {return E.Undefined();}) },
                      { constructor: 'Predicate',
                          sequence: [{con:'Terminal', dat:["`"]}, {con:'Entity', dat:["1[,PredPart]"]}, {con:'Terminal', dat:["`"]}],
                          creation: function(a){ return make_text_op_term(a[0]); } }
                    ]
                },
              '1[,PredPart]':
                { cases: [ { sequence: [{con:'Entity', dat:["PredPart"]}, {con:'Entity', dat:["1[,PredPart].Suffix"]}],
                               creation: function(a){ if (a.length == 1) {return [a[0]];} else { var b = []; b = b.concat([a[0]],a[1]); return b} }}
                         ] 
                },
              '1[,PredPart].Suffix':
                { cases: [ { sequence: [{con:'Entity', dat:["1[,PredPart]"]}], creation: function(a){return a[0];} },
                           { sequence: [] }
                         ] 
                },
              'PredPart':
                { cases: [ { constructor: 'PredTerm', 
                               sequence: [{con:'Terminal', dat:["("]}, {con:'Entity', dat:["Exp.9"]}, {con:'Terminal', dat:[")"]}],
                               creation: function(a) {return {typ:'Pred_Comp', con:'Term', dat:a[0]};}},
                           { constructor: 'PredWord', 
                               sequence: [{con:'RegEx', dat:['[A-Za-z_]((\')|[A-Za-z0-9_])*']}],
                               creation: function(a) {return {typ:'Pred_Comp', con:'Word', dat:a[0]};}}
                         ] 
                },
              '1[,Variable]':
                { cases: [ { sequence: [{con:'Entity', dat:["Variable"]}, {con:'Entity', dat:["1[,Variable].Suffix"]}],
                               creation: function(a){ if (a.length == 1) {return [a[0]];} else { var b = []; b = b.concat(a[1], [a[0]]); return b} }}
                         ] 
                },
              '1[,Variable].Suffix':
                { cases: [ { sequence: [{con:'Terminal', dat:[","]}, {con:'Entity', dat:["1[,Variable]"]}], creation: function(a){return a[0];} },
                           { sequence: [] }
                         ] 
                },
              'Variable':
                { cases: [ { constructor: 'Variable', 
                             sequence: [{con:'RegEx', dat:['[0-9]*[A-Za-z_]((\')|[A-Za-z0-9_])*']}],
                             creation: function(a) {return a[0];}}
                         ] 
                }
            }
        };

        parser = parser_tokens_extract(parser);
        
        var stmtList = [];
        for (var jj = 0; jj < stmts.length; jj++) {
          var sstr = stmts[jj];
          var tokenized = parser_tokenizer_tokenize(parser.tokens, sstr);
          var r = parser_parser(parser, 'Stmt', tokenized, 0);
          if (r == null) {
            panels.addPanel(WidgetPanelsTabbedCollapsible({content:{messages: WidgetPanel('syntax error in:<br/><br/><code>'+sstr+'</code>')}}));
          } else {
            var stmt = r.result;
            panels.addPanel(WidgetPanelsTabbedCollapsible({content:{messages: WidgetPanel(prettyprint(stmt))}}));
            stmtList.push(stmt);
          }
          //panels.addPanel(WidgetPanelsTabbedCollapsible({content:{output: WidgetPanel(parser_print(tokenized))}}));
        }

        var output = uxadt.toString(language);
        var x = Imparse.tokenize(language, "assert true");
        output = uxadt.toString(x);


        panels.addPanel(WidgetPanelsTabbedCollapsible({content:{messages: WidgetPanel(output)}}));

        //if (stmtList.length == 0)
        //  panels.addPanel(WidgetPanelsTabbedCollapsible({content:{messages: WidgetPanel('there is no input')}}));
        //else
        //  StaggeredIterator.prototype.anonymousStart(10, 1, function(){return upd_step(stmtList, new Environment(), panels);});
      }
    }
  }});

  // Load the parser and library.

  $('#messages').html('<b>Loading grammar and generating parser...</b>');
  $('#overlay').show();
  Include.includes('regimes/example/parser.js', function(){
  //JSCC.load('aartifact.parse', 'regimes/example/parser.jscc', function(){
    aartifact.parseExpFromStr = function(s) {
      var r = aartifact.parse('@'+s);
      if (!r.error && r.ast.length >= 1) {
        var stmt = r.ast[0];
        if (stmt != null && stmt.dat != null)
          return stmt.dat.dat;
      }
    }
    $('#messages').html('<b>Loading library...</b>');
    Include.include('regimes/example/propositions.js', function(){
      $('#overlay').hide();
      panel_out.click('click to process');
    });
  });


  ////////////////////////////////////////////////////////////////
  // Auxiliary functions.

  function upd_step(stmts, env, panels) {
    // Pre-fill the feedback panel in case an unrecoverable error occurs.
    panels.addPanel(error_panel('syntax error'));

    var result = {error: false, ast: [stmts[0]]}; //aartifact.parse(stmts[0]);
    if (!result.error && result.ast.length >= 1 && result.ast[0].dat != null && result.ast[0].dat.prop != true) {
      var statement = result.ast[0], e = statement.dat.dat, name, t;
      if (e.relation == 'Eqdef') { // Assignment to a variable.
        name = e.dat[0].dat;
        t = e.dat[1];
      } else { // A standalone expression.
        name = '#exp_'+UUID()+'';
        t = e;
      }
      t.statement = true;
    
      // Pre-fill the feedback panel in case an unrecoverable error occurs, then analyze.
      panels.lastPanelHTML(error_panel('static analysis error'));
      aartifact.analysis.analyze(env, t);

      // Pre-fill the feedback panel in case an unrecoverable error occurs, then evaluate
      panels.lastPanelHTML(error_panel('evaluation error'));
      var v = aartifact.evaluation.evaluate(env, t);
      panels.lastPanelHTML(summary_panels(t, v));

      // Perform verification and update the document accordingly.
      var context = new Context(new Environment, new EquivalenceClasses(aartifact.equality.eq));
      setTimeout(function(){ aartifact.verification.verify(context, t); }, 10);
      env = env.bind(name, v);
    } else if (!result.error && result.ast.length >= 1 && result.ast[0].dat.prop == true) {
      aartifact.library.propositions_user.push(result.ast[0].dat.dat);
      panels.lastPanelHTML(WidgetPanelsTabbedCollapsible({content:{status: WidgetPanel('proposition added')}}));
    }

    return (stmts.length>1) ? function(){return upd_step(stmts.slice(1), env, panels)} 
                            : function(){aartifact.presentation.render_math_equations_html();};
  }

  function summary_panels(e, v) {
    if (e.analysis.errors.length == 0)
      return WidgetPanelsTabbedCollapsible({
        clickHandlerString:'aartifact.presentation.render_math_equations_html()',
        content:{
          input: WidgetFilterableListTable({items:[aartifact.presentation.formatted('html', e)]}),
          properties: 
            WidgetFilterableListTable({filtering:true, default:'no derived properties', items:
              aartifact.analysis.properties_all(e)
                .distinct(aartifact.equality.eq_bas)
                .map(function(p){return {keywords: aartifact.expression.keywords(p), content: aartifact.presentation.formatted2('html', p)};}),
            }),
          evaluation: (v!=null && !v.isError) 
            ? WidgetPanel(aartifact.presentation.formatted('html', v)) 
            : WidgetPanel('<span class="error">'+((v==null)?'no evaluation result</span>':v.message)+'</span>')
        }}
        );
    else
      return WidgetPanelsTabbedCollapsible({content:{errors: WidgetFilterableListTable({items: e.analysis.errors.map(function(e){return e.text;})})}});
  }

  function error_panel(msg) { 
    return WidgetPanelsTabbedCollapsible({content:{error: WidgetPanel('<span class="error">'+msg+'</span>')}});
  }

  ////////////////////////////////////////////////////////////////
  // New parsing functions.

  function mkVar(s) {
    for (var i = 0; i < s.length; i++) {
      var c = s.substr(i,i+1);
      if ( c != '0' && c!='1' && c!='2' && c!='3' && c!='4' && c!='5' && c!='6' && c!='7' && c!='8' && c!='9' && c!='.' && c!='-' )
        break;
    }
    if (i == 0)
      return E.V(s);
    else {
      var n = parseFloat(s.substr(0,i));
      return (!isNaN(n)) ? E.Apply(E.Num(n), E.V(s.substr(i))) : null;
    }
  }

  function mkQuant(op, binding, t) {
    if (binding.vars.length == 0) return null;
    for (var i = 0; i < binding.vars.length; i++) {
      if (binding.relOp != null && binding.domain != null)
        t = E.Quantifier(op, binding.relOp(E.V(binding.vars[i]),binding.domain), t);
      else
        t = E.Quantifier(op, E.V(binding.vars[i]), t);
    }
    return t;
  }

  var __longest_prefix_of_X_matching_regex_X = function(s, r) {
    var re = new RegExp(r);
    while (s.length > 0) {
      var matches = s.match(re);
      if (matches != null && matches.length > 0 && matches[0] == s) return s;

      s = s.substr(0,s.length-1);
    }
    return (s.length == 0) ? null : s;      
  }

  var __X_is_prefix_of_X = function(p, s) {
    if (typeof(p) == 'string' && typeof(s) == 'string')
      return s.substring(0,p.length) == p;    
  }

  function make_text_op_term(components) {
    var t = {text:'', terms:[], dat:[]};
    var text_parts = [];
    for (var i = 0; i < components.length; i++) {
      if (components[i].con == 'Word') {
        text_parts.push(components[i].dat);
      } else if (components[i].con == 'Term') {
        text_parts.push('*');
        t.terms.push(components[i].dat);
      }
    }
    t.text = text_parts.join(' ');
    t.dat = t.terms;
    return new Exp('TextOp', t.text, t.terms);
  }

  var suffixCreation = function(a) {
    if (a.length != null && a.length > 1) { 
      var b = []; 
      a[1].dat = b.concat([a[0]],a[1].dat); 
      return a[1]; 
    } else { 
      return a[0]; 
    }
  };

  function parser_tokens_extract(parser) {
    var tokens = [];
    var entities = parser.expanded;
    for (e in entities) {
      var cs = entities[e].cases;
      for (var i = 0; i < cs.length; i++) {
        var seq = cs[i].sequence;
        for (var j = 0; j < seq.length; j++) {
          if (seq[j].con == 'Terminal')
            tokens.push({dat: [seq[j].dat[0]], con: 'Terminal'});
          if (seq[j].con == 'RegEx')
            tokens.push({dat: [seq[j].dat[0]], con: 'RegEx'});
        }
      }
    }
    parser.tokens = tokens;
    return parser;
  }

  function parser_print(tokenized) {
    var s = '';
    for (var i = 0; i < tokenized.length; i++) {
      if (tokenized[i].con == 'Line')
        s += "\n<br/><code>``_</code>";
      else
        s += "\n<br/><code>" + tokenized[i].dat[0] + '</code>';
    }
    return s;
  }

  function match_try(t, r) {
    if (t == null) return false;
    var m = t.match(new RegExp(r));
    return (m == null) ? false : (m[0] == t);
  }

  function pOpSuf(entity, o, s) {
    var c = {};
    c.constructor = o;
    c.sequence = [{con:'Terminal', dat:[s]}, {con:'Entity', dat:[entity]}];
    c.creation = (function(a) { return new Exp('Infix', o, [a[0]]); });
    return c;
  }

  function pRelSuf(entity, o, s) {
    var c = {};
    c.constructor = o;
    c.sequence = [{con:'Terminal', dat:[s]}, {con:'Entity', dat:[entity]}];
    c.creation = (function(a) { var e = new Exp('Infix', o, [a[0]]); e.relation = true; return e; });  
    return c;
  }

  function parser_parser(parser, entity, tokens, tok_ix) {

    var cs = parser.expanded[entity].cases;
    for (var i = 0; i < cs.length; i++) {

      if (cs[i].sequence.length == 0) return {result: null, tok_ix: tok_ix};
    
      var c = cs[i];
      var dat = [];
      var case_failed = false;
      var tok_ix_temp = tok_ix;
      for (var j = 0; j < c.sequence.length; j++) {

        // Entity may accept zero tokens, so allow it if tokens are depleted.

        if (tok_ix_temp >= tokens.length && c.sequence[j].con != 'Entity') {
          case_failed = true;
          break;
        }

        if (c.sequence[j].con == 'Entity') {
          var pr = parser_parser(parser, c.sequence[j].dat[0], tokens, tok_ix_temp);
          if (pr != null) {
            if (pr.result != null)
              dat.push(pr.result); 
            tok_ix_temp = pr.tok_ix; 
          } else 
            case_failed = true;
        }

        if (c.sequence[j].con == 'Line' && tok_ix_temp < tokens.length) {
          if (tokens[tok_ix_temp].con == c.sequence[j].con) tok_ix_temp = tok_ix_temp + 1; else case_failed = true;
        }

        if (c.sequence[j].con == 'Terminal' && tok_ix_temp < tokens.length) {
          var token = tokens[tok_ix_temp].dat[0];
          if (token == c.sequence[j].dat[0]) tok_ix_temp = tok_ix_temp + 1; else case_failed = true;
        }

        if (c.sequence[j].con == 'RegEx' && tok_ix_temp < tokens.length) {
          var token = tokens[tok_ix_temp].dat[0];
          if (match_try(token, c.sequence[j].dat[0])) { dat.push(token); tok_ix_temp = tok_ix_temp + 1; } else case_failed = true;
        }

        if (case_failed) break;
      }

      if (!case_failed) {
        var r = (c.creation == null) ? {typ:entity, con:c.constructor, dat: (dat.length == 1)?dat[0]:dat} : c.creation(dat);
        return {result: r, tok_ix: tok_ix_temp};
      } else
        continue;
    }
    
    return null;
  }


  function is_whitespace(s) {
    if (s.length == 0)
      return false;
    for (var i = 0; i < s.length; i++)
      if (!(s[i] == ' ' || s[i] == "\n" || s[i] == "\r"))
        return false;
    return true;
  }

  function startsWithWhiteSpace(s) {
    return s.length > 0 && (s[0] == ' ' || s[0] == "\t");
  }
  
  function parser_tokenizer_tokenize(tokens, s) {

    var lines = s.match(/[^\r\n]+/g);
    var tokenized = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var indented = startsWithWhiteSpace(line);
      var all_whitespace = is_whitespace(line);
      
      while (line.length > 0) {        
        while (startsWithWhiteSpace(line)) line = line.substr(1);
        
        if (line.length <= 0) break;

        var match_length = 0;
        for (var j = 0; j < tokens.length; j++) {
        
          var token = tokens[j];

          if (token.con == 'Terminal' && __X_is_prefix_of_X(token.dat[0], line)) {
            if (token.dat[0].length > match_length) {
              tokenized.push(token);
              line = line.substr(token.dat[0].length);
              match_length = token.length;
            }
          }

          if (token.con == 'RegEx') {
            var matched = __longest_prefix_of_X_matching_regex_X(line, token.dat[0]);
            if (matched != null && matched.length > match_length) {
              tokenized.push({dat:[matched]});
              line = line.substr(matched.length);
              match_length = matched.length;
            }
          }
        }
        
        if (match_length <= 0) {  return tokenized; }
        while (startsWithWhiteSpace(line)) line = line.substr(1);
      }
      
      // Line is over.
      if ( indented && tokenized[tokenized.length-1].con != 'Line' && !all_whitespace)
        tokenized.push({con:'Line', dat:[]});
    }
    
    if (tokenized[tokenized.length-1].con == 'Line') tokenized.pop();

    return (tokenized);
  }

  function split_into_blocks_starting_with_unindented_line (s, marker) {
    if (marker == null || marker == undefined)
      marker = '';
      
    marker = '';
   
    var lines = s.split("\n");
    var lines_new = [];
    var blocks = [];
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length > 0) {
        var ppos = lines[i].indexOf('#');
        if (ppos != -1)
          lines[i] = lines[i].substring(0,ppos);
      }
      if (lines[i].length > 0) {       
        if (!startsWithWhiteSpace(lines[i])) {
          if (lines_new.length > 0) {
            blocks.push(lines_new.join("\n"));
            lines_new = [];
          }
          lines_new.push(marker+lines[i]);
        } else {
          if (blocks.length == 0 && lines_new.length == 0)
            lines_new.push(marker+lines[i].ltrim());
          else
            lines_new.push(lines[i])
        }
      }
    }
    if (lines_new.length > 0)
      blocks.push(lines_new.join("\n"));

    return {string:blocks.join("\n"), statements:blocks};
  }




  function prettyprint(stmt) {

    var s = '';
    
    for (p in stmt) {
    
      s += s + JSON.stringify(stmt);
    }
    
    var x = uxadt.C('Test', [uxadt.C('Test')]);
    var y = uxadt.C('Test', [uxadt.V('x')]);
    
    var __iml = null;
    if (__iml = uxadt.M(x, y)) {
      //alert("yes!");
    }
    //return uxadt.toString(d);
  
  }


}); // /Include.includes

//eof
