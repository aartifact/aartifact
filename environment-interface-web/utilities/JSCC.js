/////////////////////////////////////////////////////////////////////
//
// aartifact
// http://www.aartifact.org/
//
// This software is made available under the GNU GPLv3.
//
// utilities/JSCC.js
//   JavaScript LALR(1) parser generator.
//
// Dependencies:
//   [jQuery 1.7+]
//

/* -HEADER----------------------------------------------------------------------

JS/CC Dynamic: A LALR(1) Parser Generator written in JavaScript
Extended as a self-contained parser module.

Original:

JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   jscc.js
Original author: Jan Max Meyer

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.

*****************************************************************************

As a part of aartifact, this version has been modified so that all constants,
global variables, and functions are contained within a distinct JSCC namespace
(i.e., object).

----------------------------------------------------------------------------- */

// This is the root object containing all constants, globals, and functions
// for the parser generator.
var jscco = {

/* Constants */
JSCC_VERSION            : "0.30",

//Symbol types
SYM_NONTERM             : 0,
SYM_TERM                : 1,

//Symbol special cases
SPECIAL_NO_SPECIAL      : 0,
SPECIAL_EOF             : 1,
SPECIAL_WHITESPACE      : 2,

//Symbol associativity
ASSOC_NONE              : 0,
ASSOC_LEFT              : 1,
ASSOC_RIGHT             : 2,
ASSOC_NOASSOC           : 3,

//Token-Definitions
TOK_ERROR               : 0,
TOK_EOF                 : 1,
TOK_ID                  : 2,
TOK_TERM                : 3,
TOK_TERM_S              : 4,
TOK_COLON               : 5,
TOK_SEMICOLON           : 6,
TOK_DELIMITER           : 7,
TOK_SEMANTIC            : 8,
TOK_IGNORE              : 9,
TOK_PREFIX              : 10,

//Miscelleanous constants
DEF_PROD_CODE           : "%% = %1;",

//Code generation/output modes
MODE_GEN_TEXT           : 0,
MODE_GEN_JS             : 1,
MODE_GEN_HTML           : 2,

//Executable environment
EXEC_CONSOLE            : 0,
EXEC_WEB                : 1,

//Lexer state construction
MIN_CHAR                : 0,
MAX_CHAR                : 255,

EDGE_FREE               : 0,
EDGE_EPSILON            : 1,
EDGE_CHAR               : 2,

/*
    Structs
*/
SYMBOL: function()
{
    var kind;           //Symbol kind (jscco.SYM_TERM, jscco.SYM_NONTERM)
    var label;          //Symbol label/name
    var prods;          //Array of associated productions (jscco.SYM_NONTERM only)
    var first;          //Array of first symbols
    
    var associativity;  //Associativity mode (jscco.SYM_TERM only)
    var level;          //Association level (jscco.SYM_TERM only)
    
    var code;           //Code to be executed at token recognition (jscco.SYM_TERM only)
    var special;        //Special symbol

    /* --- Flags --- */
    var nullable;       //Nullable-flag
    var defined;        //Defined flag
},

PROD: function() {
    var lhs;
    var rhs;
    var level;
    var code;
},

ITEM: function() {
    var prod;
    var dot_offset;
    var lookahead;
},

STATE: function() {
    var kernel;
    var epsilon;
    var done;
    var closed;
    
    var actionrow;
    var gotorow;
},

NFA: function() {
    var     edge;
    var     ccl;
    var     follow;
    var     follow2;
    var     accept;
    var     weight;
},

DFA: function() {
    var     line;
    var     nfa_set;
    var     accept;
    var     done;
    var     group;
},

PARAM: function() {
    var start;
    var end;
},

TOKEN: function() {
    var token;
    var lexeme;
},

/* Globals (will be initialized via jscco.reset_all()!) */
symbols: null,

productions : null,
states : null,
lex : null,

nfa_states : null,
dfa_states : null,

whitespace_token : null,

code_head : null,
code_foot : null,

errors : null,
show_errors : null,
warnings : null,
show_warnings : null,

shifts : null,
reduces : null,
gotos : null,

exec_mode : null,

assoc_level : null,

regex_weight : null,

/* -MODULE----------------------------------------------------------------------
JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   debug.js
Author: Jan Max Meyer
Usage:  Debug-Functions / Detail progress output
        These functions had been designed to both output plain text as well
        as HTML-formatted output.

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.
----------------------------------------------------------------------------- */

print_symbols: function ( mode ) {
    if( mode == jscco.MODE_GEN_HTML )
    {
        jscco._print( "<table class=\"debug\" cellpadding=\"0\" cellspacing=\"0\">" );
        jscco._print( "<tr>" );
        jscco._print( "<td class=\"tabtitle\" colspan=\"3\">Symbols Overview</td>" );
        jscco._print( "</tr>" );
        jscco._print( "<tr>" );
        jscco._print( "<td class=\"coltitle\">Symbol</td>" );
        jscco._print( "<td class=\"coltitle\">Type</td>" );
        jscco._print( "</tr>" );
    }
    else if( mode == jscco.MODE_GEN_TEXT )
        jscco._print( "--- Symbol Dump ---" );
    
    for( var i = 0; i < jscco.symbols.length; i++ )
    {
        if( mode == jscco.MODE_GEN_HTML )
        {
            jscco._print( "<tr>" );
            
            jscco._print( "<td>" );
            jscco._print( jscco.symbols[i].label );
            jscco._print( "</td>" );
        
            jscco._print( "<td>" );
            jscco._print( ( ( jscco.symbols[i].kind == jscco.SYM_NONTERM ) ? "Non-terminal" : "Terminal" ) );
            jscco._print( "</td>" );
        }
        else if( mode == jscco.MODE_GEN_TEXT )
        {
            var output = new String();          
            
            output = jscco.symbols[i].label;
            for( var j = output.length; j < 20; j++ )
                output += " ";
            
            output += ( ( jscco.symbols[i].kind == jscco.SYM_NONTERM ) ? "Non-terminal" : "Terminal" );
            
            if( jscco.symbols[i].kind == jscco.SYM_TERM )
            {
                for( var j = output.length; j < 40; j++ )
                    output += " ";
            
                output += jscco.symbols[i].level + "/";
                
                switch( jscco.symbols[i].assoc )
                {
                    case jscco.ASSOC_NONE:
                        output += "^";
                        break;
                    case jscco.ASSOC_LEFT:
                        output += "<";
                        break;
                    case jscco.ASSOC_RIGHT:
                        output += ">";
                        break;
    
                }
            }
            
            jscco._print( output );
        }
        
    }   
    
    if( mode == jscco.MODE_GEN_HTML )
        jscco._print( "</table>" );
    else if( mode == jscco.MODE_GEN_TEXT )
        jscco._print( "" );
},

print_grammar: function ( mode ) {
    if( mode == jscco.MODE_GEN_HTML )
    {
        jscco._print( "<table class=\"debug\" cellpadding=\"0\" cellspacing=\"0\">" );
        jscco._print( "<tr>" );
        jscco._print( "<td class=\"tabtitle\" colspan=\"3\">Grammar Overview</td>" );
        jscco._print( "</tr>" );
        jscco._print( "<tr>" );
        jscco._print( "<td class=\"coltitle\">Left-hand side</td>" );
        jscco._print( "<td class=\"coltitle\">FIRST-set</td>" );
        jscco._print( "<td class=\"coltitle\">Right-hand side</td>" );
        jscco._print( "</tr>" );
        
        for( var i = 0; i < jscco.symbols.length; i++ )
        {
            jscco._print( "<tr>" );
            
            //alert( "symbols " + i +  " = " + jscco.symbols[i].label + "(" + jscco.symbols[i].kind + ")" );
            if( jscco.symbols[i].kind == jscco.SYM_NONTERM )
            {
                jscco._print( "<td>" );
                jscco._print( jscco.symbols[i].label );
                jscco._print( "</td>" );
    
                jscco._print( "<td>" );
                for( var j = 0; j < jscco.symbols[i].first.length; j++ )
                {
                    jscco._print( " <b>" + jscco.symbols[jscco.symbols[i].first[j]].label + "</b> " );
                }
                jscco._print( "</td>" );
    
                jscco._print( "<td>" );
                for( var j = 0; j < jscco.symbols[i].prods.length; j++ )
                {
                    for( var k = 0; k < jscco.productions[jscco.symbols[i].prods[j]].rhs.length; k++ )
                    {
                        if( jscco.symbols[jscco.productions[jscco.symbols[i].prods[j]].rhs[k]].kind == jscco.SYM_TERM )
                            jscco._print( " <b>" + jscco.symbols[jscco.productions[jscco.symbols[i].prods[j]].rhs[k]].label + "</b> " );
                        else
                            jscco._print( " " + jscco.symbols[jscco.productions[jscco.symbols[i].prods[j]].rhs[k]].label + " " );                   
                    }
                    jscco._print( "<br />" );
                }
                jscco._print( "</td>" );
            }
            
            jscco._print( "</tr>" );
        }
        
        jscco._print( "</table>" );
    }
    else if( mode == jscco.MODE_GEN_TEXT )
    {
        var output = new String();
                
        for( var i = 0; i < jscco.symbols.length; i++ )
        {
            if( jscco.symbols[i].kind == jscco.SYM_NONTERM )
            {
                output += jscco.symbols[i].label + " {";
                
                for( var j = 0; j < jscco.symbols[i].first.length; j++ )
                    output += " " + jscco.symbols[jscco.symbols[i].first[j]].label + " ";
    
                output += "}\n";            
    
                for( var j = 0; j < jscco.symbols[i].prods.length; j++ )
                {
                    output += "\t";
                    for( var k = 0; k < jscco.productions[jscco.symbols[i].prods[j]].rhs.length; k++ )
                    {
                        if( jscco.symbols[jscco.productions[jscco.symbols[i].prods[j]].rhs[k]].kind == jscco.SYM_TERM )
                            output += "#" + jscco.symbols[jscco.productions[jscco.symbols[i].prods[j]].rhs[k]].label + " ";
                        else
                            output += jscco.symbols[jscco.productions[jscco.symbols[i].prods[j]].rhs[k]].label + " ";
                    }
                    output += "\n";
                }
            }
        }
        
        jscco._print( output );
    }
},

print_item_set: function ( mode, label, item_set )
{
    var i, j;
    
    if( item_set.length == 0 )
        return;
    
    if( mode == jscco.MODE_GEN_HTML )
    {
        jscco._print( "<table class=\"debug\" cellpadding=\"0\" cellspacing=\"0\">" );
        jscco._print( "<tr>" );
        jscco._print( "<td class=\"tabtitle\" colspan=\"2\">" + label + "</td>" );
        jscco._print( "</tr>" );
        jscco._print( "<tr>" );
        jscco._print( "<td class=\"coltitle\" width=\"35%\">Lookahead</td>" );
        jscco._print( "<td class=\"coltitle\" width=\"65%\">Production</td>" );
        jscco._print( "</tr>" );
    }
    else if( mode == jscco.MODE_GEN_TEXT )
        jscco._print( "--- " + label + " ---" );
            
    for( i = 0; i < item_set.length; i++ )
    {
        if( mode == jscco.MODE_GEN_HTML )
        {
            jscco._print( "<tr>" );
            
            //alert( "symbols " + i +  " = " + jscco.symbols[i].label + "(" + jscco.symbols[i].kind + ")" );
            jscco._print( "<td>" );
            for( j = 0; j < item_set[i].lookahead.length; j++ )
            {
                jscco._print( " <b>" + jscco.symbols[item_set[i].lookahead[j]].label + "</b> " );
            }
            jscco._print( "</td>" );
    
            jscco._print( "<td>" );
            
            jscco._print( jscco.symbols[jscco.productions[item_set[i].prod].lhs].label + " -&gt; " );
            for( j = 0; j < jscco.productions[item_set[i].prod].rhs.length; j++ )
            {
                if( j == item_set[i].dot_offset )
                    jscco._print( "." );
                
                if( jscco.symbols[jscco.productions[item_set[i].prod].rhs[j]].kind == jscco.SYM_TERM )
                    jscco._print( " <b>" + jscco.symbols[jscco.productions[item_set[i].prod].rhs[j]].label + "</b> " );
                else
                    jscco._print( " " + jscco.symbols[jscco.productions[item_set[i].prod].rhs[j]].label + " " );                  
            }
            
            if( j == item_set[i].dot_offset )
                    jscco._print( "." );
            jscco._print( "</td>" );
            
            jscco._print( "</tr>" );
        }
        else if( mode == jscco.MODE_GEN_TEXT )
        {
            var out = new String();
            
            out += jscco.symbols[jscco.productions[item_set[i].prod].lhs].label;
                        
            for( j = out.length; j < 20; j++ )
                out += " ";
                
            out += " -> ";
            
            for( j = 0; j < jscco.productions[item_set[i].prod].rhs.length; j++ )
            {
                if( j == item_set[i].dot_offset )
                    out += ".";
                
                if( jscco.symbols[jscco.productions[item_set[i].prod].rhs[j]].kind == jscco.SYM_TERM )
                    out += " #" + jscco.symbols[jscco.productions[item_set[i].prod].rhs[j]].label + " ";
                else
                    out += " " + jscco.symbols[jscco.productions[item_set[i].prod].rhs[j]].label + " ";                 
            }
            
            if( j == item_set[i].dot_offset )
                out += ".";

            for( j = out.length; j < 60; j++ )
                out += " ";
            out += "{ ";
            
            for( j = 0; j < item_set[i].lookahead.length; j++ )
                out += "#" + jscco.symbols[item_set[i].lookahead[j]].label + " ";
                
            out += "}";
            
            jscco._print( out );
        }
    }
    
    if( mode == jscco.MODE_GEN_HTML )
        jscco._print( "</table>" );
},

/* -MODULE----------------------------------------------------------------------
JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   first.js
Author: Jan Max Meyer
Usage:  FIRST-set calculation

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.
----------------------------------------------------------------------------- */


/* -FUNCTION--------------------------------------------------------------------
    Function:       first()
    
    Author:         Jan Max Meyer
    
    Usage:          Computes the FIRST-sets for all non-terminals of the
                    grammar. Must be called right after the parse and before
                    the table generation methods are performed.
                    
    Parameters:     void
    
    Returns:        void
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
    25.08.2008  Jan Max Meyer   Here was a bad bug that sometimes came up when
                                nonterminals are nullable. An example is the
                                grammar
                                
                                "A" "B";
                                ##
                                x: y "B";
                                y: y "A" | ;
                                
                                Now it works... embarrassing bug... ;(
----------------------------------------------------------------------------- */
first: function (){
    var cnt         = 0,
        old_cnt     = 0;
    var nullable;

    do
    {
        old_cnt = cnt;
        cnt = 0;
        
        for( var i = 0; i < jscco.symbols.length; i++ )
        {
            if( jscco.symbols[i].kind == jscco.SYM_NONTERM )
            {
                for( var j = 0; j < jscco.symbols[i].prods.length; j++ )
                {
                    nullable = false;
                    for( var k = 0; k < jscco.productions[jscco.symbols[i].prods[j]].rhs.length; k++ )
                    {
                        jscco.symbols[i].first = jscco.union( jscco.symbols[i].first, jscco.symbols[jscco.productions[jscco.symbols[i].prods[j]].rhs[k]].first );

                        nullable = jscco.symbols[jscco.productions[jscco.symbols[i].prods[j]].rhs[k]].nullable;
                        if( !nullable )
                            break;
                    }
                    cnt += jscco.symbols[i].first.length;
                    
                    if( k == jscco.productions[jscco.symbols[i].prods[j]].rhs.length )
                        nullable = true;

                    jscco.symbols[i].nullable |= nullable;
                }
            }
        }
        
        //jscco._print( "first: cnt = " + cnt + " old_cnt = " + old_cnt + "<br />" );
    }
    while( cnt != old_cnt );
},

/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.rhs_first()
    
    Author:         Jan Max Meyer
    
    Usage:          Returns all terminals that are possible from a given position
                    of a production's right-hand side.
                    
    Parameters:     item            Item to which the lookaheads are added to.
                    p               The production where the computation should
                                    be done on.
                    begin           The offset of the symbol where jscco.rhs_first()
                                    begins its calculation from.
    
    Returns:        true            If the whole rest of the right-hand side can
                                    be null (epsilon),
                    false           else.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
rhs_first: function ( item, p, begin ) {
    var f, i, nullable = true;
    for( i = begin; i < p.rhs.length; i++ )
    {
        item.lookahead = jscco.union( item.lookahead, jscco.symbols[p.rhs[i]].first );
        
        if( !jscco.symbols[p.rhs[i]].nullable )
            nullable = false;
        
        if( !nullable )
            break;
    }
    
    return nullable;
},

/* -MODULE----------------------------------------------------------------------
JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   printtab.js
Author: Jan Max Meyer
Usage:  Functions for printing the parse tables and related functions.

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.
----------------------------------------------------------------------------- */


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.print_parse_tables()
    
    Author:         Jan Max Meyer
    
    Usage:          Prints the parse tables in a desired format.
                    
    Parameters:     mode                    The output mode. This can be either
                                            jscco.MODE_GEN_JS to create JavaScript/
                                            JScript code as output or jscco.MODE_GEN_HTML
                                            to create HTML-tables as output
                                            (the HTML-tables are formatted to
                                            look nice with the JS/CC Web
                                            Environment).
    
    Returns:        code                    The code to be printed to a file or
                                            web-site.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
print_parse_tables: function ( mode ) {
    var code    = new String();
    var i, j, deepest = 0, val;
    
    /* Printing the pop table */
    if( mode == jscco.MODE_GEN_HTML )
    {
        code += "<table class=\"print\" cellpadding=\"0\" cellspacing=\"0\">";
        code += "<tr>";
        code += "<td class=\"tabtitle\" colspan=\"2\">Pop-Table</td>";
        code += "</tr>";
        code += "<td class=\"coltitle\" width=\"1%\" style=\"border-right: 1px solid lightgray;\">Left-hand side</td>";
        code += "<td class=\"coltitle\">Number of symbols to pop</td>";
        code += "</tr>";
    }
    else if( mode == jscco.MODE_GEN_JS )
    {
        code += "/* Pop-Table */\n";
        code += "var pop_tab = new Array(\n";
    }
    
    for( i = 0; i < jscco.productions.length; i++ )
    {
        if( mode == jscco.MODE_GEN_HTML )
        {
            code += "<tr>";
            code += "<td style=\"border-right: 1px solid lightgray;\">" + jscco.productions[i].lhs + "</td>";
            code += "<td>" + jscco.productions[i].rhs.length + "</td>";
            code += "</tr>";
        }
        else if( mode == jscco.MODE_GEN_JS )
        {
            code += "\tnew Array( " + jscco.productions[i].lhs + "/* " + jscco.symbols[jscco.productions[i].lhs].label + " */, "
                + jscco.productions[i].rhs.length + " )" +
                    (( i < jscco.productions.length-1 ) ? ",\n" : "\n");
        }
    }
    
    if( mode == jscco.MODE_GEN_HTML )
    {
        code += "</table>";
    }
    else if( mode == jscco.MODE_GEN_JS )
    {
        code += ");\n\n";
    }
    
    /* Printing the action table */         
    if( mode == jscco.MODE_GEN_HTML )
    {
        for( i = 0; i < jscco.symbols.length; i++ )
            if( jscco.symbols[i].kind == jscco.SYM_TERM )
                deepest++;
        
        code += "<table class=\"print\" cellpadding=\"0\" cellspacing=\"0\">";
        code += "<tr>";
        code += "<td class=\"tabtitle\" colspan=\"" + (deepest + 1) + "\">Action-Table</td>";
        code += "</tr>";
        
        code += "<td class=\"coltitle\" width=\"1%\" style=\"border-right: 1px solid lightgray;\">State</td>";
        for( i = 0; i < jscco.symbols.length; i++ )
        {
            if( jscco.symbols[i].kind == jscco.SYM_TERM )
                code += "<td><b>" + jscco.symbols[i].label + "</b></td>";
        }
        
        code += "</tr>";
        
        for( i = 0; i < jscco.states.length; i++ )
        {
            code += "<tr>" ;
            code += "<td class=\"coltitle\" style=\"border-right: 1px solid lightgray;\">" + i + "</td>";
            
            for( j = 0; j < jscco.symbols.length; j++ )
            {
                if( jscco.symbols[j].kind == jscco.SYM_TERM )
                {
                    code += "<td>";
                    if( ( val = jscco.get_table_entry( jscco.states[i].actionrow, j ) ) != void(0) )
                    {
                        if( val <= 0 )
                            code += "r" + (val * -1);
                        else
                            code += "s" + val;
                    }
                    code += "</td>";
                }
            }
            
            code += "</tr>" ;
        }
        
        code += "</table>";
        
    }
    else if( mode == jscco.MODE_GEN_JS )
    {
        code += "/* Action-Table */\n";
        code += "var act_tab = new Array(\n";
        
        for( i = 0; i < jscco.states.length; i++ )
        {
            code += "\t/* State " + i + " */ new Array( "
            for( j = 0; j < jscco.states[i].actionrow.length; j++ )
                code += jscco.states[i].actionrow[j][0] + "/* \"" + 
                    jscco.symbols[jscco.states[i].actionrow[j][0]].label + "\" */," + jscco.states[i].actionrow[j][1]
                        + ( ( j < jscco.states[i].actionrow.length-1 ) ? " , " : "" );
            
            code += " )" + ( ( i < jscco.states.length-1 ) ? ",\n" : "\n" );
        }
        
        code += ");\n\n";
    }
    
    /* Printing the goto table */           
    if( mode == jscco.MODE_GEN_HTML )
    {
        for( i = 0; i < jscco.symbols.length; i++ )
            if( jscco.symbols[i].kind == jscco.SYM_NONTERM )
                deepest++;
        
        code += "<table class=\"print\" cellpadding=\"0\" cellspacing=\"0\">";
        code += "<tr>";
        code += "<td class=\"tabtitle\" colspan=\"" + (deepest + 1) + "\">Goto-Table</td>";
        code += "</tr>";
        
        code += "<td class=\"coltitle\" width=\"1%\" style=\"border-right: 1px solid lightgray;\">State</td>";
        for( i = 0; i < jscco.symbols.length; i++ )
        {
            if( jscco.symbols[i].kind == jscco.SYM_NONTERM )
                code += "<td>" + jscco.symbols[i].label + "</td>";
        }
        
        code += "</tr>";
        
        for( i = 0; i < jscco.states.length; i++ )
        {
            code += "<tr>" ;
            code += "<td class=\"coltitle\" style=\"border-right: 1px solid lightgray;\">" + i + "</td>";
            
            for( j = 0; j < jscco.symbols.length; j++ )
            {
                if( jscco.symbols[j].kind == jscco.SYM_NONTERM )
                {
                    code += "<td>";
                    if( ( val = jscco.get_table_entry( jscco.states[i].gotorow, j ) ) != void(0) )
                    {
                        code += val;
                    }
                    code += "</td>";
                }
            }
            
            code += "</tr>" ;
        }
        
        code += "</table>";
        
    }
    else if( mode == jscco.MODE_GEN_JS )
    {
        code += "/* Goto-Table */\n";
        code += "var goto_tab = new Array(\n";
        
        for( i = 0; i < jscco.states.length; i++ )
        {
            code += "\t/* State " + i + " */";
            code += " new Array( "
                            
            for( j = 0; j < jscco.states[i].gotorow.length; j++ )
                code += jscco.states[i].gotorow[j][0] + "/* " + jscco.symbols[ jscco.states[i].gotorow[j][0] ].label + " */,"
                    + jscco.states[i].gotorow[j][1] + ( ( j < jscco.states[i].gotorow.length-1 ) ? " , " : "" );
            
            code += " )" + ( ( i < jscco.states.length-1 ) ? ",\n" : "\n" );
        }
        
        code += ");\n\n";
    }
    
    return code;
},

/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.print_dfa_table()
    
    Author:         Jan Max Meyer
    
    Usage:          Generates a state-machine construction from the deterministic
                    finite automata.
                    
    Parameters:     jscco.dfa_states              The dfa state machine for the lexing
                                            function.
    
    Returns:        code                    The code to be inserted into the
                                            static parser driver framework.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
print_dfa_table: function ( dfa_states ) {
    var code = new String();
    var i, j, k, eof_id = -1;
    var grp_start, grp_first, first;
    
    code += "switch( state )\n"
    code += "{\n";
    for( i = 0; i < dfa_states.length; i++ )
    {
        code += "   case " + i + ":\n";
        
        first = true;
        for( j = 0; j < dfa_states.length; j++ )
        {
            grp_start = -1;
            grp_first = true;
            for( k = 0; k < dfa_states[i].line.length + 1; k++ )
            {
                if( k < dfa_states[i].line.length && dfa_states[i].line[k] == j )
                {
                    if( grp_start == -1 )
                        grp_start = k;
                }
                else if( grp_start > -1 )
                {
                    if( grp_first )
                    {
                        code += "       ";
                        if( !first )
                            code += "else ";
                        code += "if( ";
                        
                        grp_first = false;
                        first = false;
                    }
                    else
                        code += " || ";
                    
                    if( grp_start == k - 1 )
                        code += "info.src.charCodeAt( pos ) == " + grp_start;
                    else                    
                        code += "( info.src.charCodeAt( pos ) >= " + grp_start +
                                    " && info.src.charCodeAt( pos ) <= " + (k-1) + " )";
                    grp_start = -1;
                    k--;
                }
            }
            
            if( !grp_first )
                code += " ) state = " + j + ";\n";
        }
                
        code += "       ";
        if( !first )
            code += "else ";
        code += "state = -1;\n"
        
        if( dfa_states[i].accept > -1 )
        {
            code += "       match = " + dfa_states[i].accept + ";\n";
            code += "       match_pos = pos;\n";
        }
        
        code += "       break;\n\n";
    }
    
    code += "}\n\n";

    return code;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.print_symbol_labels()
    
    Author:         Jan Max Meyer
    
    Usage:          Prints all symbol labels into an array; This is used for
                    error reporting purposes only in the resulting parser.
                    
    Parameters:     void
    
    Returns:        code                    The code to be inserted into the
                                            static parser driver framework.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
print_symbol_labels: function () {
    var code = new String();
    var i;  
    
    code += "/* Symbol labels */\n";
    code += "var labels = new Array(\n";
    for( i = 0; i < jscco.symbols.length; i++ )
    {
        code += "\t\"" + jscco.symbols[i].label + "\" ";
        
        if( jscco.symbols[i].kind == jscco.SYM_TERM )
            code += "/* Terminal symbol */";
        else
            code += "/* Non-terminal symbol */";
            
        if( i < jscco.symbols.length-1 )
            code += ",";
            
        code += "\n";
    }

    code += ");\n\n";

    return code;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.print_term_actions()
    
    Author:         Jan Max Meyer
    
    Usage:          Prints the terminal symbol actions to be associated with a
                    terminal definition into a switch-case-construct.
                    
    Parameters:     void
    
    Returns:        code                    The code to be inserted into the
                                            static parser driver framework.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
    22.08.2008  Jan Max Meyer   Bugfix: %offset returned the offset BEHIND the
                                terminal, now it's the correct value; %source,
                                which was documented in the manual since v0.24
                                was not implemented.
----------------------------------------------------------------------------- */
print_term_actions: function () {
    var code = new String();
    var re = new RegExp( "%match|%offset|%source" );
    var i, j, k;    
    var matches = 0;
    var semcode;
    var strmatch;
    
    code += "switch( match )\n"
    code += "{\n";
    for( i = 0; i < jscco.symbols.length; i++ )
    {
        if( jscco.symbols[i].kind == jscco.SYM_TERM
            && jscco.symbols[i].code != "" )
        {
            code += "   case " + i + ":\n";
            code += "       {\n";
            
            semcode = new String();
            for( j = 0, k = 0; j < jscco.symbols[i].code.length; j++, k++ )
            {
                strmatch = re.exec( jscco.symbols[i].code.substr( j, jscco.symbols[i].code.length ) );
                if( strmatch && strmatch.index == 0 )
                {
                    if( strmatch[0] == "%match" )
                        semcode += "info.att";
                    else if( strmatch[0] == "%offset" )
                        semcode += "( info.offset - info.att.length )";
                    else if( strmatch[0] == "%source" )
                        semcode += "info.src";
                    
                    j += strmatch[0].length - 1;
                    k = semcode.length;
                }
                else
                    semcode += jscco.symbols[i].code.charAt( j );
            }

            code += "       " + semcode + "\n";
            
            code += "       }\n";
            code += "       break;\n\n";
            
            matches++;
        }
    }
    
    code += "}\n\n";

    return ( matches == 0 ) ? (new String()) : code;
},

    
/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.print_actions()
    
    Author:         Jan Max Meyer
    
    Usage:          Generates a switch-case-construction that contains all
                    the semantic actions. This construction should then be
                    generated into the static parser driver template.
                    
    Parameters:     void
    
    Returns:        code                    The code to be inserted into the
                                            static parser driver framework.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
print_actions: function () {
    var code = new String();
    var re = new RegExp( "%[0-9]+|%%" );
    var semcode, strmatch;
    var i, j, k, idx;
    
    code += "switch( act )\n";
    code += "{\n";
    
    for( i = 0; i < jscco.productions.length; i++ )
    {
        code += "   case " + i + ":\n";
        code += "   {\n";
        
        semcode = new String();
        for( j = 0, k = 0; j < jscco.productions[i].code.length; j++, k++ )
        {
            strmatch = re.exec( jscco.productions[i].code.substr( j, jscco.productions[i].code.length ) );
            if( strmatch && strmatch.index == 0 )
            {
                if( strmatch[0] == "%%" )
                    semcode += "rval";
                else
                {
                    idx = parseInt( strmatch[0].substr( 1, strmatch[0].length ) );
                    idx = jscco.productions[i].rhs.length - idx + 1;
                    semcode += "vstack[ vstack.length - " + idx + " ]";
                }
                
                j += strmatch[0].length - 1;
                k = semcode.length;
            }
            else
            {
                semcode += jscco.productions[i].code.charAt( j );
            }
        }

        code += "       " + semcode + "\n";
        code += "   }\n";
        code += "   break;\n";
    }
    
    code += "}\n\n";

    return code;
},

/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.get_eof_symbol_id()
    
    Author:         Jan Max Meyer
    
    Usage:          Returns the value of the eof-symbol.
                    
    Parameters: 
        
    Returns:        eof_id                  The id of the EOF-symbol.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
get_eof_symbol_id: function () {
    var eof_id = -1;
    
    //Find out which symbol is for EOF! 
    for( var i = 0; i < jscco.symbols.length; i++ )
    {
        if( jscco.symbols[i].special == jscco.SPECIAL_EOF )
        {
            eof_id = i;
            break;
        }
    }

    if( eof_id == -1 )
        jscco._error( "No EOF-symbol defined - This might not be possible (bug!)" );
    
    return eof_id;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.get_error_symbol_id()
    
    Author:         Jan Max Meyer
    
    Usage:          Returns the value of the error-symbol.
                    
    Parameters: 
        
    Returns:        length                  The length of the symbol array.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
get_error_symbol_id: function ()
{
    return jscco.states.length + 1;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.get_whitespace_symbol_id()
    
    Author:         Jan Max Meyer
    
    Usage:          Returns the ID of the whitespace-symbol.
                    
    Parameters: 
        
    Returns:        whitespace              The id of the whitespace-symbol.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
get_whitespace_symbol_id: function ()
{
    return jscco.whitespace_token;
},

/* -MODULE----------------------------------------------------------------------
JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   tabgen.js
Author: Jan Max Meyer
Usage:  LALR(1) closure and table construction

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.
----------------------------------------------------------------------------- */

// --- Utility functions: I think there is no documentation necessary ;) ---
create_state: function ()
{
    var state = new jscco.STATE();
    
    state.kernel = new Array();
    state.epsilon = new Array();
    state.actionrow = new Array();
    state.gotorow = new Array();
    state.done = false;
    state.closed = false;

    jscco.states.push( state );
    
    return state;
},

create_item: function ( p )
{
    var item = new jscco.ITEM();
    
    item.prod = p;
    item.dot_offset = 0;
    item.lookahead = new Array();
    
    return item;
},

add_table_entry: function ( row, sym, act )
{
    var i;
    for( i = 0; i < row.length; i++ )
        if( row[i][0] == sym )
            return row;
    
    row.push( new Array( sym, act ) );
    return row;
},

update_table_entry: function ( row, sym, act )
{
    var i;
    for( i = 0; i < row.length; i++ )
        if( row[i][0] == sym )
        {
            row[i][1] = act;
            return row;
        }

    return row;
},

remove_table_entry: function ( row, sym )
{
    var i;
    for( i = 0; i < row.length; i++ )
        if( row[i][0] == sym )
        {
            row.splice( i, 1 );
            return row;
        }

    return row;
},

get_table_entry: function ( row, sym )
{
    var i;
    for( i = 0; i < row.length; i++ )
        if( row[i][0] == sym )
            return row[i][1];
    
    return void(0);
},

get_undone_state: function ()
{
    for( var i = 0; i < jscco.states.length; i++ )
    {
        if( jscco.states[i].done == false )
            return i;
    }
            
    return -1;
},

/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.find_symbol()
    
    Author:         Jan Max Meyer
    
    Usage:          Searches for a symbol using its label and kind.
                    
    Parameters:     label               The label of the symbol.
                    kind                Type of the symbol. This can be
                                        jscco.SYM_NONTERM or jscco.SYM_TERM
                    special             Specialized jscco.symbols 

    Returns:        The index of the desired object in the symbol table,
                    -1 if the symbol was not found.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
    16.11.2007  Jan Max Meyer   Allow to find eof_character
    19.11.2008  Jan Max Meyer   Special character checking
----------------------------------------------------------------------------- */
find_symbol: function ( label, kind, special )
{
    if( !special )
        special = jscco.SPECIAL_NO_SPECIAL;

    for( var i = 0; i < jscco.symbols.length; i++ )
    {
        if( jscco.symbols[i].label.toString() == label.toString()
            && jscco.symbols[i].kind == kind
                && jscco.symbols[i].special == special )
        {
            return i;
        }
    }
    
    return -1;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.create_symbol()
    
    Author:         Jan Max Meyer
    
    Usage:          Creates a new symbol (if necessary) and appends it to the
                    global symbol array. If the symbol does already exist, the
                    instance of that symbol is returned only.
                    
    Parameters:     label               The label of the symbol. In case of
                                        kind == jscco.SYM_NONTERM, the label is the
                                        name of the right-hand side, else it
                                        is the regular expression for the
                                        terminal symbol.
                    kind                Type of the symbol. This can be
                                        jscco.SYM_NONTERM or jscco.SYM_TERM
                    special             Specialized jscco.symbols 
    
    Returns:        The particular object of type SYMBOL.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
    16.11.2007  Jan Max Meyer   Bugfix: EOF-character is a special case!
    19.11.2008  Jan Max Meyer   Special character checking
----------------------------------------------------------------------------- */
create_symbol: function ( label, kind, special )
{
    var exists;
    
    if( ( exists = jscco.find_symbol( label, kind, special ) ) > -1 )
        return jscco.symbols[ exists ].id;
    
    var sym = new jscco.SYMBOL();
    sym.label = label;
    sym.kind = kind;
    sym.prods = new Array();
    sym.nullable = false;
    sym.id = jscco.symbols.length;
    sym.code = new String();
    
    sym.assoc = jscco.ASSOC_NONE; //Could be changed by grammar parser
    sym.level = 0; //Could be changed by grammar parser

    sym.special = special;
    
    //Flags
    sym.defined = false;

    sym.first = new Array();
    
    if( kind == jscco.SYM_TERM )
        sym.first.push( sym.id );

    jscco.symbols.push( sym );
    
    //jscco._print( "Creating new symbol " + sym.id + " kind = " + kind + " >" + label + "<" );
    
    return sym.id;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.item_set_equal()
    
    Author:         Jan Max Meyer
    
    Usage:          Checks if two item sets contain the same items. The items
                    may only differ in their lookahead.
                    
    Parameters:     set1                    Set to be compared with set2.
                    set2                    Set to be compared with set1.
    
    Returns:        true                    If equal,
                    false                   else.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
item_set_equal: function ( set1, set2 )
{
    var i, j, cnt = 0;
    
    if( set1.length != set2.length )
        return false;

    for( i = 0; i < set1.length; i++ )
    {
        for( j = 0; j < set2.length; j++ )
        {           
            if( set1[i].prod == set2[j].prod &&
                set1[i].dot_offset == set2[j].dot_offset )
            {
                cnt++;
                break;
            }
        }
    }
    
    if( cnt == set1.length )
        return true;
        
    return false;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.close_items()
    
    Author:         Jan Max Meyer
    
    Usage:          
                    
    Parameters:     
    
    Returns:        void
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
close_items: function ( seed, closure )
{
    var i, j, k;
    var cnt = 0, tmp_cnt = 0;
    var item;
    
    for( i = 0; i < seed.length; i++ )
    {
        if( seed[i].dot_offset < jscco.productions[seed[i].prod].rhs.length )
        {
            if( jscco.symbols[jscco.productions[seed[i].prod].rhs[seed[i].dot_offset]].kind == jscco.SYM_NONTERM )
            {
                for( j = 0; j < jscco.symbols[jscco.productions[seed[i].prod].rhs[seed[i].dot_offset]].prods.length; j++ )
                {
                    for( k = 0; k < closure.length; k++ )
                    {
                        if( closure[k].prod == jscco.symbols[jscco.productions[seed[i].prod].rhs[seed[i].dot_offset]].prods[j] )
                            break;
                    }
                    
                    if( k == closure.length )
                    {
                        item = jscco.create_item( jscco.symbols[jscco.productions[seed[i].prod].rhs[seed[i].dot_offset]].prods[j] );                                  
                        closure.push( item );
                        
                        cnt++;
                    }
                    
                    tmp_cnt = closure[k].lookahead.length;
                    if( jscco.rhs_first( closure[k], jscco.productions[seed[i].prod], seed[i].dot_offset+1 ) )
                        closure[k].lookahead = jscco.union( closure[k].lookahead, seed[i].lookahead );
                        
                    cnt += closure[k].lookahead.length - tmp_cnt;
                }
            }
        }
    }
    
    return cnt;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.lalr1_closure()
    
    Author:         Jan Max Meyer
    
    Usage:          Implements the LALR(1) closure algorithm. A short overview:
    
                    1. Closing a closure_set of jscco.ITEM() objects from a given
                       kernel seed (this includes the kernel seed itself!)
                    2. Moving all epsilon items to the current state's epsilon
                       set.
                    3. Moving all symbols with the same symbol right to the
                       dot to a partition set.
                    4. Check if there is already a state with the same items
                       as there are in the partition. If so, jscco.union the look-
                       aheads, else, create a new state and set the partition
                       as kernel seed.
                    5. If the (probably new state) was not closed yet, perform
                       some table creation: If there is a terminal to the
                       right of the dot, do a shift on the action table, else
                       do a goto on the goto table. Reductions are performed
                       later, when all states are closed.
                    
    Parameters:     s               Id of the state that should be closed.
    
    Returns:        void
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
lalr1_closure: function ( s )
{
    var closure = new Array(), nclosure, partition;
    var item, partition_sym;
    var i, j, k, l, cnt = 0, old_cnt = 0, tmp_cnt, ns;
    
    /*
    for( i = 0; i < jscco.states[s].kernel.length; i++ )
    {
        closure.push( new jscco.ITEM() );
        closure[i].prod = jscco.states[s].kernel[i].prod;
        closure[i].dot_offset = jscco.states[s].kernel[i].dot_offset;
        closure[i].lookahead = new Array();
    
        for( j = 0; j < jscco.states[s].kernel[i].lookahead.length; j++ )
            closure[i].lookahead[j] = jscco.states[s].kernel[i].lookahead[j];
    }
    */
        
    do
    {
        old_cnt = cnt;
        cnt = jscco.close_items( ( ( old_cnt == 0 ) ? jscco.states[s].kernel : closure ), closure );
        //jscco._print( "closure: cnt = " + cnt + " old_cnt = " + old_cnt + "<br />" );
    }
    while( cnt != old_cnt );
    
    for( i = 0; i < jscco.states[s].kernel.length; i++ )
    {
        if( jscco.states[s].kernel[i].dot_offset < jscco.productions[jscco.states[s].kernel[i].prod].rhs.length )
        {
            closure.unshift( new jscco.ITEM() );

            closure[0].prod = jscco.states[s].kernel[i].prod;
            closure[0].dot_offset = jscco.states[s].kernel[i].dot_offset;
            closure[0].lookahead = new Array();
        
            for( j = 0; j < jscco.states[s].kernel[i].lookahead.length; j++ )
                closure[0].lookahead[j] = jscco.states[s].kernel[i].lookahead[j];
        }
    }
    
    /*
    jscco.print_item_set( (jscco.exec_mode == jscco.EXEC_CONSOLE) ? jscco.MODE_GEN_TEXT : jscco.MODE_GEN_HTML,
        "closure in " + s, closure );
    jscco.print_item_set( (jscco.exec_mode == jscco.EXEC_CONSOLE) ? jscco.MODE_GEN_TEXT : jscco.MODE_GEN_HTML, 
        "jscco.states[" + s + "].epsilon", jscco.states[s].epsilon );
    */
    
    for( i = 0; i < closure.length; i++ )
    {
        if( jscco.productions[closure[i].prod].rhs.length == 0 )
        {
            for( j = 0; j < jscco.states[s].epsilon.length; j++ )
                if( jscco.states[s].epsilon[j].prod == closure[i].prod
                        && jscco.states[s].epsilon[j].dot_offset == closure[i].dot_offset )
                            break;
            
            if( j == jscco.states[s].epsilon.length )         
                jscco.states[s].epsilon.push( closure[i] );

            closure.splice( i, 1 );
        }
    }
    
    while( closure.length > 0 )
    {
        partition = new Array();
        nclosure = new Array();
        partition_sym = -1;
        
        for( i = 0; i < closure.length; i++ )
        {
            if( partition.length == 0 )
                partition_sym = jscco.productions[closure[i].prod].rhs[closure[i].dot_offset];
                        
            if( closure[i].dot_offset < jscco.productions[closure[i].prod].rhs.length )
            {
            
                //jscco._print( jscco.productions[closure[i].prod].rhs[closure[i].dot_offset] + " " + partition_sym + "<br />" );
                if( jscco.productions[closure[i].prod].rhs[closure[i].dot_offset] == partition_sym )
                {
                    closure[i].dot_offset++;
                    partition.push( closure[i] );
                }
                else
                    nclosure.push( closure[i] );
            }
        }
        
        //jscco.print_item_set( "partition " + s, partition );
        
        if( partition.length > 0 )
        {
            for( i = 0; i < jscco.states.length; i++ )
            {   
                if( jscco.item_set_equal( jscco.states[i].kernel, partition ) )
                    break;
            }
            
            if( i == jscco.states.length )
            {               
                ns = jscco.create_state();
                //jscco._print( "Generating state " + (jscco.states.length - 1) );
                ns.kernel = partition;
            }
            
            tmp_cnt = 0;
            cnt = 0;
            
            for( j = 0; j < partition.length; j++ )
            {
                tmp_cnt += jscco.states[i].kernel[j].lookahead.length;
                jscco.states[i].kernel[j].lookahead = jscco.union( jscco.states[i].kernel[j].lookahead,
                                                    partition[j].lookahead );

                cnt += jscco.states[i].kernel[j].lookahead.length;
            }                   
            
            if( tmp_cnt != cnt )
                jscco.states[i].done = false;
            
            //jscco._print( "<br />jscco.states[" + s + "].closed = " + jscco.states[s].closed );
            if( !(jscco.states[s].closed) )
            {
                for( j = 0; j < partition.length; j++ )
                {
                    //jscco._print( "<br />partition[j].dot_offset-1 = " + 
                    //  (partition[j].dot_offset-1) + " jscco.productions[partition[j].prod].rhs.length = " 
                    //      + jscco.productions[partition[j].prod].rhs.length );
                            
                    if( partition[j].dot_offset-1 < jscco.productions[partition[j].prod].rhs.length )
                    {
                        //jscco._print( "<br />symbols[jscco.productions[partition[j].prod].rhs[partition[j].dot_offset-1]].kind = " + 
                        //  symbols[jscco.productions[partition[j].prod].rhs[partition[j].dot_offset-1]].kind );
                        if( jscco.symbols[jscco.productions[partition[j].prod].rhs[partition[j].dot_offset-1]].kind
                                == jscco.SYM_TERM )
                        {
                            jscco.states[s].actionrow = jscco.add_table_entry( jscco.states[s].actionrow,
                                jscco.productions[partition[j].prod].rhs[partition[j].dot_offset-1], i );
                                
                            jscco.shifts++;
                        }
                        else
                        {
                            jscco.states[s].gotorow = jscco.add_table_entry( jscco.states[s].gotorow,
                                jscco.productions[partition[j].prod].rhs[partition[j].dot_offset-1], i );
                            
                            jscco.gotos++;
                        }
                    }
                }
            }
        }
        
        closure = nclosure;
    }
    
    jscco.states[s].closed = true;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.do_reductions()
    
    Author:         Jan Max Meyer
    
    Usage:          Inserts reduce-cells into the action table. A reduction
                    does always occur for items with the dot to the far right
                    of the production and to items with no production (epsilon
                    items).
                    The reductions are done on the corresponding lookahead
                    symbols. If a shift-reduce conflict appears, the function
                    will always behave in favor of the shift.
                    
                    Reduce-reduce conflicts are reported immediatelly, and need
                    to be solved.
                    
    Parameters:     item_set                The item set to work on.
                    s                       The index of the state where the
                                            reductions take effect.
    
    Returns:        void
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
do_reductions: function ( item_set, s )
{
    var i, j, ex, act, output_warning;
    for( i = 0; i < item_set.length; i++ )
    {
        if( item_set[i].dot_offset == jscco.productions[item_set[i].prod].rhs.length )
        {
            for( j = 0; j < item_set[i].lookahead.length; j++ )
            {
                output_warning = true;

                ex = jscco.get_table_entry( jscco.states[s].actionrow,
                        item_set[i].lookahead[j] );

                act = ex;
                if( ex == void(0) )
                {
                    jscco.states[s].actionrow = jscco.add_table_entry( jscco.states[s].actionrow,
                        item_set[i].lookahead[j], -1 * item_set[i].prod );
                        
                    jscco.reduces++;
                }
                else
                {
                    var warning = new String();
                    if( ex > 0 )
                    {
                        //Shift-reduce conflict

                        //Is there any level specified?
                        if( jscco.symbols[item_set[i].lookahead[j]].level > 0
                            || jscco.productions[ item_set[i].prod ].level > 0 )
                        {
                            //Is the level the same?
                            if( jscco.symbols[item_set[i].lookahead[j]].level ==
                                jscco.productions[ item_set[i].prod ].level )
                            {
                                //In case of left-associativity, reduce
                                if( jscco.symbols[item_set[i].lookahead[j]].assoc
                                        == jscco.ASSOC_LEFT )
                                {
                                    //Reduce
                                    act = -1 * item_set[i].prod;
                                }
                                //else, if nonassociativity is set,
                                //remove table entry.
                                else
                                if( jscco.symbols[item_set[i].lookahead[j]].assoc
                                        == jscco.ASSOC_NOASSOC )
                                {
                                    jscco.remove_table_entry( jscco.states[s].actionrow,
                                            item_set[i].lookahead[j] );

                                    jscco._warning(
                                        "Removing nonassociative symbol '"
                                         + jscco.symbols[item_set[i].lookahead[j]].label + "' in state " + s );

                                    output_warning = false;
                                }
                            }
                            else
                            {
                                //If symbol precedence is lower production's
                                //precedence, reduce
                                if( jscco.symbols[item_set[i].lookahead[j]].level <
                                        jscco.productions[ item_set[i].prod ].level )
                                    //Reduce
                                    act = -1 * item_set[i].prod;
                            }
                        }
                        
                        warning = "Shift";
                    }
                    else
                    {
                        //Reduce-reduce conflict
                        act = ( ( act * -1 < item_set[i].prod ) ?
                                    act : -1 * item_set[i].prod );
                        
                        warning = "Reduce";
                    }

                    warning += "-reduce conflict on symbol '" + jscco.symbols[item_set[i].lookahead[j]].label + "' in state " + s;
                    warning += "\n         Conflict resolved by " +
                                ( ( act <= 0 ) ? "reducing with production" : "shifting to state" )
                                    + " " + ( ( act <= 0 ) ? act * -1 : act );

                    if( output_warning )
                        jscco._warning( warning );

                    if( act != ex )
                        jscco.update_table_entry( jscco.states[s].actionrow,
                            item_set[i].lookahead[j], act );
                }               
            }
        }
    }
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.lalr1_parse_table()
    
    Author:         Jan Max Meyer
    
    Usage:          Entry function to perform table generation. If all states
                    of the parsing state machine are constructed, all reduce
                    operations are inserted in the particular positions of the
                    action table.
                    
                    If there is a Shift-reduce conflict, the shift takes the
                    higher precedence. Reduce-reduce conflics are resolved by
                    choosing the first defined production.
                    
    Parameters:     debug                   Toggle debug trace output; This
                                            should only be switched on when
                                            JS/CC is executed in a web environ-
                                            ment, because HTML-code will be
                                            printed.
    
    Returns:        void
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
lalr1_parse_table: function ( debug )
{
    var i, j, k, item, s, p;
    
    //Create EOF symbol
    item = jscco.create_item( 0 );
    s = jscco.create_symbol( "$", jscco.SYM_TERM, jscco.SPECIAL_EOF );
    item.lookahead.push( s );
    
    //Create first state
    s = jscco.create_state();
    s.kernel.push( item );
    
    while( ( i = jscco.get_undone_state() ) >= 0 )
    {
        jscco.states[i].done = true;
        jscco.lalr1_closure( i );
    }
    
    for( i = 0; i < jscco.states.length; i++ )
    {
        jscco.do_reductions( jscco.states[i].kernel, i );
        jscco.do_reductions( jscco.states[i].epsilon, i );
    }
    
    if( debug )
    {       
        for( i = 0; i < jscco.states.length; i++ )
        {
            jscco.print_item_set( (jscco.exec_mode == jscco.EXEC_CONSOLE) ? jscco.MODE_GEN_TEXT : jscco.MODE_GEN_HTML,
                "states[" + i + "].kernel", jscco.states[i].kernel );
            jscco.print_item_set( (jscco.exec_mode == jscco.EXEC_CONSOLE) ? jscco.MODE_GEN_TEXT : jscco.MODE_GEN_HTML,
                "states[" + i + "].epsilon", jscco.states[i].epsilon );
        }

        jscco._print( jscco.states.length + " States created." );
    }
},



/* -MODULE----------------------------------------------------------------------
JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   util.js
Author: Jan Max Meyer
Usage:  Utility functions used by several modules

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.
----------------------------------------------------------------------------- */


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.union()
    
    Author:         Jan Max Meyer
    
    Usage:          Unions the content of two arrays.
                    
    Parameters:     dest_array              The destination array.
                    src_array               The source array. Elements that are
                                            not in dest_array but in src_array
                                            are copied to dest_array.
    
    Returns:        The destination array, the jscco.union of both input arrays.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
union: function ( dest_array, src_array )
{
    var i, j;
    for( i = 0; i < src_array.length; i++ )
    {
        for( j = 0; j < dest_array.length; j++ )
        {
            if( src_array[i] == dest_array[j] )
                break;
        }
        
        if( j == dest_array.length )
            dest_array.push( src_array[i] );
    }
    
    return dest_array;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.reset_all()
    
    Author:         Jan Max Meyer
    
    Usage:          Resets all global variables. jscco.reset_all() should be called
                    each time a new grammar is compiled.
                    
    Parameters:     mode            Exec-mode; This can be either
                                    jscco.EXEC_CONSOLE or jscco.EXEC_WEB
    
    Returns:        void
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
reset_all: function ( mode )
{
    var p;
    
    jscco.assoc_level = 1;
    jscco.exec_mode = mode;

    jscco.symbols = new Array();
    jscco.productions = new Array();
    jscco.states = new Array();
    jscco.nfa_states = new Array();
    jscco.dfa_states = new Array();
    jscco.lex = new Array();
    
    jscco.create_symbol( "", jscco.SYM_NONTERM, jscco.SPECIAL_NO_SPECIAL );
    jscco.symbols[0].defined = true;
    
    p = new jscco.PROD();
    p.lhs = 0;
    p.rhs = new Array();
    p.code = new String( "%% = %1;" );
    jscco.symbols[0].prods.push( jscco.productions.length );
    jscco.productions.push( p );
    
    jscco.whitespace_token = -1;
    
    /*
    src = new String();
    src_off = 0;
    line = 1;
    lookahead = void(0);
    */
    
    jscco.errors = 0;
    jscco.show_errors = true;
    jscco.warnings = 0;
    jscco.show_warnings = false;
    
    jscco.shifts = 0;
    jscco.reduces = 0;
    jscco.gotos = 0;
    
    jscco.regex_weight = 0;
    
    jscco.code_head = new String();
    jscco.code_foot = new String();
},

/* -MODULE----------------------------------------------------------------------
JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   bitset.js
Author: Jan Max Meyer
Usage:  Bitset functionalities implemented in JavaScript.

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.
----------------------------------------------------------------------------- */

//I think there is no documentation required on these tiny functions...
bitset_create: function ( size )
{
    if( size <= 0 )
        return new Array();
    
    return new Array( Math.ceil( size / 8 ) );
},


bitset_set: function ( bitset, bit, state )
{
    if( !bitset && bit < 0 )
        return false;
        
    if( state )
        bitset[ Math.floor( bit / 8 ) ] |= ( 1 << (bit % 8) );
    else
        bitset[ Math.floor( bit / 8 ) ] &= ( 0xFF ^ ( 1 << (bit % 8) ) );
        
    return true;
},


bitset_get: function ( bitset, bit )
{
    if( !bitset && bit < 0 )
        return 0;

    return bitset[ Math.floor( bit / 8 ) ] & ( 1 << ( bit % 8 ) );
},


bitset_count: function ( bitset )
{
    var cnt = 0;

    for( var i = 0; i < bitset.length * 8; i++ )
        if( jscco.bitset_get( bitset, i ) )
            cnt++;
            
    return cnt;
},
/* -MODULE----------------------------------------------------------------------
JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   integrity.js
Author: Jan Max Meyer
Usage:  Checks the integrity of the grammar by performing several tests.

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.
----------------------------------------------------------------------------- */


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.undef()
    
    Author:         Jan Max Meyer
    
    Usage:          Checks if there are undefined non-terminals.
                    Prints an error message for each undefined non-terminal
                    that appears on a right-hand side.
                    
    Parameters:     void
    
    Returns:        void
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
undef: function ()
{
    var i;
    for( i = 0; i < jscco.symbols.length; i++ )
    {
        if( jscco.symbols[i].kind == jscco.SYM_NONTERM
            && jscco.symbols[i].defined == false )
            jscco._error( "Call to undefined non-terminal \"" +
                        jscco.symbols[i].label + "\"" );
    }
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.unreachable()
    
    Author:         Jan Max Meyer
    
    Usage:          Checks if there are unreachable jscco.productions.
                    
    Parameters:     void
    
    Returns:        void
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
unreachable: function ()
{
    var     stack       = new Array();
    var     reachable   = new Array();
    var     i, j, k, l;
    
    for( i = 0; i < jscco.symbols.length; i++ )
        if( jscco.symbols[i].kind == jscco.SYM_NONTERM )
            break;
            
    if( i == jscco.symbols.length )
        return;
        
    stack.push( i );
    reachable.push( i );
    
    while( stack.length > 0 )
    {
        i = stack.pop();
        for( j = 0; j < jscco.symbols[i].prods.length; j++ )
        {
            for( k = 0; k < jscco.productions[jscco.symbols[i].prods[j]].rhs.length; k++ )
            {
                if( jscco.symbols[ jscco.productions[jscco.symbols[i].prods[j]].rhs[k] ].kind
                            == jscco.SYM_NONTERM )
                {
                    for( l = 0; l < reachable.length; l++ )
                        if( reachable[l] == jscco.productions[jscco.symbols[i].prods[j]].rhs[k] )
                            break;
                            
                    if( l == reachable.length )
                    {
                        stack.push( jscco.productions[jscco.symbols[i].prods[j]].rhs[k] );
                        reachable.push( jscco.productions[jscco.symbols[i].prods[j]].rhs[k] );
                    }
                }
            }
        }
    }
    
    for( i = 0; i < jscco.symbols.length; i++ )
    {
        if( jscco.symbols[i].kind == jscco.SYM_NONTERM )
        {
            for( j = 0; j < reachable.length; j++ )
                if( reachable[j] == i )
                    break;
            
            if( j == reachable.length )
                jscco._warning( "Unreachable non-terminal \"" + jscco.symbols[i].label + "\"" );
        }
    }
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.check_empty_states()
    
    Author:         Jan Max Meyer
    
    Usage:          Checks if there are LALR(1) states that have no lookaheads
                    (no shifts or reduces) within their state row.
                    
    Parameters:     void
    
    Returns:        void
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
check_empty_states: function ()
{
    var i;
    for( i = 0; i < jscco.states.length; i++ )
        if( jscco.states[i].actionrow.length == 0 )
            jscco._error( "No lookaheads in state " + i + 
                        ", watch for endless list definitions" );
},
/* -MODULE----------------------------------------------------------------------
JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   lexdfa.js
Author: Jan Max Meyer
Usage:  Deterministic finite automation construction and minimization.

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.
----------------------------------------------------------------------------- */

//Utility functions; I think there is no documentation required about them.

create_dfa: function ( where )
{
    var dfa = new jscco.DFA();
    
    dfa.line = new Array( jscco.MAX_CHAR );
    dfa.accept = -1;
    dfa.nfa_set = new Array();
    dfa.done = false;
    dfa.group = -1;
    
    where.push( dfa );
    return where.length - 1;
},


same_nfa_items: function ( dfa_states, items )
{
    var i, j;
    for( i = 0; i < dfa_states.length; i++ )
        if( dfa_states[i].nfa_set.length == items.length )
        {
            for( j = 0; j < dfa_states[i].nfa_set.length; j++ )
                if( dfa_states[i].nfa_set[j] != items[j] )
                    break;
            
            if( j == dfa_states[i].nfa_set.length )
                return i;
        }
            
    return -1;
},


get_undone_dfa: function ( dfa_states )
{
    for( var i = 0; i < dfa_states.length; i++ )
        if( !dfa_states[i].done )
            return i;
            
    return -1;
},


//NFA test function; Has no use currently.
execute_nfa: function ( machine, str )
{
    var result      = new Array();
    var accept;
    var last_accept = new Array();
    var last_length = 0;
    var chr_cnt     = 0;

    if( machine.length == 0 )
        return -1;
        
    result.push( 0 );
    while( result.length > 0
        && chr_cnt < str.length )
    {
        accept = jscco.epsilon_closure( result, machine );
        
        if( accept.length > 0 )
        {
            last_accept = accept;
            last_length = chr_cnt;
        }
        
        result = jscco.move( result, machine, str.charCodeAt( chr_cnt ) );
        chr_cnt++;
    }
    
    return last_accept;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.move()
    
    Author:         Jan Max Meyer
    
    Usage:          Performs a move operation on a given input character from a
                    set of jscco.NFA states.
                    
    Parameters:     state_set               The set of epsilon-closure states
                                            on which base the move should be
                                            performed.
                    machine                 The jscco.NFA state machine.
                    ch                      A character code to be moved on.
    
    Returns:        If there is a possible move, a new set of jscco.NFA-states is
                    returned, else the returned array has a length of 0.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
move: function ( state_set, machine, ch )
{
    var hits    = new Array();
    var tos     = -1;
    
    do
    {
        tos = state_set.pop();
        if( machine[ tos ].edge == jscco.EDGE_CHAR )
            if( jscco.bitset_get( machine[ tos ].ccl, ch ) )
                hits.push( machine[ tos ].follow );     
    }
    while( state_set.length > 0 );
    
    return hits;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.epsilon_closure()
    
    Author:         Jan Max Meyer
    
    Usage:          Performs an epsilon closure from a set of jscco.NFA states.
                    
    Parameters:     state_set               The set of states on which base
                                            the closure is started.
                                            The whole epsilon closure will be
                                            appended to this parameter, so this
                                            parameter acts as input/output value.
                    machine                 The jscco.NFA state machine.
    
    Returns:        An array of accepting states, if available.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
epsilon_closure: function ( state_set, machine )
{
    var     stack   = new Array();
    var     accept  = new Array();
    var     tos     = -1;
    
    for( var i = 0; i < state_set.length; i++ )
        stack.push( state_set[i] );
    
    do
    {
        tos = stack.pop();
        if( machine[ tos ].accept >= 0 )
            accept.push( machine[ tos ].accept );
            
        if( machine[ tos ].edge == jscco.EDGE_EPSILON )
        {
            if( machine[ tos ].follow > -1 )
            {
                for( var i = 0; i < state_set.length; i++ )
                    if( state_set[i] == machine[ tos ].follow )
                        break;
                
                if( i == state_set.length )
                {
                    state_set.push( machine[ tos ].follow );
                    stack.push( machine[ tos ].follow );
                }
            }
            
            if( machine[ tos ].follow2 > -1 )
            {
                for( var i = 0; i < state_set.length; i++ )
                    if( state_set[i] == machine[ tos ].follow2 )
                        break;
                
                if( i == state_set.length )
                {
                    state_set.push( machine[ tos ].follow2 );
                    stack.push( machine[ tos ].follow2 );
                }
            }
        }
    }
    while( stack.length > 0 );
    
    return accept.sort();
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.create_subset()
    
    Author:         Jan Max Meyer
    
    Usage:          Constructs a deterministic finite automata (jscco.DFA) from a non-
                    deterministic finite automata, by using the subset construc-
                    tion algorithm.
                    
    Parameters:     jscco.nfa_states              The jscco.NFA-state machine on which base
                                            the jscco.DFA will be constructed.

    Returns:        An array of jscco.DFA-objects forming the new DFA-state machine.
                    This machine is not minimized here.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
create_subset: function ( nfa_states )
{
    var dfa_states = new Array();
    var stack = new Array();
    var current = jscco.create_dfa( dfa_states );
    var trans;
    var next = -1;
    var lowest_weight;
    
    if( nfa_states.length == 0 )
        return dfa_states;
        
    stack.push( 0 );
    jscco.epsilon_closure( stack, nfa_states );
        
    dfa_states[ current ].nfa_set = dfa_states[ current ].nfa_set.concat( stack );
    
    while( ( current = jscco.get_undone_dfa( dfa_states ) ) > -1 )
    {
        //jscco._print( "Next jscco.DFA-state to process is " + current );
        dfa_states[ current ].done = true;
        
        lowest_weight = -1;
        for( var i = 0; i < dfa_states[ current ].nfa_set.length; i++ )
        {
            if( nfa_states[ dfa_states[ current ].nfa_set[i] ].accept > -1
                    && nfa_states[ dfa_states[ current ].nfa_set[i] ].weight < lowest_weight 
                        || lowest_weight == -1 )
            {
                dfa_states[ current ].accept = nfa_states[ dfa_states[ current ].nfa_set[i] ].accept;
                lowest_weight = nfa_states[ dfa_states[ current ].nfa_set[i] ].weight;
            }
        }
            
        for( var i = jscco.MIN_CHAR; i < jscco.MAX_CHAR; i++ )
        {
            trans = new Array();
            trans = trans.concat( dfa_states[ current ].nfa_set );
            
            trans = jscco.move( trans, nfa_states, i );
            
            if( trans.length > 0 )
            {
                //jscco._print( "Character >" + String.fromCharCode( i ) + "< from " + dfa_states[ current ].nfa_set.join() + " to " + trans.join() );
                jscco.epsilon_closure( trans, nfa_states );
            }

            if( trans.length == 0 )
                next = -1;
            else if( ( next = jscco.same_nfa_items( dfa_states, trans ) ) == -1 )
            {               
                next = jscco.create_dfa( dfa_states );
                dfa_states[ next ].nfa_set = trans;
                
                //jscco._print( "Creating new state " + next );
            }
            
            dfa_states[ current ].line[ i ] = next;
        }
    }
    
    return dfa_states;
},


/* -FUNCTION--------------------------------------------------------------------
    Function:       jscco.create_subset()
    
    Author:         Jan Max Meyer
    
    Usage:          Minimizes a jscco.DFA, by grouping equivalent states together.
                    These groups form the new, minimized dfa-states.
                    
    Parameters:     dfa_states              The jscco.DFA-state machine on which base
                                            the minimized jscco.DFA is constructed.

    Returns:        An array of jscco.DFA-objects forming the minimized jscco.DFA-state
                    machine.
  
    ~~~ CHANGES & NOTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Date:       Author:         Note:
----------------------------------------------------------------------------- */
minimize_dfa: function ( dfa_states )
{
    var     groups          = new Array();
    var     group           = new Array();
    var     accept_groups   = new Array();
    var     min_dfa_states  = new Array();
    var     old_cnt         = 0;
    var     cnt             = 0;
    var     new_group;
    var     i, j, k;
    
    if( dfa_states.length == 0 )
        return min_dfa_states;

    /*
        Forming a general starting state:
        Accepting and non-accepting states are pushed in
        separate groups first
    */
    groups.push( new Array() );
    for( i = 0; i < dfa_states.length; i++ )
    {
        if( dfa_states[i].accept > -1 )
        {
            for( j = 0; j < accept_groups.length; j++ )
                if( accept_groups[j] == dfa_states[i].accept )
                    break;
            
            if( j == accept_groups.length )
            {
                accept_groups.push( dfa_states[i].accept );
                groups.push( new Array() );
            }
            groups[ j+1 ].push( i );
            dfa_states[ i ].group = j+1;
        }
        else
        {
            groups[ 0 ].push( i );
            dfa_states[ i ].group = 0;
        }
    }

    /*
        Now the minimization is performed on base of
        these default groups
    */
    do
    {
        old_cnt = cnt;

        for( i = 0; i < groups.length; i++ )
        {
            new_group = new Array();
            
            if( groups[i].length > 0 )
            {
                for( j = 1; j < groups[i].length; j++ )
                {
                    for( k = jscco.MIN_CHAR; k < jscco.MAX_CHAR; k++ )
                    {
                        /*
                            This verifies the equality of the
                            first state in this group with its
                            successors
                        */
                        if( dfa_states[ groups[i][0] ].line[k] !=
                                dfa_states[ groups[i][j] ].line[k] &&
                            ( dfa_states[ groups[i][0] ].line[k] == -1 ||
                                dfa_states[ groups[i][j] ].line[k] == -1 ) ||
                                    ( dfa_states[ groups[i][0] ].line[k] > -1 && 
                                            dfa_states[ groups[i][j] ].line[k] > -1 &&
                                        dfa_states[ dfa_states[ groups[i][0] ].line[k] ].group
                                            != dfa_states[ dfa_states[ groups[i][j] ].line[k] ].group ) )
                        {
                            /*
                                If this item does not match, but it to a new group
                            */
                            dfa_states[ groups[i][j] ].group = groups.length;
                            new_group = new_group.concat( groups[i].splice( j, 1 ) );
                            j--;
                            
                            break;
                        }
                    }
                }
            }

            if( new_group.length > 0 )
            {
                groups[ groups.length ] = new Array();
                groups[ groups.length-1 ] = groups[ groups.length-1 ].concat( new_group );
                cnt += new_group.length;
            }
        }
        
        //jscco._print( "old_cnt = " + old_cnt + " cnt = " + cnt );
        //jscco._print( "old_cnt = " + old_cnt + " cnt = " + cnt );
    }
    while( old_cnt != cnt );
    
    /*
        Updating the dfa-state transitions;
        Each group forms a new state.
    */
    for( i = 0; i < dfa_states.length; i++ )
        for( j = jscco.MIN_CHAR; j < jscco.MAX_CHAR; j++ )
            if( dfa_states[i].line[j] > -1 )
                dfa_states[i].line[j] = dfa_states[ dfa_states[i].line[j] ].group;

    for( i = 0; i < groups.length; i++ )            
        min_dfa_states.push( dfa_states[ groups[i][0] ] );

    return min_dfa_states;
},

/* -MODULE----------------------------------------------------------------------
JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   lexdbg.js
Author: Jan Max Meyer
Usage:  jscco.NFA/jscco.DFA state machines debugging/dumping functions

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.
----------------------------------------------------------------------------- */

print_nfa: function ( ta )
{
    jscco._print( "Pos\tType\t\tfollow\t\tfollow2\t\taccept" );
    jscco._print( "-------------------------------------------------------------------" );
    for( var i = 0; i < ta.length; i++ )
    {
        jscco._print( i + "\t" + ( ( jscco.nfa_states[i].edge == jscco.EDGE_FREE ) ? "FREE" :
            ( ( jscco.nfa_states[i].edge == jscco.EDGE_EPSILON ) ? "EPSILON" : "CHAR" ) ) + "\t\t" +
                ( ( jscco.nfa_states[i].edge != jscco.EDGE_FREE && jscco.nfa_states[i].follow > -1 ) ? jscco.nfa_states[i].follow : "" ) + "\t\t" +
                    ( ( jscco.nfa_states[i].edge != jscco.EDGE_FREE && jscco.nfa_states[i].follow2 > -1 ) ? jscco.nfa_states[i].follow2 : "" ) + "\t\t" +
                        ( ( jscco.nfa_states[i].edge != jscco.EDGE_FREE && jscco.nfa_states[i].accept > -1 ) ? jscco.nfa_states[i].accept : "" ) );
                        
        if( jscco.nfa_states[i].edge == jscco.EDGE_CHAR )
        {
            var chars = new String();
            for( var j = jscco.MIN_CHAR; j < jscco.MAX_CHAR; j++)
            {
                if( jscco.bitset_get( jscco.nfa_states[i].ccl, j ) )
                {
                    chars += String.fromCharCode( j );
                    if( chars.length == 10 )
                    {
                        jscco._print( "\t" + chars );
                        chars = "";
                    }
                }
            }
            
            if( chars.length > 0 )
                jscco._print( "\t" + chars );
        }
    }
    jscco._print( "" );
},

print_dfa: function ( dfa_states )
{
    var str = new String();
    var chr_cnt = 0;
    for( var i = 0; i < dfa_states.length; i++ )
    {
        str = i + " => (";
        
        chr_cnt = 0;
        for( var j = 0; j < dfa_states[i].line.length; j++ )
        {
            if( dfa_states[i].line[j] > -1 )
            {
                str += " >" + String.fromCharCode( j ) + "<," + dfa_states[i].line[j] + " ";
                chr_cnt++;
                
                if( ( chr_cnt % 5 ) == 0 )
                    str += "\n      ";
            }
        }
        
        str += ") " + dfa_states[i].accept;
        jscco._print( str );
    }
},

first_lhs: null,

/*
    Default template driver for JS/CC generated parsers running as
    browser-based JavaScript/ECMAScript applications.
    
    WARNING:    This parser template will not run as console and has lesser
                features for debugging than the console derivates for the
                various JavaScript platforms.
    
    Features:
    - Parser trace messages
    - Integrated panic-mode error recovery
    
    Written 2007, 2008 by Jan Max Meyer, J.M.K S.F. Software Technologies
    
    This is in the public domain.
*/

jscc_dbg_withtrace      : false,
jscc_dbg_string         : new String(),

__jsccdbg_print: function ( text ) { jscco.jscc_dbg_string += text + "\n"; },

__jscclex: function ( info )
{
    var state       = 0;
    var match       = -1;
    var match_pos   = 0;
    var start       = 0;
    var pos         = info.offset + 1;

    do
    {
        pos--;
        state = 0;
        match = -2;
        start = pos;

        if( info.src.length <= start )
            return 32;

        do
        {

switch( state )
{
    case 0:
        if( ( info.src.charCodeAt( pos ) >= 9 && info.src.charCodeAt( pos ) <= 10 ) || info.src.charCodeAt( pos ) == 13 || info.src.charCodeAt( pos ) == 32 ) state = 1;
        else if( info.src.charCodeAt( pos ) == 33 ) state = 2;
        else if( info.src.charCodeAt( pos ) == 38 ) state = 3;
        else if( info.src.charCodeAt( pos ) == 45 || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 4;
        else if( info.src.charCodeAt( pos ) == 58 ) state = 5;
        else if( info.src.charCodeAt( pos ) == 59 ) state = 6;
        else if( info.src.charCodeAt( pos ) == 60 ) state = 7;
        else if( info.src.charCodeAt( pos ) == 62 ) state = 8;
        else if( info.src.charCodeAt( pos ) == 94 ) state = 9;
        else if( info.src.charCodeAt( pos ) == 124 ) state = 10;
        else if( info.src.charCodeAt( pos ) == 34 ) state = 15;
        else if( info.src.charCodeAt( pos ) == 35 ) state = 18;
        else if( info.src.charCodeAt( pos ) == 39 ) state = 19;
        else if( info.src.charCodeAt( pos ) == 47 ) state = 20;
        else if( info.src.charCodeAt( pos ) == 91 ) state = 21;
        else state = -1;
        break;

    case 1:
        state = -1;
        match = 1;
        match_pos = pos;
        break;

    case 2:
        state = -1;
        match = 6;
        match_pos = pos;
        break;

    case 3:
        state = -1;
        match = 10;
        match_pos = pos;
        break;

    case 4:
        if( info.src.charCodeAt( pos ) == 45 || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 4;
        else state = -1;
        match = 14;
        match_pos = pos;
        break;

    case 5:
        state = -1;
        match = 8;
        match_pos = pos;
        break;

    case 6:
        state = -1;
        match = 7;
        match_pos = pos;
        break;

    case 7:
        state = -1;
        match = 3;
        match_pos = pos;
        break;

    case 8:
        state = -1;
        match = 4;
        match_pos = pos;
        break;

    case 9:
        state = -1;
        match = 5;
        match_pos = pos;
        break;

    case 10:
        state = -1;
        match = 9;
        match_pos = pos;
        break;

    case 11:
        state = -1;
        match = 13;
        match_pos = pos;
        break;

    case 12:
        state = -1;
        match = 2;
        match_pos = pos;
        break;

    case 13:
        state = -1;
        match = 12;
        match_pos = pos;
        break;

    case 14:
        state = -1;
        match = 11;
        match_pos = pos;
        break;

    case 15:
        if( info.src.charCodeAt( pos ) == 34 ) state = 11;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 33 ) || ( info.src.charCodeAt( pos ) >= 35 && info.src.charCodeAt( pos ) <= 91 ) || ( info.src.charCodeAt( pos ) >= 93 && info.src.charCodeAt( pos ) <= 254 ) ) state = 15;
        else if( info.src.charCodeAt( pos ) == 92 ) state = 22;
        else state = -1;
        break;

    case 16:
        if( info.src.charCodeAt( pos ) == 34 ) state = 11;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 33 ) || ( info.src.charCodeAt( pos ) >= 35 && info.src.charCodeAt( pos ) <= 91 ) || ( info.src.charCodeAt( pos ) >= 93 && info.src.charCodeAt( pos ) <= 254 ) ) state = 15;
        else if( info.src.charCodeAt( pos ) == 92 ) state = 22;
        else state = -1;
        match = 13;
        match_pos = pos;
        break;

    case 17:
        if( info.src.charCodeAt( pos ) == 39 ) state = 13;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 38 ) || ( info.src.charCodeAt( pos ) >= 40 && info.src.charCodeAt( pos ) <= 91 ) || ( info.src.charCodeAt( pos ) >= 93 && info.src.charCodeAt( pos ) <= 254 ) ) state = 19;
        else if( info.src.charCodeAt( pos ) == 92 ) state = 23;
        else state = -1;
        match = 12;
        match_pos = pos;
        break;

    case 18:
        if( info.src.charCodeAt( pos ) == 35 ) state = 12;
        else state = -1;
        break;

    case 19:
        if( info.src.charCodeAt( pos ) == 39 ) state = 13;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 38 ) || ( info.src.charCodeAt( pos ) >= 40 && info.src.charCodeAt( pos ) <= 91 ) || ( info.src.charCodeAt( pos ) >= 93 && info.src.charCodeAt( pos ) <= 254 ) ) state = 19;
        else if( info.src.charCodeAt( pos ) == 92 ) state = 23;
        else state = -1;
        break;

    case 20:
        if( info.src.charCodeAt( pos ) == 126 ) state = 24;
        else state = -1;
        break;

    case 21:
        if( info.src.charCodeAt( pos ) == 42 ) state = 32;
        else state = -1;
        break;

    case 22:
        if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 33 ) || ( info.src.charCodeAt( pos ) >= 35 && info.src.charCodeAt( pos ) <= 91 ) || ( info.src.charCodeAt( pos ) >= 93 && info.src.charCodeAt( pos ) <= 254 ) ) state = 15;
        else if( info.src.charCodeAt( pos ) == 34 ) state = 16;
        else if( info.src.charCodeAt( pos ) == 92 ) state = 22;
        else state = -1;
        break;

    case 23:
        if( info.src.charCodeAt( pos ) == 39 ) state = 17;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 38 ) || ( info.src.charCodeAt( pos ) >= 40 && info.src.charCodeAt( pos ) <= 91 ) || ( info.src.charCodeAt( pos ) >= 93 && info.src.charCodeAt( pos ) <= 254 ) ) state = 19;
        else if( info.src.charCodeAt( pos ) == 92 ) state = 23;
        else state = -1;
        break;

    case 24:
        if( info.src.charCodeAt( pos ) == 47 ) state = 25;
        else if( info.src.charCodeAt( pos ) == 126 ) state = 26;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 46 ) || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 125 ) || ( info.src.charCodeAt( pos ) >= 127 && info.src.charCodeAt( pos ) <= 254 ) ) state = 33;
        else state = -1;
        break;

    case 25:
        if( info.src.charCodeAt( pos ) == 47 ) state = 24;
        else state = -1;
        break;

    case 26:
        if( info.src.charCodeAt( pos ) == 47 ) state = 1;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 46 ) || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 254 ) ) state = 24;
        else state = -1;
        break;

    case 27:
        if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 41 ) || ( info.src.charCodeAt( pos ) >= 43 && info.src.charCodeAt( pos ) <= 254 ) ) state = 27;
        else if( info.src.charCodeAt( pos ) == 42 ) state = 28;
        else state = -1;
        break;

    case 28:
        if( info.src.charCodeAt( pos ) == 93 ) state = 14;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 92 ) || ( info.src.charCodeAt( pos ) >= 94 && info.src.charCodeAt( pos ) <= 254 ) ) state = 31;
        else state = -1;
        break;

    case 29:
        if( info.src.charCodeAt( pos ) == 93 ) state = 31;
        else state = -1;
        break;

    case 30:
        if( info.src.charCodeAt( pos ) == 126 ) state = 26;
        else if( info.src.charCodeAt( pos ) == 47 ) state = 30;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 46 ) || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 125 ) || ( info.src.charCodeAt( pos ) >= 127 && info.src.charCodeAt( pos ) <= 254 ) ) state = 33;
        else state = -1;
        break;

    case 31:
        if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 41 ) || ( info.src.charCodeAt( pos ) >= 43 && info.src.charCodeAt( pos ) <= 92 ) || ( info.src.charCodeAt( pos ) >= 94 && info.src.charCodeAt( pos ) <= 254 ) ) state = 27;
        else if( info.src.charCodeAt( pos ) == 42 ) state = 28;
        else if( info.src.charCodeAt( pos ) == 93 ) state = 29;
        else state = -1;
        break;

    case 32:
        if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 41 ) || ( info.src.charCodeAt( pos ) >= 43 && info.src.charCodeAt( pos ) <= 92 ) || ( info.src.charCodeAt( pos ) >= 94 && info.src.charCodeAt( pos ) <= 254 ) ) state = 27;
        else if( info.src.charCodeAt( pos ) == 42 ) state = 28;
        else if( info.src.charCodeAt( pos ) == 93 ) state = 29;
        else state = -1;
        break;

    case 33:
        if( info.src.charCodeAt( pos ) == 126 ) state = 26;
        else if( info.src.charCodeAt( pos ) == 47 ) state = 30;
        else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 46 ) || ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 125 ) || ( info.src.charCodeAt( pos ) >= 127 && info.src.charCodeAt( pos ) <= 254 ) ) state = 33;
        else state = -1;
        break;

}


            pos++;

        }
        while( state > -1 );

    }
    while( 1 > -1 && match == 1 );

    if( match > -1 )
    {
        info.att = info.src.substr( start, match_pos - start );
        info.offset = match_pos;
        

    }
    else
    {
        info.att = new String();
        match = -1;
    }

    return match;
},

__jsccparse: function ( src, err_off, err_la ) {
    var     sstack          = new Array();
    var     vstack          = new Array();
    var     err_cnt         = 0;
    var     act;
    var     go;
    var     la;
    var     rval;
    var     parseinfo       = new Function( "", "var offset; var src; var att;" );
    var     info            = new parseinfo();
    
/* Pop-Table */
var pop_tab = new Array(
    new Array( 0/* def' */, 1 ),
    new Array( 19/* def */, 5 ),
    new Array( 15/* header_code */, 1 ),
    new Array( 18/* footer_code */, 1 ),
    new Array( 16/* token_assocs */, 2 ),
    new Array( 16/* token_assocs */, 0 ),
    new Array( 21/* token_assoc */, 3 ),
    new Array( 21/* token_assoc */, 3 ),
    new Array( 21/* token_assoc */, 3 ),
    new Array( 21/* token_assoc */, 2 ),
    new Array( 21/* token_assoc */, 2 ),
    new Array( 22/* token_defs */, 2 ),
    new Array( 22/* token_defs */, 0 ),
    new Array( 24/* token_def */, 3 ),
    new Array( 24/* token_def */, 2 ),
    new Array( 17/* grammar_defs */, 2 ),
    new Array( 17/* grammar_defs */, 0 ),
    new Array( 26/* grammar_def */, 4 ),
    new Array( 27/* productions */, 3 ),
    new Array( 27/* productions */, 1 ),
    new Array( 28/* rhs */, 3 ),
    new Array( 30/* rhs_prec */, 2 ),
    new Array( 30/* rhs_prec */, 2 ),
    new Array( 30/* rhs_prec */, 0 ),
    new Array( 29/* sequence */, 2 ),
    new Array( 29/* sequence */, 0 ),
    new Array( 31/* symbol */, 1 ),
    new Array( 31/* symbol */, 1 ),
    new Array( 20/* code */, 2 ),
    new Array( 20/* code */, 0 ),
    new Array( 23/* string */, 1 ),
    new Array( 23/* string */, 1 ),
    new Array( 25/* identifier */, 1 )
);

/* Action-Table */
var act_tab = new Array(
    /* State 0 */ new Array( 3/* "<" */,-29 , 4/* ">" */,-29 , 5/* "^" */,-29 , 6/* "!" */,-29 , 7/* ";" */,-29 , 12/* "STRING_SINGLE" */,-29 , 13/* "STRING_DOUBLE" */,-29 , 2/* "##" */,-29 , 11/* "CODE" */,-29 ),
    /* State 1 */ new Array( 32/* "$" */,0 ),
    /* State 2 */ new Array( 2/* "##" */,-5 , 3/* "<" */,-5 , 4/* ">" */,-5 , 5/* "^" */,-5 , 6/* "!" */,-5 , 7/* ";" */,-5 , 12/* "STRING_SINGLE" */,-5 , 13/* "STRING_DOUBLE" */,-5 ),
    /* State 3 */ new Array( 11/* "CODE" */,5 , 3/* "<" */,-2 , 4/* ">" */,-2 , 5/* "^" */,-2 , 6/* "!" */,-2 , 7/* ";" */,-2 , 12/* "STRING_SINGLE" */,-2 , 13/* "STRING_DOUBLE" */,-2 , 2/* "##" */,-2 ),
    /* State 4 */ new Array( 2/* "##" */,7 , 3/* "<" */,8 , 4/* ">" */,9 , 5/* "^" */,10 , 6/* "!" */,12 , 7/* ";" */,-12 , 12/* "STRING_SINGLE" */,-12 , 13/* "STRING_DOUBLE" */,-12 ),
    /* State 5 */ new Array( 3/* "<" */,-28 , 4/* ">" */,-28 , 5/* "^" */,-28 , 6/* "!" */,-28 , 7/* ";" */,-28 , 12/* "STRING_SINGLE" */,-28 , 13/* "STRING_DOUBLE" */,-28 , 2/* "##" */,-28 , 11/* "CODE" */,-28 , 32/* "$" */,-28 , 9/* "|" */,-28 ),
    /* State 6 */ new Array( 2/* "##" */,-4 , 3/* "<" */,-4 , 4/* ">" */,-4 , 5/* "^" */,-4 , 6/* "!" */,-4 , 7/* ";" */,-4 , 12/* "STRING_SINGLE" */,-4 , 13/* "STRING_DOUBLE" */,-4 ),
    /* State 7 */ new Array( 11/* "CODE" */,-16 , 32/* "$" */,-16 , 14/* "IDENT" */,-16 ),
    /* State 8 */ new Array( 7/* ";" */,-12 , 12/* "STRING_SINGLE" */,-12 , 13/* "STRING_DOUBLE" */,-12 ),
    /* State 9 */ new Array( 7/* ";" */,-12 , 12/* "STRING_SINGLE" */,-12 , 13/* "STRING_DOUBLE" */,-12 ),
    /* State 10 */ new Array( 7/* ";" */,-12 , 12/* "STRING_SINGLE" */,-12 , 13/* "STRING_DOUBLE" */,-12 ),
    /* State 11 */ new Array( 7/* ";" */,18 , 12/* "STRING_SINGLE" */,20 , 13/* "STRING_DOUBLE" */,21 ),
    /* State 12 */ new Array( 12/* "STRING_SINGLE" */,20 , 13/* "STRING_DOUBLE" */,21 ),
    /* State 13 */ new Array( 14/* "IDENT" */,27 , 32/* "$" */,-29 , 11/* "CODE" */,-29 ),
    /* State 14 */ new Array( 7/* ";" */,28 , 12/* "STRING_SINGLE" */,20 , 13/* "STRING_DOUBLE" */,21 ),
    /* State 15 */ new Array( 7/* ";" */,29 , 12/* "STRING_SINGLE" */,20 , 13/* "STRING_DOUBLE" */,21 ),
    /* State 16 */ new Array( 7/* ";" */,30 , 12/* "STRING_SINGLE" */,20 , 13/* "STRING_DOUBLE" */,21 ),
    /* State 17 */ new Array( 7/* ";" */,-11 , 12/* "STRING_SINGLE" */,-11 , 13/* "STRING_DOUBLE" */,-11 ),
    /* State 18 */ new Array( 2/* "##" */,-9 , 3/* "<" */,-9 , 4/* ">" */,-9 , 5/* "^" */,-9 , 6/* "!" */,-9 , 7/* ";" */,-9 , 12/* "STRING_SINGLE" */,-9 , 13/* "STRING_DOUBLE" */,-9 ),
    /* State 19 */ new Array( 14/* "IDENT" */,27 , 7/* ";" */,-29 , 12/* "STRING_SINGLE" */,-29 , 13/* "STRING_DOUBLE" */,-29 , 11/* "CODE" */,-29 ),
    /* State 20 */ new Array( 14/* "IDENT" */,-30 , 11/* "CODE" */,-30 , 7/* ";" */,-30 , 12/* "STRING_SINGLE" */,-30 , 13/* "STRING_DOUBLE" */,-30 , 2/* "##" */,-30 , 3/* "<" */,-30 , 4/* ">" */,-30 , 5/* "^" */,-30 , 6/* "!" */,-30 , 10/* "&" */,-30 , 9/* "|" */,-30 ),
    /* State 21 */ new Array( 14/* "IDENT" */,-31 , 11/* "CODE" */,-31 , 7/* ";" */,-31 , 12/* "STRING_SINGLE" */,-31 , 13/* "STRING_DOUBLE" */,-31 , 2/* "##" */,-31 , 3/* "<" */,-31 , 4/* ">" */,-31 , 5/* "^" */,-31 , 6/* "!" */,-31 , 10/* "&" */,-31 , 9/* "|" */,-31 ),
    /* State 22 */ new Array( 2/* "##" */,-10 , 3/* "<" */,-10 , 4/* ">" */,-10 , 5/* "^" */,-10 , 6/* "!" */,-10 , 7/* ";" */,-10 , 12/* "STRING_SINGLE" */,-10 , 13/* "STRING_DOUBLE" */,-10 ),
    /* State 23 */ new Array( 11/* "CODE" */,-15 , 32/* "$" */,-15 , 14/* "IDENT" */,-15 ),
    /* State 24 */ new Array( 32/* "$" */,-1 ),
    /* State 25 */ new Array( 11/* "CODE" */,5 , 32/* "$" */,-3 ),
    /* State 26 */ new Array( 8/* ":" */,33 ),
    /* State 27 */ new Array( 8/* ":" */,-32 , 11/* "CODE" */,-32 , 7/* ";" */,-32 , 12/* "STRING_SINGLE" */,-32 , 13/* "STRING_DOUBLE" */,-32 , 10/* "&" */,-32 , 9/* "|" */,-32 , 14/* "IDENT" */,-32 ),
    /* State 28 */ new Array( 2/* "##" */,-6 , 3/* "<" */,-6 , 4/* ">" */,-6 , 5/* "^" */,-6 , 6/* "!" */,-6 , 7/* ";" */,-6 , 12/* "STRING_SINGLE" */,-6 , 13/* "STRING_DOUBLE" */,-6 ),
    /* State 29 */ new Array( 2/* "##" */,-7 , 3/* "<" */,-7 , 4/* ">" */,-7 , 5/* "^" */,-7 , 6/* "!" */,-7 , 7/* ";" */,-7 , 12/* "STRING_SINGLE" */,-7 , 13/* "STRING_DOUBLE" */,-7 ),
    /* State 30 */ new Array( 2/* "##" */,-8 , 3/* "<" */,-8 , 4/* ">" */,-8 , 5/* "^" */,-8 , 6/* "!" */,-8 , 7/* ";" */,-8 , 12/* "STRING_SINGLE" */,-8 , 13/* "STRING_DOUBLE" */,-8 ),
    /* State 31 */ new Array( 11/* "CODE" */,5 , 7/* ";" */,-14 , 12/* "STRING_SINGLE" */,-14 , 13/* "STRING_DOUBLE" */,-14 ),
    /* State 32 */ new Array( 7/* ";" */,-29 , 12/* "STRING_SINGLE" */,-29 , 13/* "STRING_DOUBLE" */,-29 , 11/* "CODE" */,-29 ),
    /* State 33 */ new Array( 10/* "&" */,-25 , 11/* "CODE" */,-25 , 7/* ";" */,-25 , 9/* "|" */,-25 , 14/* "IDENT" */,-25 , 12/* "STRING_SINGLE" */,-25 , 13/* "STRING_DOUBLE" */,-25 ),
    /* State 34 */ new Array( 11/* "CODE" */,5 , 7/* ";" */,-13 , 12/* "STRING_SINGLE" */,-13 , 13/* "STRING_DOUBLE" */,-13 ),
    /* State 35 */ new Array( 9/* "|" */,38 , 7/* ";" */,39 ),
    /* State 36 */ new Array( 7/* ";" */,-19 , 9/* "|" */,-19 ),
    /* State 37 */ new Array( 10/* "&" */,42 , 14/* "IDENT" */,27 , 12/* "STRING_SINGLE" */,20 , 13/* "STRING_DOUBLE" */,21 , 11/* "CODE" */,-23 , 7/* ";" */,-23 , 9/* "|" */,-23 ),
    /* State 38 */ new Array( 10/* "&" */,-25 , 11/* "CODE" */,-25 , 7/* ";" */,-25 , 9/* "|" */,-25 , 14/* "IDENT" */,-25 , 12/* "STRING_SINGLE" */,-25 , 13/* "STRING_DOUBLE" */,-25 ),
    /* State 39 */ new Array( 11/* "CODE" */,-17 , 32/* "$" */,-17 , 14/* "IDENT" */,-17 ),
    /* State 40 */ new Array( 10/* "&" */,-24 , 11/* "CODE" */,-24 , 7/* ";" */,-24 , 9/* "|" */,-24 , 14/* "IDENT" */,-24 , 12/* "STRING_SINGLE" */,-24 , 13/* "STRING_DOUBLE" */,-24 ),
    /* State 41 */ new Array( 7/* ";" */,-29 , 9/* "|" */,-29 , 11/* "CODE" */,-29 ),
    /* State 42 */ new Array( 14/* "IDENT" */,27 , 12/* "STRING_SINGLE" */,20 , 13/* "STRING_DOUBLE" */,21 ),
    /* State 43 */ new Array( 10/* "&" */,-26 , 11/* "CODE" */,-26 , 7/* ";" */,-26 , 9/* "|" */,-26 , 14/* "IDENT" */,-26 , 12/* "STRING_SINGLE" */,-26 , 13/* "STRING_DOUBLE" */,-26 ),
    /* State 44 */ new Array( 10/* "&" */,-27 , 11/* "CODE" */,-27 , 7/* ";" */,-27 , 9/* "|" */,-27 , 14/* "IDENT" */,-27 , 12/* "STRING_SINGLE" */,-27 , 13/* "STRING_DOUBLE" */,-27 ),
    /* State 45 */ new Array( 7/* ";" */,-18 , 9/* "|" */,-18 ),
    /* State 46 */ new Array( 11/* "CODE" */,5 , 7/* ";" */,-20 , 9/* "|" */,-20 ),
    /* State 47 */ new Array( 11/* "CODE" */,-22 , 7/* ";" */,-22 , 9/* "|" */,-22 ),
    /* State 48 */ new Array( 11/* "CODE" */,-21 , 7/* ";" */,-21 , 9/* "|" */,-21 )
);

/* Goto-Table */
var goto_tab = new Array(
    /* State 0 */ new Array( 19/* def */,1 , 15/* header_code */,2 , 20/* code */,3 ),
    /* State 1 */ new Array(  ),
    /* State 2 */ new Array( 16/* token_assocs */,4 ),
    /* State 3 */ new Array(  ),
    /* State 4 */ new Array( 21/* token_assoc */,6 , 22/* token_defs */,11 ),
    /* State 5 */ new Array(  ),
    /* State 6 */ new Array(  ),
    /* State 7 */ new Array( 17/* grammar_defs */,13 ),
    /* State 8 */ new Array( 22/* token_defs */,14 ),
    /* State 9 */ new Array( 22/* token_defs */,15 ),
    /* State 10 */ new Array( 22/* token_defs */,16 ),
    /* State 11 */ new Array( 24/* token_def */,17 , 23/* string */,19 ),
    /* State 12 */ new Array( 23/* string */,22 ),
    /* State 13 */ new Array( 26/* grammar_def */,23 , 18/* footer_code */,24 , 20/* code */,25 , 25/* identifier */,26 ),
    /* State 14 */ new Array( 24/* token_def */,17 , 23/* string */,19 ),
    /* State 15 */ new Array( 24/* token_def */,17 , 23/* string */,19 ),
    /* State 16 */ new Array( 24/* token_def */,17 , 23/* string */,19 ),
    /* State 17 */ new Array(  ),
    /* State 18 */ new Array(  ),
    /* State 19 */ new Array( 20/* code */,31 , 25/* identifier */,32 ),
    /* State 20 */ new Array(  ),
    /* State 21 */ new Array(  ),
    /* State 22 */ new Array(  ),
    /* State 23 */ new Array(  ),
    /* State 24 */ new Array(  ),
    /* State 25 */ new Array(  ),
    /* State 26 */ new Array(  ),
    /* State 27 */ new Array(  ),
    /* State 28 */ new Array(  ),
    /* State 29 */ new Array(  ),
    /* State 30 */ new Array(  ),
    /* State 31 */ new Array(  ),
    /* State 32 */ new Array( 20/* code */,34 ),
    /* State 33 */ new Array( 27/* productions */,35 , 28/* rhs */,36 , 29/* sequence */,37 ),
    /* State 34 */ new Array(  ),
    /* State 35 */ new Array(  ),
    /* State 36 */ new Array(  ),
    /* State 37 */ new Array( 31/* symbol */,40 , 30/* rhs_prec */,41 , 25/* identifier */,43 , 23/* string */,44 ),
    /* State 38 */ new Array( 28/* rhs */,45 , 29/* sequence */,37 ),
    /* State 39 */ new Array(  ),
    /* State 40 */ new Array(  ),
    /* State 41 */ new Array( 20/* code */,46 ),
    /* State 42 */ new Array( 23/* string */,47 , 25/* identifier */,48 ),
    /* State 43 */ new Array(  ),
    /* State 44 */ new Array(  ),
    /* State 45 */ new Array(  ),
    /* State 46 */ new Array(  ),
    /* State 47 */ new Array(  ),
    /* State 48 */ new Array(  )
);



/* Symbol labels */
var labels = new Array(
    "def'" /* Non-terminal symbol */,
    "WHITESPACE" /* Terminal symbol */,
    "##" /* Terminal symbol */,
    "<" /* Terminal symbol */,
    ">" /* Terminal symbol */,
    "^" /* Terminal symbol */,
    "!" /* Terminal symbol */,
    ";" /* Terminal symbol */,
    ":" /* Terminal symbol */,
    "|" /* Terminal symbol */,
    "&" /* Terminal symbol */,
    "CODE" /* Terminal symbol */,
    "STRING_SINGLE" /* Terminal symbol */,
    "STRING_DOUBLE" /* Terminal symbol */,
    "IDENT" /* Terminal symbol */,
    "header_code" /* Non-terminal symbol */,
    "token_assocs" /* Non-terminal symbol */,
    "grammar_defs" /* Non-terminal symbol */,
    "footer_code" /* Non-terminal symbol */,
    "def" /* Non-terminal symbol */,
    "code" /* Non-terminal symbol */,
    "token_assoc" /* Non-terminal symbol */,
    "token_defs" /* Non-terminal symbol */,
    "string" /* Non-terminal symbol */,
    "token_def" /* Non-terminal symbol */,
    "identifier" /* Non-terminal symbol */,
    "grammar_def" /* Non-terminal symbol */,
    "productions" /* Non-terminal symbol */,
    "rhs" /* Non-terminal symbol */,
    "sequence" /* Non-terminal symbol */,
    "rhs_prec" /* Non-terminal symbol */,
    "symbol" /* Non-terminal symbol */,
    "$" /* Terminal symbol */
);


    
    info.offset = 0;
    info.src = src;
    info.att = new String();
    
    if( !err_off )
        err_off = new Array();
    if( !err_la )
    err_la = new Array();
    
    sstack.push( 0 );
    vstack.push( 0 );
    
    la = jscco.__jscclex( info );

    while( true )
    {
        act = 50;
        for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
        {
            if( act_tab[sstack[sstack.length-1]][i] == la )
            {
                act = act_tab[sstack[sstack.length-1]][i+1];
                break;
            }
        }

        if( jscco.jscc_dbg_withtrace && sstack.length > 0 )
        {
            jscco.__jsccdbg_print( "\nState " + sstack[sstack.length-1] + "\n" +
                            "\tLookahead: " + labels[la] + " (\"" + info.att + "\")\n" +
                            "\tAction: " + act + "\n" + 
                            "\tSource: \"" + info.src.substr( info.offset, 30 ) + ( ( info.offset + 30 < info.src.length ) ?
                                    "..." : "" ) + "\"\n" +
                            "\tStack: " + sstack.join() + "\n" +
                            "\tValue stack: " + vstack.join() + "\n" );
        }
        
            
        //Panic-mode: Try recovery when parse-error occurs!
        if( act == 50 )
        {
            if( jscco.jscc_dbg_withtrace )
                jscco.__jsccdbg_print( "Error detected: There is no reduce or shift on the symbol " + labels[la] );
            
            err_cnt++;
            err_off.push( info.offset - info.att.length );          
            err_la.push( new Array() );
            for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
                err_la[err_la.length-1].push( labels[act_tab[sstack[sstack.length-1]][i]] );
            
            //Remember the original stack!
            var rsstack = new Array();
            var rvstack = new Array();
            for( var i = 0; i < sstack.length; i++ )
            {
                rsstack[i] = sstack[i];
                rvstack[i] = vstack[i];
            }
            
            while( act == 50 && la != 32 )
            {
                if( jscco.jscc_dbg_withtrace )
                    jscco.__jsccdbg_print( "\tError recovery\n" +
                                    "Current lookahead: " + labels[la] + " (" + info.att + ")\n" +
                                    "Action: " + act + "\n\n" );
                if( la == -1 )
                    info.offset++;
                    
                while( act == 50 && sstack.length > 0 )
                {
                    sstack.pop();
                    vstack.pop();
                    
                    if( sstack.length == 0 )
                        break;
                        
                    act = 50;
                    for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
                    {
                        if( act_tab[sstack[sstack.length-1]][i] == la )
                        {
                            act = act_tab[sstack[sstack.length-1]][i+1];
                            break;
                        }
                    }
                }
                
                if( act != 50 )
                    break;
                
                for( var i = 0; i < rsstack.length; i++ )
                {
                    sstack.push( rsstack[i] );
                    vstack.push( rvstack[i] );
                }
                
                la = jscco.__jscclex( info );
            }
            
            if( act == 50 )
            {
                if( jscco.jscc_dbg_withtrace )
                    jscco.__jsccdbg_print( "\tError recovery failed, terminating parse process..." );
                break;
            }


            if( jscco.jscc_dbg_withtrace )
                jscco.__jsccdbg_print( "\tError recovery succeeded, continuing" );
        }
        
        /*
        if( act == 50 )
            break;
        */
        
        
        //Shift
        if( act > 0 )
        {           
            if( jscco.jscc_dbg_withtrace )
                jscco.__jsccdbg_print( "Shifting symbol: " + labels[la] + " (" + info.att + ")" );
        
            sstack.push( act );
            vstack.push( info.att );
            
            la = jscco.__jscclex( info );
            
            if( jscco.jscc_dbg_withtrace )
                jscco.__jsccdbg_print( "\tNew lookahead symbol: " + labels[la] + " (" + info.att + ")" );
        }
        //Reduce
        else
        {       
            act *= -1;
            
            if( jscco.jscc_dbg_withtrace )
                jscco.__jsccdbg_print( "Reducing by producution: " + act );
            
            rval = void(0);
            
            if( jscco.jscc_dbg_withtrace )
                jscco.__jsccdbg_print( "\tPerforming semantic action..." );
            
switch( act )
{
    case 0:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 1:
    {
        rval = vstack[ vstack.length - 5 ];
    }
    break;
    case 2:
    {
         jscco.code_head += vstack[ vstack.length - 1 ]; 
    }
    break;
    case 3:
    {
         jscco.code_foot += vstack[ vstack.length - 1 ]; 
    }
    break;
    case 4:
    {
        rval = vstack[ vstack.length - 2 ];
    }
    break;
    case 5:
    {
        rval = vstack[ vstack.length - 0 ];
    }
    break;
    case 6:
    {
            jscco.assoc_level++;
                                                        for( var i = 0; i < vstack[ vstack.length - 2 ].length; i++ )
                                                        {
                                                            jscco.symbols[ vstack[ vstack.length - 2 ][i] ].level = jscco.assoc_level;
                                                            jscco.symbols[ vstack[ vstack.length - 2 ][i] ].assoc = jscco.ASSOC_LEFT;
                                                        }
                                                    
    }
    break;
    case 7:
    {
            jscco.assoc_level++;
                                                        for( var i = 0; i < vstack[ vstack.length - 2 ].length; i++ )
                                                        {
                                                            jscco.symbols[ vstack[ vstack.length - 2 ][i] ].level = jscco.assoc_level;
                                                            jscco.symbols[ vstack[ vstack.length - 2 ][i] ].assoc = jscco.ASSOC_RIGHT;
                                                        }
                                                    
    }
    break;
    case 8:
    {
            jscco.assoc_level++;
                                                        for( var i = 0; i < vstack[ vstack.length - 2 ].length; i++ )
                                                        {
                                                            jscco.symbols[ vstack[ vstack.length - 2 ][i] ].level = jscco.assoc_level;
                                                            jscco.symbols[ vstack[ vstack.length - 2 ][i] ].assoc = jscco.ASSOC_NOASSOC;
                                                        }
                                                    
    }
    break;
    case 9:
    {
        rval = vstack[ vstack.length - 2 ];
    }
    break;
    case 10:
    {
            if( jscco.whitespace_token == -1 )
                                                        {
                                                            var regex = vstack[ vstack.length - 1 ].substr( 1, vstack[ vstack.length - 1 ].length - 2 );
                                                            jscco.whitespace_token = jscco.create_symbol( "WHITESPACE", jscco.SYM_TERM, jscco.SPECIAL_WHITESPACE );
                                                            jscco.compile_regex( regex, jscco.whitespace_token, 
                                                                ( vstack[ vstack.length - 1 ].charAt( 0 ) == '\'' ) ? false : true );
                                                        }
                                                        else
                                                            jscco._error( "Multiple whitespace definition" );
                                                    
    }
    break;
    case 11:
    {
            vstack[ vstack.length - 2 ].push( vstack[ vstack.length - 1 ] );
                                                        rval = vstack[ vstack.length - 2 ];
                                                    
    }
    break;
    case 12:
    {
            rval = new Array();         
    }
    break;
    case 13:
    {
            rval = jscco.create_symbol( vstack[ vstack.length - 2 ], jscco.SYM_TERM, jscco.SPECIAL_NO_SPECIAL );
                                                        var regex = vstack[ vstack.length - 3 ].substr( 1, vstack[ vstack.length - 3 ].length - 2 );
                                                        jscco.symbols[rval].code = vstack[ vstack.length - 1 ];
                                                        
                                                        jscco.compile_regex( regex, jscco.symbols[ rval ].id, 
                                                            ( vstack[ vstack.length - 3 ].charAt( 0 ) == '\'' ) ? false : true );
                                                    
    }
    break;
    case 14:
    {
            var regex = vstack[ vstack.length - 2 ].substr( 1, vstack[ vstack.length - 2 ].length - 2 );
                                                        rval = jscco.create_symbol( regex.replace( /\\/g, "" ), jscco.SYM_TERM, jscco.SPECIAL_NO_SPECIAL );
                                                        jscco.symbols[rval].code = vstack[ vstack.length - 1 ];

                                                        jscco.compile_regex( regex, jscco.symbols[ rval ].id, 
                                                            ( vstack[ vstack.length - 2 ].charAt( 0 ) == '\'' ) ? false : true );
                                                    
    }
    break;
    case 15:
    {
        rval = vstack[ vstack.length - 2 ];
    }
    break;
    case 16:
    {
        rval = vstack[ vstack.length - 0 ];
    }
    break;
    case 17:
    {
            var nonterm = jscco.create_symbol( vstack[ vstack.length - 4 ], jscco.SYM_NONTERM, jscco.SPECIAL_NO_SPECIAL );
                                                        jscco.symbols[nonterm].defined = true;
                                                        for( var i = 0; i < vstack[ vstack.length - 2 ].length; i++ )
                                                        {
                                                            jscco.productions[ vstack[ vstack.length - 2 ][i] ].lhs = nonterm;
                                                            jscco.symbols[nonterm].prods.push( vstack[ vstack.length - 2 ][i] );
                                                        }
                                                        
                                                        if( jscco.first_lhs )
                                                        {
                                                            jscco.first_lhs = false;
                                                            jscco.symbols[0].label = jscco.symbols[nonterm].label + "\'";
                                                            jscco.productions[0].rhs.push( nonterm );
                                                        }
                                                    
    }
    break;
    case 18:
    {
            rval = new Array();
                                                        rval = rval.concat( vstack[ vstack.length - 3 ] );
                                                        rval.push( vstack[ vstack.length - 1 ] );
                                                    
    }
    break;
    case 19:
    {
            rval = new Array();
                                                        rval.push( vstack[ vstack.length - 1 ] );
                                                    
    }
    break;
    case 20:
    {
            var prod = new jscco.PROD();
                                                        prod.id = jscco.productions.length;
                                                        prod.rhs = vstack[ vstack.length - 3 ];
                                                        prod.level = vstack[ vstack.length - 2 ];
                                                        prod.code = vstack[ vstack.length - 1 ];                                                        
                                                        if( prod.code == "" )
                                                            prod.code = new String( jscco.DEF_PROD_CODE );
                                                            
                                                        if( prod.level == 0 )
                                                        {
                                                            if( prod.rhs.length > 0 )
                                                                for( var i = prod.rhs.length-1; i >= 0; i-- )
                                                                    if( jscco.symbols[prod.rhs[i]].kind == jscco.SYM_TERM )
                                                                    {
                                                                        prod.level = jscco.symbols[prod.rhs[i]].level;
                                                                        break;
                                                                    }
                                                        }

                                                        jscco.productions.push( prod );
                                                        rval = prod.id;
                                                    
    }
    break;
    case 21:
    {
            var index;
                                                        if( ( index = jscco.find_symbol( vstack[ vstack.length - 1 ], jscco.SYM_TERM, jscco.SPECIAL_NO_SPECIAL ) ) > -1 )
                                                            rval = jscco.symbols[index].level;
                                                        else
                                                            jscco._error( "Call to undefined terminal \"" + vstack[ vstack.length - 1 ] + "\"" );
                                                    
    }
    break;
    case 22:
    {
            var index;
                                                        if( ( index = jscco.find_symbol( vstack[ vstack.length - 1 ].substr( 1, vstack[ vstack.length - 1 ].length - 2).replace( /\\/g, "" ),
                                                                        jscco.SYM_TERM, jscco.SPECIAL_NO_SPECIAL ) ) > -1 )
                                                            rval = jscco.symbols[index].level;
                                                        else
                                                            jscco._error( "Call to undefined terminal \"" + vstack[ vstack.length - 1 ] + "\"" );
                                                    
    }
    break;
    case 23:
    {
            rval = 0; 
    }
    break;
    case 24:
    {
            rval = new Array();
                                                        rval = rval.concat( vstack[ vstack.length - 2 ] );
                                                        rval.push( vstack[ vstack.length - 1 ] );
                                                    
    }
    break;
    case 25:
    {
            rval = new Array(); 
    }
    break;
    case 26:
    {
            var index;
                                                        if( ( index = jscco.find_symbol( vstack[ vstack.length - 1 ], jscco.SYM_TERM, jscco.SPECIAL_NO_SPECIAL ) ) > -1 )
                                                            rval = index;
                                                        else
                                                            rval = jscco.create_symbol( vstack[ vstack.length - 1 ], jscco.SYM_NONTERM, jscco.SPECIAL_NO_SPECIAL );
                                                    
    }
    break;
    case 27:
    {
            var index;
                                                        if( ( index = jscco.find_symbol( vstack[ vstack.length - 1 ].substr( 1, vstack[ vstack.length - 1 ].length - 2).replace( /\\/g, "" ),
                                                                jscco.SYM_TERM, jscco.SPECIAL_NO_SPECIAL ) ) > -1 )
                                                            rval = index;
                                                        else
                                                            jscco._error( "Call to undefined terminal \"" + vstack[ vstack.length - 1 ] + "\"" );
                                                    
    }
    break;
    case 28:
    {
            rval = vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ].substr( 2, vstack[ vstack.length - 1 ].length - 4 ); 
    }
    break;
    case 29:
    {
            rval = new String(); 
    }
    break;
    case 30:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 31:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 32:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
}



            if( jscco.jscc_dbg_withtrace )
                jscco.__jsccdbg_print( "\tPopping " + pop_tab[act][1] + " off the stack..." );
                
            for( var i = 0; i < pop_tab[act][1]; i++ )
            {
                sstack.pop();
                vstack.pop();
            }
                                    
            go = -1;
            for( var i = 0; i < goto_tab[sstack[sstack.length-1]].length; i+=2 )
            {
                if( goto_tab[sstack[sstack.length-1]][i] == pop_tab[act][0] )
                {
                    go = goto_tab[sstack[sstack.length-1]][i+1];
                    break;
                }
            }
            
            if( act == 0 )
                break;
                
            if( jscco.jscc_dbg_withtrace )
                jscco.__jsccdbg_print( "\tPushing non-terminal " + labels[ pop_tab[act][0] ] );
                
            sstack.push( go );
            vstack.push( rval );            
        }
        
        if( jscco.jscc_dbg_withtrace )
        {       
            alert( jscco.jscc_dbg_string );
            jscco.jscc_dbg_string = new String();
        }
    }

    if( jscco.jscc_dbg_withtrace )
    {
        jscco.__jsccdbg_print( "\nParse complete." );
        alert( jscco.jscc_dbg_string );
    }
    
    return err_cnt;
},

parse_grammar: function ( str, filename ) {
    var error_offsets = new Array();
    var error_expects = new Array();
    var error_count = 0;
    
    jscco.first_lhs = true;

    if( ( error_count += jscco.__jsccparse( str, error_offsets, error_expects ) ) > 0 )
    {
        for( i = 0; i < error_count; i++ )
            jscco._error( filename + ", line " + ( str.substr( 0, error_offsets[i] ).match( /\n/g ) ?
                str.substr( 0, error_offsets[i] ).match( /\n/g ).length : 1 ) + 
                    ": Parse error near \"" 
                        + str.substr( error_offsets[i], 30 ) +
                            ( ( error_offsets[i] + 30 < str.substr( error_offsets[i] ).length ) ? 
                                "..." : "" ) + "\", expecting \"" + error_expects[i].join() + "\"" );
    }
},

first_nfa: null,
last_nfa: null,
created_nfas: null, //Must always be initialized by jscco.compile_regex()...

create_nfa: function ( where ) {
    var pos;
    var nfa;
    var i;
    
    /*
        Use an empty item if available,
        else create a new one...
    */
    for( i = 0; i < where.length; i++ )
        if( where[i].edge == jscco.EDGE_FREE )
            break;
    
    if( i == where.length )
    {
        nfa = new jscco.NFA()         
        where.push( nfa );
    }
    
    where[i].edge = jscco.EDGE_EPSILON;
    where[i].ccl = jscco.bitset_create( jscco.MAX_CHAR );
    where[i].accept = -1;
    where[i].follow = -1;
    where[i].follow2 = -1;
    where[i].weight = -1;
    
    jscco.created_nfas.push( i );
    
    return i;
},


/*
    Default template driver for JS/CC generated parsers running as
    browser-based JavaScript/ECMAScript applications.
    
    WARNING:    This parser template will not run as console and has lesser
                features for debugging than the console derivates for the
                various JavaScript platforms.
    
    Features:
    - Parser trace messages
    - Integrated panic-mode error recovery
    
    Written 2007, 2008 by Jan Max Meyer, J.M.K S.F. Software Technologies
    
    This is in the public domain.
*/

regex_dbg_withtrace : false,
regex_dbg_string    : new String(),

__regexdbg_print: function ( text ) {
    jscco.regex_dbg_string += text + "\n";
},

__regexlex: function ( info )
{
    var state       = 0;
    var match       = -1;
    var match_pos   = 0;
    var start       = 0;
    var pos         = info.offset + 1;

    do
    {
        pos--;
        state = 0;
        match = -2;
        start = pos;

        if( info.src.length <= start )
            return 21;

        do
        {

switch( state )
{
    case 0:
        if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 39 ) || ( info.src.charCodeAt( pos ) >= 44 && info.src.charCodeAt( pos ) <= 45 ) || ( info.src.charCodeAt( pos ) >= 47 && info.src.charCodeAt( pos ) <= 62 ) || ( info.src.charCodeAt( pos ) >= 64 && info.src.charCodeAt( pos ) <= 90 ) || ( info.src.charCodeAt( pos ) >= 94 && info.src.charCodeAt( pos ) <= 123 ) || ( info.src.charCodeAt( pos ) >= 125 && info.src.charCodeAt( pos ) <= 254 ) ) state = 1;
        else if( info.src.charCodeAt( pos ) == 40 ) state = 2;
        else if( info.src.charCodeAt( pos ) == 41 ) state = 3;
        else if( info.src.charCodeAt( pos ) == 42 ) state = 4;
        else if( info.src.charCodeAt( pos ) == 43 ) state = 5;
        else if( info.src.charCodeAt( pos ) == 46 ) state = 6;
        else if( info.src.charCodeAt( pos ) == 63 ) state = 7;
        else if( info.src.charCodeAt( pos ) == 91 ) state = 8;
        else if( info.src.charCodeAt( pos ) == 93 ) state = 9;
        else if( info.src.charCodeAt( pos ) == 124 ) state = 10;
        else if( info.src.charCodeAt( pos ) == 92 ) state = 13;
        else state = -1;
        break;

    case 1:
        state = -1;
        match = 12;
        match_pos = pos;
        break;

    case 2:
        state = -1;
        match = 5;
        match_pos = pos;
        break;

    case 3:
        state = -1;
        match = 6;
        match_pos = pos;
        break;

    case 4:
        state = -1;
        match = 2;
        match_pos = pos;
        break;

    case 5:
        state = -1;
        match = 3;
        match_pos = pos;
        break;

    case 6:
        state = -1;
        match = 9;
        match_pos = pos;
        break;

    case 7:
        state = -1;
        match = 4;
        match_pos = pos;
        break;

    case 8:
        state = -1;
        match = 7;
        match_pos = pos;
        break;

    case 9:
        state = -1;
        match = 8;
        match_pos = pos;
        break;

    case 10:
        state = -1;
        match = 1;
        match_pos = pos;
        break;

    case 11:
        state = -1;
        match = 11;
        match_pos = pos;
        break;

    case 12:
        if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 12;
        else state = -1;
        match = 10;
        match_pos = pos;
        break;

    case 13:
        if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 47 ) || ( info.src.charCodeAt( pos ) >= 58 && info.src.charCodeAt( pos ) <= 254 ) ) state = 11;
        else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 12;
        else state = -1;
        match = 12;
        match_pos = pos;
        break;

}


            pos++;

        }
        while( state > -1 );

    }
    while( -1 > -1 && match == -1 );

    if( match > -1 )
    {
        info.att = info.src.substr( start, match_pos - start );
        info.offset = match_pos;
        

    }
    else
    {
        info.att = new String();
        match = -1;
    }

    return match;
},

__regexparse: function( src, err_off, err_la )
{
    var     sstack          = new Array();
    var     vstack          = new Array();
    var     err_cnt         = 0;
    var     act;
    var     go;
    var     la;
    var     rval;
    var     parseinfo       = new Function( "", "var offset; var src; var att;" );
    var     info            = new parseinfo();
    
/* Pop-Table */
var pop_tab = new Array(
    new Array( 0/* RegEx' */, 1 ),
    new Array( 14/* RegEx */, 1 ),
    new Array( 13/* Expression */, 3 ),
    new Array( 13/* Expression */, 1 ),
    new Array( 15/* Catenation */, 2 ),
    new Array( 15/* Catenation */, 1 ),
    new Array( 16/* Factor */, 2 ),
    new Array( 16/* Factor */, 2 ),
    new Array( 16/* Factor */, 2 ),
    new Array( 16/* Factor */, 1 ),
    new Array( 17/* Term */, 1 ),
    new Array( 17/* Term */, 1 ),
    new Array( 17/* Term */, 3 ),
    new Array( 19/* CharacterSet */, 3 ),
    new Array( 19/* CharacterSet */, 1 ),
    new Array( 20/* CharClass */, 2 ),
    new Array( 20/* CharClass */, 0 ),
    new Array( 18/* Character */, 1 ),
    new Array( 18/* Character */, 1 ),
    new Array( 18/* Character */, 1 )
);

/* Action-Table */
var act_tab = new Array(
    /* State 0 */ new Array( 5/* "(" */,8 , 10/* "ASCII_CODE" */,9 , 11/* "ESCAPED_CHAR" */,10 , 12/* "ANY" */,11 , 7/* "[" */,12 , 9/* "ANY_CHAR" */,13 ),
    /* State 1 */ new Array( 21/* "$" */,0 ),
    /* State 2 */ new Array( 1/* "|" */,14 , 21/* "$" */,-1 ),
    /* State 3 */ new Array( 5/* "(" */,8 , 10/* "ASCII_CODE" */,9 , 11/* "ESCAPED_CHAR" */,10 , 12/* "ANY" */,11 , 7/* "[" */,12 , 9/* "ANY_CHAR" */,13 , 21/* "$" */,-3 , 1/* "|" */,-3 , 6/* ")" */,-3 ),
    /* State 4 */ new Array( 21/* "$" */,-5 , 1/* "|" */,-5 , 5/* "(" */,-5 , 10/* "ASCII_CODE" */,-5 , 11/* "ESCAPED_CHAR" */,-5 , 12/* "ANY" */,-5 , 7/* "[" */,-5 , 9/* "ANY_CHAR" */,-5 , 6/* ")" */,-5 ),
    /* State 5 */ new Array( 4/* "?" */,16 , 3/* "+" */,17 , 2/* "*" */,18 , 21/* "$" */,-9 , 1/* "|" */,-9 , 5/* "(" */,-9 , 10/* "ASCII_CODE" */,-9 , 11/* "ESCAPED_CHAR" */,-9 , 12/* "ANY" */,-9 , 7/* "[" */,-9 , 9/* "ANY_CHAR" */,-9 , 6/* ")" */,-9 ),
    /* State 6 */ new Array( 2/* "*" */,-10 , 3/* "+" */,-10 , 4/* "?" */,-10 , 21/* "$" */,-10 , 1/* "|" */,-10 , 5/* "(" */,-10 , 10/* "ASCII_CODE" */,-10 , 11/* "ESCAPED_CHAR" */,-10 , 12/* "ANY" */,-10 , 7/* "[" */,-10 , 9/* "ANY_CHAR" */,-10 , 6/* ")" */,-10 ),
    /* State 7 */ new Array( 2/* "*" */,-11 , 3/* "+" */,-11 , 4/* "?" */,-11 , 21/* "$" */,-11 , 1/* "|" */,-11 , 5/* "(" */,-11 , 10/* "ASCII_CODE" */,-11 , 11/* "ESCAPED_CHAR" */,-11 , 12/* "ANY" */,-11 , 7/* "[" */,-11 , 9/* "ANY_CHAR" */,-11 , 6/* ")" */,-11 ),
    /* State 8 */ new Array( 5/* "(" */,8 , 10/* "ASCII_CODE" */,9 , 11/* "ESCAPED_CHAR" */,10 , 12/* "ANY" */,11 , 7/* "[" */,12 , 9/* "ANY_CHAR" */,13 ),
    /* State 9 */ new Array( 2/* "*" */,-17 , 3/* "+" */,-17 , 4/* "?" */,-17 , 21/* "$" */,-17 , 1/* "|" */,-17 , 5/* "(" */,-17 , 10/* "ASCII_CODE" */,-17 , 11/* "ESCAPED_CHAR" */,-17 , 12/* "ANY" */,-17 , 7/* "[" */,-17 , 9/* "ANY_CHAR" */,-17 , 6/* ")" */,-17 , 8/* "]" */,-17 ),
    /* State 10 */ new Array( 2/* "*" */,-18 , 3/* "+" */,-18 , 4/* "?" */,-18 , 21/* "$" */,-18 , 1/* "|" */,-18 , 5/* "(" */,-18 , 10/* "ASCII_CODE" */,-18 , 11/* "ESCAPED_CHAR" */,-18 , 12/* "ANY" */,-18 , 7/* "[" */,-18 , 9/* "ANY_CHAR" */,-18 , 6/* ")" */,-18 , 8/* "]" */,-18 ),
    /* State 11 */ new Array( 2/* "*" */,-19 , 3/* "+" */,-19 , 4/* "?" */,-19 , 21/* "$" */,-19 , 1/* "|" */,-19 , 5/* "(" */,-19 , 10/* "ASCII_CODE" */,-19 , 11/* "ESCAPED_CHAR" */,-19 , 12/* "ANY" */,-19 , 7/* "[" */,-19 , 9/* "ANY_CHAR" */,-19 , 6/* ")" */,-19 , 8/* "]" */,-19 ),
    /* State 12 */ new Array( 8/* "]" */,-16 , 10/* "ASCII_CODE" */,-16 , 11/* "ESCAPED_CHAR" */,-16 , 12/* "ANY" */,-16 ),
    /* State 13 */ new Array( 2/* "*" */,-14 , 3/* "+" */,-14 , 4/* "?" */,-14 , 21/* "$" */,-14 , 1/* "|" */,-14 , 5/* "(" */,-14 , 10/* "ASCII_CODE" */,-14 , 11/* "ESCAPED_CHAR" */,-14 , 12/* "ANY" */,-14 , 7/* "[" */,-14 , 9/* "ANY_CHAR" */,-14 , 6/* ")" */,-14 ),
    /* State 14 */ new Array( 5/* "(" */,8 , 10/* "ASCII_CODE" */,9 , 11/* "ESCAPED_CHAR" */,10 , 12/* "ANY" */,11 , 7/* "[" */,12 , 9/* "ANY_CHAR" */,13 ),
    /* State 15 */ new Array( 21/* "$" */,-4 , 1/* "|" */,-4 , 5/* "(" */,-4 , 10/* "ASCII_CODE" */,-4 , 11/* "ESCAPED_CHAR" */,-4 , 12/* "ANY" */,-4 , 7/* "[" */,-4 , 9/* "ANY_CHAR" */,-4 , 6/* ")" */,-4 ),
    /* State 16 */ new Array( 21/* "$" */,-8 , 1/* "|" */,-8 , 5/* "(" */,-8 , 10/* "ASCII_CODE" */,-8 , 11/* "ESCAPED_CHAR" */,-8 , 12/* "ANY" */,-8 , 7/* "[" */,-8 , 9/* "ANY_CHAR" */,-8 , 6/* ")" */,-8 ),
    /* State 17 */ new Array( 21/* "$" */,-7 , 1/* "|" */,-7 , 5/* "(" */,-7 , 10/* "ASCII_CODE" */,-7 , 11/* "ESCAPED_CHAR" */,-7 , 12/* "ANY" */,-7 , 7/* "[" */,-7 , 9/* "ANY_CHAR" */,-7 , 6/* ")" */,-7 ),
    /* State 18 */ new Array( 21/* "$" */,-6 , 1/* "|" */,-6 , 5/* "(" */,-6 , 10/* "ASCII_CODE" */,-6 , 11/* "ESCAPED_CHAR" */,-6 , 12/* "ANY" */,-6 , 7/* "[" */,-6 , 9/* "ANY_CHAR" */,-6 , 6/* ")" */,-6 ),
    /* State 19 */ new Array( 1/* "|" */,14 , 6/* ")" */,22 ),
    /* State 20 */ new Array( 8/* "]" */,24 , 10/* "ASCII_CODE" */,9 , 11/* "ESCAPED_CHAR" */,10 , 12/* "ANY" */,11 ),
    /* State 21 */ new Array( 5/* "(" */,8 , 10/* "ASCII_CODE" */,9 , 11/* "ESCAPED_CHAR" */,10 , 12/* "ANY" */,11 , 7/* "[" */,12 , 9/* "ANY_CHAR" */,13 , 21/* "$" */,-2 , 1/* "|" */,-2 , 6/* ")" */,-2 ),
    /* State 22 */ new Array( 2/* "*" */,-12 , 3/* "+" */,-12 , 4/* "?" */,-12 , 21/* "$" */,-12 , 1/* "|" */,-12 , 5/* "(" */,-12 , 10/* "ASCII_CODE" */,-12 , 11/* "ESCAPED_CHAR" */,-12 , 12/* "ANY" */,-12 , 7/* "[" */,-12 , 9/* "ANY_CHAR" */,-12 , 6/* ")" */,-12 ),
    /* State 23 */ new Array( 8/* "]" */,-15 , 10/* "ASCII_CODE" */,-15 , 11/* "ESCAPED_CHAR" */,-15 , 12/* "ANY" */,-15 ),
    /* State 24 */ new Array( 2/* "*" */,-13 , 3/* "+" */,-13 , 4/* "?" */,-13 , 21/* "$" */,-13 , 1/* "|" */,-13 , 5/* "(" */,-13 , 10/* "ASCII_CODE" */,-13 , 11/* "ESCAPED_CHAR" */,-13 , 12/* "ANY" */,-13 , 7/* "[" */,-13 , 9/* "ANY_CHAR" */,-13 , 6/* ")" */,-13 )
);

/* Goto-Table */
var goto_tab = new Array(
    /* State 0 */ new Array( 14/* RegEx */,1 , 13/* Expression */,2 , 15/* Catenation */,3 , 16/* Factor */,4 , 17/* Term */,5 , 18/* Character */,6 , 19/* CharacterSet */,7 ),
    /* State 1 */ new Array(  ),
    /* State 2 */ new Array(  ),
    /* State 3 */ new Array( 16/* Factor */,15 , 17/* Term */,5 , 18/* Character */,6 , 19/* CharacterSet */,7 ),
    /* State 4 */ new Array(  ),
    /* State 5 */ new Array(  ),
    /* State 6 */ new Array(  ),
    /* State 7 */ new Array(  ),
    /* State 8 */ new Array( 13/* Expression */,19 , 15/* Catenation */,3 , 16/* Factor */,4 , 17/* Term */,5 , 18/* Character */,6 , 19/* CharacterSet */,7 ),
    /* State 9 */ new Array(  ),
    /* State 10 */ new Array(  ),
    /* State 11 */ new Array(  ),
    /* State 12 */ new Array( 20/* CharClass */,20 ),
    /* State 13 */ new Array(  ),
    /* State 14 */ new Array( 15/* Catenation */,21 , 16/* Factor */,4 , 17/* Term */,5 , 18/* Character */,6 , 19/* CharacterSet */,7 ),
    /* State 15 */ new Array(  ),
    /* State 16 */ new Array(  ),
    /* State 17 */ new Array(  ),
    /* State 18 */ new Array(  ),
    /* State 19 */ new Array(  ),
    /* State 20 */ new Array( 18/* Character */,23 ),
    /* State 21 */ new Array( 16/* Factor */,15 , 17/* Term */,5 , 18/* Character */,6 , 19/* CharacterSet */,7 ),
    /* State 22 */ new Array(  ),
    /* State 23 */ new Array(  ),
    /* State 24 */ new Array(  )
);



/* Symbol labels */
var labels = new Array(
    "RegEx'" /* Non-terminal symbol */,
    "|" /* Terminal symbol */,
    "*" /* Terminal symbol */,
    "+" /* Terminal symbol */,
    "?" /* Terminal symbol */,
    "(" /* Terminal symbol */,
    ")" /* Terminal symbol */,
    "[" /* Terminal symbol */,
    "]" /* Terminal symbol */,
    "ANY_CHAR" /* Terminal symbol */,
    "ASCII_CODE" /* Terminal symbol */,
    "ESCAPED_CHAR" /* Terminal symbol */,
    "ANY" /* Terminal symbol */,
    "Expression" /* Non-terminal symbol */,
    "RegEx" /* Non-terminal symbol */,
    "Catenation" /* Non-terminal symbol */,
    "Factor" /* Non-terminal symbol */,
    "Term" /* Non-terminal symbol */,
    "Character" /* Non-terminal symbol */,
    "CharacterSet" /* Non-terminal symbol */,
    "CharClass" /* Non-terminal symbol */,
    "$" /* Terminal symbol */
);


    
    info.offset = 0;
    info.src = src;
    info.att = new String();
    
    if( !err_off )
        err_off = new Array();
    if( !err_la )
    err_la = new Array();
    
    sstack.push( 0 );
    vstack.push( 0 );
    
    la = jscco.__regexlex( info );

    while( true )
    {
        act = 26;
        for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
        {
            if( act_tab[sstack[sstack.length-1]][i] == la )
            {
                act = act_tab[sstack[sstack.length-1]][i+1];
                break;
            }
        }

        if( jscco.regex_dbg_withtrace && sstack.length > 0 )
        {
            jscco.__regexdbg_print( "\nState " + sstack[sstack.length-1] + "\n" +
                            "\tLookahead: " + labels[la] + " (\"" + info.att + "\")\n" +
                            "\tAction: " + act + "\n" + 
                            "\tSource: \"" + info.src.substr( info.offset, 30 ) + ( ( info.offset + 30 < info.src.length ) ?
                                    "..." : "" ) + "\"\n" +
                            "\tStack: " + sstack.join() + "\n" +
                            "\tValue stack: " + vstack.join() + "\n" );
        }
        
            
        //Panic-mode: Try recovery when parse-error occurs!
        if( act == 26 )
        {
            if( jscco.regex_dbg_withtrace )
                jscco.__regexdbg_print( "Error detected: There is no reduce or shift on the symbol " + labels[la] );
            
            err_cnt++;
            err_off.push( info.offset - info.att.length );          
            err_la.push( new Array() );
            for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
                err_la[err_la.length-1].push( labels[act_tab[sstack[sstack.length-1]][i]] );
            
            //Remember the original stack!
            var rsstack = new Array();
            var rvstack = new Array();
            for( var i = 0; i < sstack.length; i++ )
            {
                rsstack[i] = sstack[i];
                rvstack[i] = vstack[i];
            }
            
            while( act == 26 && la != 21 )
            {
                if( jscco.regex_dbg_withtrace )
                    jscco.__regexdbg_print( "\tError recovery\n" +
                                    "Current lookahead: " + labels[la] + " (" + info.att + ")\n" +
                                    "Action: " + act + "\n\n" );
                if( la == -1 )
                    info.offset++;
                    
                while( act == 26 && sstack.length > 0 )
                {
                    sstack.pop();
                    vstack.pop();
                    
                    if( sstack.length == 0 )
                        break;
                        
                    act = 26;
                    for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
                    {
                        if( act_tab[sstack[sstack.length-1]][i] == la )
                        {
                            act = act_tab[sstack[sstack.length-1]][i+1];
                            break;
                        }
                    }
                }
                
                if( act != 26 )
                    break;
                
                for( var i = 0; i < rsstack.length; i++ )
                {
                    sstack.push( rsstack[i] );
                    vstack.push( rvstack[i] );
                }
                
                la = jscco.__regexlex( info );
            }
            
            if( act == 26 )
            {
                if( jscco.regex_dbg_withtrace )
                    jscco.__regexdbg_print( "\tError recovery failed, terminating parse process..." );
                break;
            }


            if( jscco.regex_dbg_withtrace )
                jscco.__regexdbg_print( "\tError recovery succeeded, continuing" );
        }
        
        /*
        if( act == 26 )
            break;
        */
        
        
        //Shift
        if( act > 0 )
        {           
            if( jscco.regex_dbg_withtrace )
                jscco.__regexdbg_print( "Shifting symbol: " + labels[la] + " (" + info.att + ")" );
        
            sstack.push( act );
            vstack.push( info.att );
            
            la = jscco.__regexlex( info );
            
            if( jscco.regex_dbg_withtrace )
                jscco.__regexdbg_print( "\tNew lookahead symbol: " + labels[la] + " (" + info.att + ")" );
        }
        //Reduce
        else
        {       
            act *= -1;
            
            if( jscco.regex_dbg_withtrace )
                jscco.__regexdbg_print( "Reducing by producution: " + act );
            
            rval = void(0);
            
            if( jscco.regex_dbg_withtrace )
                jscco.__regexdbg_print( "\tPerforming semantic action..." );
            
switch( act )
{
    case 0:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 1:
    {
            rval = new jscco.PARAM();
                                                    jscco.nfa_states[ jscco.first_nfa ].follow = vstack[ vstack.length - 1 ].start;
                                                    jscco.last_nfa = vstack[ vstack.length - 1 ].end;
                                                
    }
    break;
    case 2:
    {
            rval = new jscco.PARAM();
                                                    rval.start = jscco.create_nfa( jscco.nfa_states );
                                                    rval.end = jscco.create_nfa( jscco.nfa_states );
                                                    jscco.nfa_states[rval.start].follow = vstack[ vstack.length - 3 ].start;
                                                    jscco.nfa_states[rval.start].follow2 = vstack[ vstack.length - 1 ].start;
                                                    
                                                    jscco.nfa_states[vstack[ vstack.length - 3 ].end].follow = rval.end;
                                                    jscco.nfa_states[vstack[ vstack.length - 1 ].end].follow = rval.end;
                                                
    }
    break;
    case 3:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 4:
    {
            /*
                                                        (As a C-junkie, I miss memcpy() here ;P)
                                                    */
                                                    jscco.nfa_states[vstack[ vstack.length - 2 ].end].edge        = jscco.nfa_states[vstack[ vstack.length - 1 ].start].edge;
                                                    jscco.nfa_states[vstack[ vstack.length - 2 ].end].ccl     = jscco.nfa_states[vstack[ vstack.length - 1 ].start].ccl;
                                                    jscco.nfa_states[vstack[ vstack.length - 2 ].end].follow  = jscco.nfa_states[vstack[ vstack.length - 1 ].start].follow;
                                                    jscco.nfa_states[vstack[ vstack.length - 2 ].end].follow2 = jscco.nfa_states[vstack[ vstack.length - 1 ].start].follow2;
                                                    jscco.nfa_states[vstack[ vstack.length - 2 ].end].accept  = jscco.nfa_states[vstack[ vstack.length - 1 ].start].accept;
                                                    
                                                    jscco.nfa_states[vstack[ vstack.length - 1 ].start].edge = jscco.EDGE_FREE;
                                                    
                                                    vstack[ vstack.length - 2 ].end = vstack[ vstack.length - 1 ].end;
                                                    
                                                    rval = vstack[ vstack.length - 2 ];
                                                
    }
    break;
    case 5:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 6:
    {
        
                                                    rval = new jscco.PARAM();
                                                    rval.start = jscco.create_nfa( jscco.nfa_states );
                                                    rval.end = jscco.create_nfa( jscco.nfa_states );
                                                    
                                                    jscco.nfa_states[rval.start].follow = vstack[ vstack.length - 2 ].start;
                                                    jscco.nfa_states[vstack[ vstack.length - 2 ].end].follow = rval.end;

                                                    jscco.nfa_states[rval.start].follow2 = rval.end;
                                                    jscco.nfa_states[vstack[ vstack.length - 2 ].end].follow2 = vstack[ vstack.length - 2 ].start;
                                                
    }
    break;
    case 7:
    {
            rval = new jscco.PARAM();
                                                    rval.start = jscco.create_nfa( jscco.nfa_states );
                                                    rval.end = jscco.create_nfa( jscco.nfa_states );
                                                    
                                                    jscco.nfa_states[rval.start].follow = vstack[ vstack.length - 2 ].start;
                                                    jscco.nfa_states[vstack[ vstack.length - 2 ].end].follow = rval.end;

                                                    jscco.nfa_states[vstack[ vstack.length - 2 ].end].follow2 = vstack[ vstack.length - 2 ].start;                                                    
                                                
    }
    break;
    case 8:
    {
            rval = new jscco.PARAM();
                                                    rval.start = jscco.create_nfa( jscco.nfa_states );
                                                    rval.end = jscco.create_nfa( jscco.nfa_states );
                                                    jscco.nfa_states[rval.start].follow = vstack[ vstack.length - 2 ].start;
                                                    jscco.nfa_states[rval.start].follow2 = rval.end;
                                                    jscco.nfa_states[vstack[ vstack.length - 2 ].end].follow = rval.end;
                                                
    }
    break;
    case 9:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 10:
    {
            rval = new jscco.PARAM();
                                                    rval.start = jscco.create_nfa( jscco.nfa_states );
                                                    rval.end = jscco.nfa_states[rval.start].follow
                                                        = jscco.create_nfa( jscco.nfa_states );
                                                    jscco.nfa_states[rval.start].edge = jscco.EDGE_CHAR;
                                                    
                                                    //jscco._print( "SINGLE: >" + vstack[ vstack.length - 1 ] + "<" );
                                                    
                                                    jscco.bitset_set( jscco.nfa_states[rval.start].ccl,
                                                            vstack[ vstack.length - 1 ].charCodeAt( 0 ), 1 );
                                                
    }
    break;
    case 11:
    {
        rval = vstack[ vstack.length - 1 ];
    }
    break;
    case 12:
    {
            rval = vstack[ vstack.length - 2 ]; 
    }
    break;
    case 13:
    {
            var negate = false;
                                                    var i = 0, j, start;
                                                    
                                                    //jscco._print( "CHARCLASS: >" + vstack[ vstack.length - 2 ] + "<" );
                                                    
                                                    rval = new jscco.PARAM();
                                                    rval.start = jscco.create_nfa( jscco.nfa_states );
                                                    rval.end = jscco.nfa_states[rval.start].follow
                                                        = jscco.create_nfa( jscco.nfa_states );
                                                    jscco.nfa_states[rval.start].edge = jscco.EDGE_CHAR;
                                                    
                                                    if( vstack[ vstack.length - 2 ].charAt( i ) == '^' )
                                                    {
                                                        negate = true;
                                                        for( var j = jscco.MIN_CHAR; j < jscco.MAX_CHAR; j++ )
                                                            jscco.bitset_set( jscco.nfa_states[rval.start].ccl, j, 1 );
                                                        i++;
                                                    }

                                                    for( ; i < vstack[ vstack.length - 2 ].length; i++ )
                                                    {
                                                        if( vstack[ vstack.length - 2 ].charAt( i+1 ) == '-'
                                                            && i+2 < vstack[ vstack.length - 2 ].length )
                                                        {
                                                            i++;
                                                            for( j = vstack[ vstack.length - 2 ].charCodeAt( i-1 );
                                                                    j < vstack[ vstack.length - 2 ].charCodeAt( i+1 );
                                                                        j++ )       
                                                                jscco.bitset_set( jscco.nfa_states[rval.start].ccl,
                                                                    j, negate ? 0 : 1 );
                                                        }
                                                        else
                                                            jscco.bitset_set( jscco.nfa_states[rval.start].ccl,
                                                                vstack[ vstack.length - 2 ].charCodeAt( i ), negate ? 0 : 1 );
                                                    }
                                                
    }
    break;
    case 14:
    {
            rval = new jscco.PARAM();
                
                                                    //jscco._print( "ANYCHAR: >" + vstack[ vstack.length - 1 ] + "<" );
                                                    
                                                    rval.start = jscco.create_nfa( jscco.nfa_states );
                                                    rval.end = jscco.nfa_states[rval.start].follow
                                                        = jscco.create_nfa( jscco.nfa_states );
                                                    jscco.nfa_states[rval.start].edge = jscco.EDGE_CHAR;
                                                    for( var i = jscco.MIN_CHAR; i < jscco.MAX_CHAR; i++ )
                                                        jscco.bitset_set( jscco.nfa_states[rval.start].ccl, i, 1 );
                                                
    }
    break;
    case 15:
    {
            rval = new String( vstack[ vstack.length - 2 ] + vstack[ vstack.length - 1 ] ); 
    }
    break;
    case 16:
    {
            rval = new String(); 
    }
    break;
    case 17:
    {
            rval = String.fromCharCode( vstack[ vstack.length - 1 ].substr( 1 ) ); 
    }
    break;
    case 18:
    {
            switch( vstack[ vstack.length - 1 ].substr( 1 ) )
                                                    {
                                                        case 'n':
                                                            rval = '\n';
                                                            break;
                                                        case 'r':
                                                            rval = '\r';
                                                            break;
                                                        case 't':
                                                            rval = '\t';
                                                            break;
                                                        case 'a':
                                                            rval = '\a';
                                                            break;
                                                        default:
                                                            rval = vstack[ vstack.length - 1 ].substr( 1 );
                                                            break;
                                                    }
                                                
    }
    break;
    case 19:
    {
            rval = vstack[ vstack.length - 1 ]; 
    }
    break;
}



            if( jscco.regex_dbg_withtrace )
                jscco.__regexdbg_print( "\tPopping " + pop_tab[act][1] + " off the stack..." );
                
            for( var i = 0; i < pop_tab[act][1]; i++ )
            {
                sstack.pop();
                vstack.pop();
            }
                                    
            go = -1;
            for( var i = 0; i < goto_tab[sstack[sstack.length-1]].length; i+=2 )
            {
                if( goto_tab[sstack[sstack.length-1]][i] == pop_tab[act][0] )
                {
                    go = goto_tab[sstack[sstack.length-1]][i+1];
                    break;
                }
            }
            
            if( act == 0 )
                break;
                
            if( jscco.regex_dbg_withtrace )
                jscco.__regexdbg_print( "\tPushing non-terminal " + labels[ pop_tab[act][0] ] );
                
            sstack.push( go );
            vstack.push( rval );            
        }
        
        if( jscco.regex_dbg_withtrace )
        {       
            alert( jscco.regex_dbg_string );
            jscco.regex_dbg_string = new String();
        }
    }

    if( jscco.regex_dbg_withtrace )
    {
        jscco.__regexdbg_print( "\nParse complete." );
        alert( jscco.regex_dbg_string );
    }
    
    return err_cnt;
},

compile_regex: function( str, accept, case_insensitive )
{
    var i, j;
    var weight = 0;
    var true_edges = 0;
    var error_offsets = new Array();
    var error_expects = new Array();
    var error_count = 0;
    
    if( str == "" )
        return;
    
    //jscco._print( "str = >" + str + "< " + case_insensitive );
    
    jscco.created_nfas = new Array();
    
    jscco.first_nfa = jscco.create_nfa( jscco.nfa_states );
    if( ( error_count = jscco.__regexparse( str, error_offsets, error_expects ) ) == 0 )
    {
        //If the symbol should be case-insensitive, manipulate the
        //character sets on the newly created items.
        if( case_insensitive )
        {
            for( i = 0; i < jscco.created_nfas.length; i++ )
            {
                if( jscco.nfa_states[ jscco.created_nfas[i] ].edge == jscco.EDGE_CHAR )
                {
                    for( j = jscco.MIN_CHAR; j < jscco.MAX_CHAR; j++ )
                    {
                        if( jscco.bitset_get( jscco.nfa_states[ jscco.created_nfas[i] ].ccl, j ) )
                        {
                            jscco.bitset_set( jscco.nfa_states[ jscco.created_nfas[i] ].ccl,
                                String.fromCharCode( j ).toUpperCase().charCodeAt( 0 ), 1 );
                            jscco.bitset_set( jscco.nfa_states[ jscco.created_nfas[i] ].ccl,
                                String.fromCharCode( j ).toLowerCase().charCodeAt( 0 ), 1 );
                        }
                    }
                }
            }
        }

        /* 
            2008-5-9    Radim Cebis:
            
            I think that computing weight of the jscco.nfa_states is weird,
            IMHO nfa_state which accepts a symbol, should have
            weight according to the order...
        */
        jscco.nfa_states[ jscco.last_nfa ].accept = accept;   
        jscco.nfa_states[ jscco.last_nfa ].weight = jscco.regex_weight++;

        if( jscco.first_nfa > 0 )
        {
            i = 0;
            while( jscco.nfa_states[i].follow2 != -1 )
                i = jscco.nfa_states[i].follow2;

            jscco.nfa_states[i].follow2 = jscco.first_nfa;
        }
    }
    else
    {
        for( i = 0; i < error_count; i++ )
        {
            var spaces = new String();
            for( j = 0; j < error_offsets[i]; j++ )
                spaces += " ";
            
            jscco._error( "Regular expression \"" + str + "\"\n" +
             "                           " + spaces + "^\n" +
             "       expecting \"" + error_expects[i].join() + "\"" );
        }
    }
},

//This file remains empty.
/* -MODULE----------------------------------------------------------------------
JS/CC: A LALR(1) Parser Generator written in JavaScript
Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com

File:   main.js
Author: Jan Max Meyer
Usage:  Console-based program entry for the JS/CC parser generator.

You may use, modify and distribute this software under the terms and conditions
of the Artistic License. Please see ARTISTIC for more information.
----------------------------------------------------------------------------- */

version: function()
{
    var info = new String();

    info += "JS/CC v" + jscco.JSCC_VERSION + ": A LALR(1) Parser and Lexer " +
                "Generator written in JavaScript\n";
    info += "Copyright (C) 2007, 2008 by J.M.K S.F. Software Technologies," +
                "Jan Max Meyer\n";
    info += "http://jscc.jmksf.com ++ jscc@jmksf.com\n\n";
    
    info += "You may use, modify and distribute this software under the " +
                "terms and conditions\n";
    info += "of the Artistic License. Please see ARTISTIC for more " +
                "information.\n";
    
    jscco._print( info );
},

help: function()
{
    var help = new String();

    help += "usage: jscc [options] filename\n\n";

    help += "       -h   --help               Print this usage help\n";
    help += "       -i   --version            Print version and copyright\n";
    help += "       -o   --output <file>      Save output source to <file>\n";
    help += "       -p   --prefix <prefix>    Use <prefix> as sequence pre-\n";
    help += "                                 fixing methods and variables\n";
    help += "       -t   --template <file>    Use template file <file> as\n";
    help += "                                 parser template\n";
    help += "       -v   --verbose            Run in verbose mode\n";
    help += "       -w   --warnings           Print warnings\n";
        
    jscco._print( help );
},

_error: function( msg ) {
  if( jscco.show_errors )
    jscco.error_output += "Error: " + msg + "\n";

  jscco.errors++;
},

_warning: function( msg ) {
  if( jscco.show_warnings )
    jscco.error_output += "Warning: " + msg + "\n";

  jscco.warnings++;
},

_print: function ( txt ) {
  jscco.html_output += txt;
},

// Creates a parser as a string of raw JavaScript code that
// can be passed to "eval".
parser: function (str, dstid, show_warnings) {

//Initialize the globals
jscco.reset_all( jscco.EXEC_CONSOLE );

this.run_parser = function(dstid) {
  var driver = new String( "##HEADER##\n\n\nvar ##PREFIX##_dbg_withtrace\t\t= false;\nvar ##PREFIX##_dbg_string\t\t\t= new String();\n\nfunction __##PREFIX##dbg_print( text )\n{\n\t##PREFIX##_dbg_string += text + \"\\n\";\n}\n\nfunction __##PREFIX##lex( info )\n{\n\tvar state\t\t= 0;\n\tvar match\t\t= -1;\n\tvar match_pos\t= 0;\n\tvar start\t\t= 0;\n\tvar pos\t\t\t= info.offset + 1;\n\n\tdo\n\t{\n\t\tpos--;\n\t\tstate = 0;\n\t\tmatch = -2;\n\t\tstart = pos;\n\n\t\tif( info.src.length <= start )\n\t\t\treturn ##EOF##;\n\n\t\tdo\n\t\t{\n\n##DFA##\n\t\t\tpos++;\n\n\t\t}\n\t\twhile( state > -1 );\n\n\t}\n\twhile( ##WHITESPACE## > -1 && match == ##WHITESPACE## );\n\n\tif( match > -1 )\n\t{\n\t\tinfo.att = info.src.substr( start, match_pos - start );\n\t\tinfo.offset = match_pos;\n\t\t\n##TERMINAL_ACTIONS##\n\t}\n\telse\n\t{\n\t\tinfo.att = new String();\n\t\tmatch = -1;\n\t}\n\n\treturn match;\n}\n\n\nfunction __##PREFIX##parse( src, err_off, err_la )\n{\n\tvar\t\tsstack\t\t\t= new Array();\n\tvar\t\tvstack\t\t\t= new Array();\n\tvar \terr_cnt\t\t\t= 0;\n\tvar\t\tact;\n\tvar\t\tgo;\n\tvar\t\tla;\n\tvar\t\trval;\n\tvar \tparseinfo\t\t= new Function( \"\", \"var offset; var src; var att;\" );\n\tvar\t\tinfo\t\t\t= new parseinfo();\n\t\n##TABLES##\n\n##LABELS##\n\t\n\tinfo.offset = 0;\n\tinfo.src = src;\n\tinfo.att = new String();\n\t\n\tif( !err_off )\n\t\terr_off\t= new Array();\n\tif( !err_la )\n\terr_la = new Array();\n\t\n\tsstack.push( 0 );\n\tvstack.push( 0 );\n\t\n\tla = __##PREFIX##lex( info );\n\n\twhile( true )\n\t{\n\t\tact = ##ERROR##;\n\t\tfor( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )\n\t\t{\n\t\t\tif( act_tab[sstack[sstack.length-1]][i] == la )\n\t\t\t{\n\t\t\t\tact = act_tab[sstack[sstack.length-1]][i+1];\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\n\t\tif( ##PREFIX##_dbg_withtrace && sstack.length > 0 )\n\t\t{\n\t\t\t__##PREFIX##dbg_print( \"\\nState \" + sstack[sstack.length-1] + \"\\n\" +\n\t\t\t\t\t\t\t\"\\tLookahead: \" + labels[la] + \" (\\\"\" + info.att + \"\\\")\\n\" +\n\t\t\t\t\t\t\t\"\\tAction: \" + act + \"\\n\" + \n\t\t\t\t\t\t\t\"\\tSource: \\\"\" + info.src.substr( info.offset, 30 ) + ( ( info.offset + 30 < info.src.length ) ?\n\t\t\t\t\t\t\t\t\t\"...\" : \"\" ) + \"\\\"\\n\" +\n\t\t\t\t\t\t\t\"\\tStack: \" + sstack.join() + \"\\n\" +\n\t\t\t\t\t\t\t\"\\tValue stack: \" + vstack.join() + \"\\n\" );\n\t\t}\n\t\t\n\t\t\t\n\t\t//Panic-mode: Try recovery when parse-error occurs!\n\t\tif( act == ##ERROR## )\n\t\t{\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"Error detected: There is no reduce or shift on the symbol \" + labels[la] );\n\t\t\t\n\t\t\terr_cnt++;\n\t\t\terr_off.push( info.offset - info.att.length );\t\t\t\n\t\t\terr_la.push( new Array() );\n\t\t\tfor( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )\n\t\t\t\terr_la[err_la.length-1].push( labels[act_tab[sstack[sstack.length-1]][i]] );\n\t\t\t\n\t\t\t//Remember the original stack!\n\t\t\tvar rsstack = new Array();\n\t\t\tvar rvstack = new Array();\n\t\t\tfor( var i = 0; i < sstack.length; i++ )\n\t\t\t{\n\t\t\t\trsstack[i] = sstack[i];\n\t\t\t\trvstack[i] = vstack[i];\n\t\t\t}\n\t\t\t\n\t\t\twhile( act == ##ERROR## && la != ##EOF## )\n\t\t\t{\n\t\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t\t__##PREFIX##dbg_print( \"\\tError recovery\\n\" +\n\t\t\t\t\t\t\t\t\t\"Current lookahead: \" + labels[la] + \" (\" + info.att + \")\\n\" +\n\t\t\t\t\t\t\t\t\t\"Action: \" + act + \"\\n\\n\" );\n\t\t\t\tif( la == -1 )\n\t\t\t\t\tinfo.offset++;\n\t\t\t\t\t\n\t\t\t\twhile( act == ##ERROR## && sstack.length > 0 )\n\t\t\t\t{\n\t\t\t\t\tsstack.pop();\n\t\t\t\t\tvstack.pop();\n\t\t\t\t\t\n\t\t\t\t\tif( sstack.length == 0 )\n\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\n\t\t\t\t\tact = ##ERROR##;\n\t\t\t\t\tfor( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )\n\t\t\t\t\t{\n\t\t\t\t\t\tif( act_tab[sstack[sstack.length-1]][i] == la )\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\tact = act_tab[sstack[sstack.length-1]][i+1];\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\tif( act != ##ERROR## )\n\t\t\t\t\tbreak;\n\t\t\t\t\n\t\t\t\tfor( var i = 0; i < rsstack.length; i++ )\n\t\t\t\t{\n\t\t\t\t\tsstack.push( rsstack[i] );\n\t\t\t\t\tvstack.push( rvstack[i] );\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\tla = __##PREFIX##lex( info );\n\t\t\t}\n\t\t\t\n\t\t\tif( act == ##ERROR## )\n\t\t\t{\n\t\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t\t__##PREFIX##dbg_print( \"\\tError recovery failed, terminating parse process...\" );\n\t\t\t\tbreak;\n\t\t\t}\n\n\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"\\tError recovery succeeded, continuing\" );\n\t\t}\n\t\t\n\t\t/*\n\t\tif( act == ##ERROR## )\n\t\t\tbreak;\n\t\t*/\n\t\t\n\t\t\n\t\t//Shift\n\t\tif( act > 0 )\n\t\t{\t\t\t\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"Shifting symbol: \" + labels[la] + \" (\" + info.att + \")\" );\n\t\t\n\t\t\tsstack.push( act );\n\t\t\tvstack.push( info.att );\n\t\t\t\n\t\t\tla = __##PREFIX##lex( info );\n\t\t\t\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"\\tNew lookahead symbol: \" + labels[la] + \" (\" + info.att + \")\" );\n\t\t}\n\t\t//Reduce\n\t\telse\n\t\t{\t\t\n\t\t\tact *= -1;\n\t\t\t\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"Reducing by producution: \" + act );\n\t\t\t\n\t\t\trval = void(0);\n\t\t\t\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"\\tPerforming semantic action...\" );\n\t\t\t\n##ACTIONS##\n\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"\\tPopping \" + pop_tab[act][1] + \" off the stack...\" );\n\t\t\t\t\n\t\t\tfor( var i = 0; i < pop_tab[act][1]; i++ )\n\t\t\t{\n\t\t\t\tsstack.pop();\n\t\t\t\tvstack.pop();\n\t\t\t}\n\t\t\t\t\t\t\t\t\t\n\t\t\tgo = -1;\n\t\t\tfor( var i = 0; i < goto_tab[sstack[sstack.length-1]].length; i+=2 )\n\t\t\t{\n\t\t\t\tif( goto_tab[sstack[sstack.length-1]][i] == pop_tab[act][0] )\n\t\t\t\t{\n\t\t\t\t\tgo = goto_tab[sstack[sstack.length-1]][i+1];\n\t\t\t\t\tbreak;\n\t\t\t\t}\n\t\t\t}\n\t\t\t\n\t\t\tif( act == 0 )\n\t\t\t\tbreak;\n\t\t\t\t\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"\\tPushing non-terminal \" + labels[ pop_tab[act][0] ] );\n\t\t\t\t\n\t\t\tsstack.push( go );\n\t\t\tvstack.push( rval );\t\t\t\n\t\t}\n\t\t\n\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t{\t\t\n\t\t\talert( ##PREFIX##_dbg_string );\n\t\t\t##PREFIX##_dbg_string = new String();\n\t\t}\n\t}\n\n\tif( ##PREFIX##_dbg_withtrace )\n\t{\n\t\t__##PREFIX##dbg_print( \"\\nParse complete.\" );\n\t\talert( ##PREFIX##_dbg_string );\n\t}\n\t\n\treturn err_cnt;\n}\n\n\n##FOOTER##" );
  var webdriver = new String( "##HEADER##\n\n\n\nvar ##PREFIX##_dbg_withtrace\t\t= false;\nvar ##PREFIX##_dbg_string\t\t\t= new String();\n\nfunction __##PREFIX##dbg_print( text )\n{\n\t##PREFIX##_dbg_string += text + \"\\n\";\n}\n\nfunction __##PREFIX##lex( info )\n{\n\tvar state\t\t= 0;\n\tvar match\t\t= -1;\n\tvar match_pos\t= 0;\n\tvar start\t\t= 0;\n\tvar pos\t\t\t= info.offset + 1;\n\n\tdo\n\t{\n\t\tpos--;\n\t\tstate = 0;\n\t\tmatch = -2;\n\t\tstart = pos;\n\n\t\tif( info.src.length <= start )\n\t\t\treturn ##EOF##;\n\n\t\tdo\n\t\t{\n\n##DFA##\n\t\t\tpos++;\n\n\t\t}\n\t\twhile( state > -1 );\n\n\t}\n\twhile( ##WHITESPACE## > -1 && match == ##WHITESPACE## );\n\n\tif( match > -1 )\n\t{\n\t\tinfo.att = info.src.substr( start, match_pos - start );\n\t\tinfo.offset = match_pos;\n\t\t\n##TERMINAL_ACTIONS##\n\t}\n\telse\n\t{\n\t\tinfo.att = new String();\n\t\tmatch = -1;\n\t}\n\n\treturn match;\n}\n\n\nfunction __##PREFIX##parse( src, err_off, err_la )\n{\n\tvar\t\tsstack\t\t\t= new Array();\n\tvar\t\tvstack\t\t\t= new Array();\n\tvar \terr_cnt\t\t\t= 0;\n\tvar\t\tact;\n\tvar\t\tgo;\n\tvar\t\tla;\n\tvar\t\trval;\n\tvar \tparseinfo\t\t= new Function( \"\", \"var offset; var src; var att;\" );\n\tvar\t\tinfo\t\t\t= new parseinfo();\n\t\n\t//Visual parse tree generation\n\tvar \ttreenode\t\t= new Function( \"\", \"var sym; var att; var child;\" );\n\tvar\t\ttreenodes\t\t= new Array();\n\tvar\t\ttree\t\t\t= new Array();\n\tvar\t\ttmptree\t\t\t= null;\n\t\n##TABLES##\n\n##LABELS##\n\t\n\tinfo.offset = 0;\n\tinfo.src = src;\n\tinfo.att = new String();\n\t\n\tif( !err_off )\n\t\terr_off\t= new Array();\n\tif( !err_la )\n\terr_la = new Array();\n\t\n\tsstack.push( 0 );\n\tvstack.push( 0 );\n\t\n\tla = __##PREFIX##lex( info );\n\n\twhile( true )\n\t{\n\t\tact = ##ERROR##;\n\t\tfor( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )\n\t\t{\n\t\t\tif( act_tab[sstack[sstack.length-1]][i] == la )\n\t\t\t{\n\t\t\t\tact = act_tab[sstack[sstack.length-1]][i+1];\n\t\t\t\tbreak;\n\t\t\t}\n\t\t}\n\n\t\tif( ##PREFIX##_dbg_withtrace && sstack.length > 0 )\n\t\t{\n\t\t\t__##PREFIX##dbg_print( \"\\nState \" + sstack[sstack.length-1] + \"\\n\" +\n\t\t\t\t\t\t\t\"\\tLookahead: \" + labels[la] + \" (\\\"\" + info.att + \"\\\")\\n\" +\n\t\t\t\t\t\t\t\"\\tAction: \" + act + \"\\n\" + \n\t\t\t\t\t\t\t\"\\tSource: \\\"\" + info.src.substr( info.offset, 30 ) + ( ( info.offset + 30 < info.src.length ) ?\n\t\t\t\t\t\t\t\t\t\"...\" : \"\" ) + \"\\\"\\n\" +\n\t\t\t\t\t\t\t\"\\tStack: \" + sstack.join() + \"\\n\" +\n\t\t\t\t\t\t\t\"\\tValue stack: \" + vstack.join() + \"\\n\" );\n\t\t}\n\t\t\n\t\t\t\n\t\t//Panic-mode: Try recovery when parse-error occurs!\n\t\tif( act == ##ERROR## )\n\t\t{\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"Error detected: There is no reduce or shift on the symbol \" + labels[la] );\n\t\t\t\n\t\t\terr_cnt++;\n\t\t\terr_off.push( info.offset - info.att.length );\t\t\t\n\t\t\terr_la.push( new Array() );\n\t\t\tfor( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )\n\t\t\t\terr_la[err_la.length-1].push( labels[act_tab[sstack[sstack.length-1]][i]] );\n\t\t\t\n\t\t\t//Remember the original stack!\n\t\t\tvar rsstack = new Array();\n\t\t\tvar rvstack = new Array();\n\t\t\tfor( var i = 0; i < sstack.length; i++ )\n\t\t\t{\n\t\t\t\trsstack[i] = sstack[i];\n\t\t\t\trvstack[i] = vstack[i];\n\t\t\t}\n\t\t\t\n\t\t\twhile( act == ##ERROR## && la != ##EOF## )\n\t\t\t{\n\t\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t\t__##PREFIX##dbg_print( \"\\tError recovery\\n\" +\n\t\t\t\t\t\t\t\t\t\"Current lookahead: \" + labels[la] + \" (\" + info.att + \")\\n\" +\n\t\t\t\t\t\t\t\t\t\"Action: \" + act + \"\\n\\n\" );\n\t\t\t\tif( la == -1 )\n\t\t\t\t\tinfo.offset++;\n\t\t\t\t\t\n\t\t\t\twhile( act == ##ERROR## && sstack.length > 0 )\n\t\t\t\t{\n\t\t\t\t\tsstack.pop();\n\t\t\t\t\tvstack.pop();\n\t\t\t\t\t\n\t\t\t\t\tif( sstack.length == 0 )\n\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\n\t\t\t\t\tact = ##ERROR##;\n\t\t\t\t\tfor( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )\n\t\t\t\t\t{\n\t\t\t\t\t\tif( act_tab[sstack[sstack.length-1]][i] == la )\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\tact = act_tab[sstack[sstack.length-1]][i+1];\n\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\tif( act != ##ERROR## )\n\t\t\t\t\tbreak;\n\t\t\t\t\n\t\t\t\tfor( var i = 0; i < rsstack.length; i++ )\n\t\t\t\t{\n\t\t\t\t\tsstack.push( rsstack[i] );\n\t\t\t\t\tvstack.push( rvstack[i] );\n\t\t\t\t}\n\t\t\t\t\n\t\t\t\tla = __##PREFIX##lex( info );\n\t\t\t}\n\t\t\t\n\t\t\tif( act == ##ERROR## )\n\t\t\t{\n\t\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t\t__##PREFIX##dbg_print( \"\\tError recovery failed, terminating parse process...\" );\n\t\t\t\tbreak;\n\t\t\t}\n\n\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"\\tError recovery succeeded, continuing\" );\n\t\t}\n\t\t\n\t\t/*\n\t\tif( act == ##ERROR## )\n\t\t\tbreak;\n\t\t*/\n\t\t\n\t\t\n\t\t//Shift\n\t\tif( act > 0 )\n\t\t{\n\t\t\t//Parse tree\n\t\t\tvar node = new treenode();\n\t\t\tnode.sym = labels[ la ];\n\t\t\tnode.att = info.att;\n\t\t\tnode.child = new Array();\n\t\t\ttree.push( treenodes.length );\n\t\t\ttreenodes.push( node );\n\t\t\t\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"Shifting symbol: \" + labels[la] + \" (\" + info.att + \")\" );\n\t\t\n\t\t\tsstack.push( act );\n\t\t\tvstack.push( info.att );\n\t\t\t\n\t\t\tla = __##PREFIX##lex( info );\n\t\t\t\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"\\tNew lookahead symbol: \" + labels[la] + \" (\" + info.att + \")\" );\n\t\t}\n\t\t//Reduce\n\t\telse\n\t\t{\t\t\n\t\t\tact *= -1;\n\t\t\t\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"Reducing by producution: \" + act );\n\t\t\t\n\t\t\trval = void(0);\n\t\t\t\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"\\tPerforming semantic action...\" );\n\t\t\t\n##ACTIONS##\n\n\t\t\ttmptree = new Array();\n\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"\\tPopping \" + pop_tab[act][1] + \" off the stack...\" );\n\t\t\t\t\n\t\t\tfor( var i = 0; i < pop_tab[act][1]; i++ )\n\t\t\t{\t\t\t\n\t\t\t\ttmptree.push( tree.pop() );\n\n\t\t\t\tsstack.pop();\n\t\t\t\tvstack.pop();\n\t\t\t}\n\t\t\t\t\t\t\t\t\t\n\t\t\tgo = -1;\n\t\t\tfor( var i = 0; i < goto_tab[sstack[sstack.length-1]].length; i+=2 )\n\t\t\t{\n\t\t\t\tif( goto_tab[sstack[sstack.length-1]][i] == pop_tab[act][0] )\n\t\t\t\t{\n\t\t\t\t\tgo = goto_tab[sstack[sstack.length-1]][i+1];\n\t\t\t\t\tbreak;\n\t\t\t\t}\n\t\t\t}\n\t\t\t\n\t\t\t//Parse tree\n\t\t\tvar node = new treenode();\n\t\t\tnode.sym = labels[ pop_tab[act][0] ];\n\t\t\tnode.att = rval;\n\t\t\tnode.child = tmptree.reverse();\n\t\t\ttree.push( treenodes.length );\n\t\t\ttreenodes.push( node );\n\t\t\t\n\t\t\tif( act == 0 )\n\t\t\t\tbreak;\n\t\t\t\t\n\t\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t\t\t__##PREFIX##dbg_print( \"\\tPushing non-terminal \" + labels[ pop_tab[act][0] ] );\n\t\t\t\t\n\t\t\tsstack.push( go );\n\t\t\tvstack.push( rval );\t\t\t\n\t\t}\n\t\t\n\t\tif( ##PREFIX##_dbg_withtrace )\n\t\t{\t\t\n\t\t\talert( ##PREFIX##_dbg_string );\n\t\t\t##PREFIX##_dbg_string = new String();\n\t\t}\n\t}\n\n\tif( ##PREFIX##_dbg_withtrace )\n\t{\n\t\t__##PREFIX##dbg_print( \"\\nParse complete.\" );\n\t\talert( ##PREFIX##_dbg_string );\n\t}\n\t\n\tif( err_cnt == 0 )\n\t{\n\t\t\n\t\t\n\t}\n\t\n\treturn err_cnt;\n}\n\nfunction __##PREFIX##dbg_image( name )\n{\n\treturn \"<img src=\\\"img/\" + name + \".png\\\" style=\\\"border: 0px; margin: 0px; padding: 0px;\\\" />\";\n}\n\nfunction __##PREFIX##dbg_get_tree_depth( nodes, tree, max )\n{\n\tvar\t\ttmp\t\t= 0;\n\t\n\tfor( var i = 0; i < tree.length; i++ )\n\t{\n\t\tif( nodes[ tree[i] ].child.length > 0 )\n\t\t\tif( max < ( tmp = __dbg_get_tree_depth( nodes, nodes[ tree[i] ].child, max+1 ) ) )\n\t\t\t\tmax = tmp;\n\t}\n\t\n\treturn max;\n}\n\nfunction __##PREFIX##dbg_parsetree( prev, cnt, depth, nodes, tree )\n{\n\tvar str = new String();\n\t\n\tif( cnt == 0 )\n\t\tstr += \"<table border=\\\"0\\\" cellpadding=\\\"0\\\" cellspacing=\\\"0\\\" class=\\\"parsetree\\\">\";\n\t\n\tif( !prev )\n\t\tprev = new Array();\n\t\t\n\tif( cnt > 0 )\n\t\tprev[cnt-1] = true;\n\t\t\t\n\tfor( var i = 0; i < tree.length; i++ )\n\t{\n\t\tstr += \"<tr>\";\n\n\t\tfor( var j = 0; j < cnt; j++ )\n\t\t{\n\t\t\tstr += \"<td>\";\n\n\t\t\tif( prev[j] )\n\t\t\t{\n\t\t\t\tif( j == cnt - 1 && i == tree.length - 1 )\n\t\t\t\t\tstr += __##PREFIX##dbg_image( \"ll\" );\n\t\t\t\telse if( j == cnt - 1 )\n\t\t\t\t\tstr += __##PREFIX##dbg_image( \"la\" );\n\t\t\t\telse\n\t\t\t\t\tstr += __##PREFIX##dbg_image( \"l\" );\n\t\t\t}\n\t\t\telse\n\t\t\t\tstr += __##PREFIX##dbg_image( \"e\" );\n\t\t\t\t\n\t\t\tstr += \"</td>\";\n\t\t}\n\t\t\n\t\tif( cnt > 0 && i == tree.length - 1 )\n\t\t\tprev[cnt-1] = false;\n\n\t\tstr += \"<td>\";\n\t\tif( nodes[ tree[i] ].child.length > 0 )\n\t\t\tif( cnt == 0 )\n\t\t\t\tstr += __##PREFIX##dbg_image( \"rn\" );\n\t\t\telse\n\t\t\t\tstr += __##PREFIX##dbg_image( \"n\" );\t\n\t\telse\n\t\t\tstr += __##PREFIX##dbg_image( \"t\" );\n\t\tstr += \"</td>\";\n\t\t\n\t\tstr += \"<td class=\\\"node_name\\\" colspan=\\\"\" + ( depth - cnt + 1 ) + \"\\\">\" + nodes[ tree[i] ].sym ;\n\t\tif( nodes[ tree[i] ].att && nodes[ tree[i] ].att != \"\" )\n\t\t\tstr += \":<span>\" + nodes[ tree[i] ].att + \"</span>\" ;\n\t\t\t\n\t\tstr += \"</td>\";\n\n\t\tif( nodes[ tree[i] ].child.length > 0 )\n\t\t\tstr += __##PREFIX##dbg_parsetree( prev, cnt+1, depth, nodes, nodes[ tree[i] ].child );\n\t}\n\t\n\tif( cnt == 0 )\n\t\tstr += \"</table>\";\n\t\n\treturn str;\n}\n\nfunction __##PREFIX##dbg_parsetree_phpSyntaxTree( nodes, tree )\n{\n\tvar str = new String();\n\t\n\tfor( var i = 0; i < tree.length; i++ )\n\t{\n\t\tstr += \" [ \";\n\n\t\tstr += nodes[ tree[i] ].sym;\n\t\tif( nodes[ tree[i] ].att && nodes[ tree[i] ].att != \"\" )\n\t\t{\n\t\t\tvar attr = new String( nodes[ tree[i] ].att );\n\t\t\tstr += \":\\\"\" + attr.replace( / |\\t|\\r|\\n|\\[|\\]/g, \"_\" ) + \"\\\"\";\n\t\t}\n\t\t\t\n\t\tstr += \" \";\n\n\t\tif( nodes[ tree[i] ].child.length > 0 )\n\t\t\tstr += __##PREFIX##dbg_parsetree_phpSyntaxTree( nodes, nodes[ tree[i] ].child );\n\n\t\tstr += \" ] \";\n\t}\n\t\n\treturn str;\n}\n\n\n##FOOTER##" );

  if( true )
    //code_foot = "var error_offsets = new Array(); var error_lookaheads = new Array(); var error_count = 0; var str = prompt( \"Please enter a string to be parsed:\", \"\" ); if( ( error_count = __parse( str, error_offsets, error_lookaheads ) ) > 0 ) { var errstr = new String(); for( var i = 0; i < error_count; i++ ) errstr += \"Parse error in line \" + ( str.substr( 0, error_offsets[i] ).match( /\\n/g ) ? str.substr( 0, error_offsets[i] ).match( /\\n/g ).length : 1 ) + \" near \\\"\" + str.substr( error_offsets[i] ) + \"\\\", expecting \\\"\" + error_lookaheads[i].join() + \"\\\"\\n\" ; alert( errstr );}";
    //code_foot = "var error_offsets = new Array(); var error_lookaheads = new Array(); var error_count = 0; var str = prompt( \"Please enter a string to be parsed:\", \"\" ); if( ( error_count = __parse( str, error_offsets, error_lookaheads ) ) > 0 ) { var errstr = new String(); for( var i = 0; i < error_count; i++ ) errstr += \"Parse error in line \" + ( str.substr( 0, error_offsets[i] ).match( /\\n/g ) ? str.substr( 0, error_offsets[i] ).match( /\\n/g ).length : 1 ) + \" near \\\"\" + str.substr( error_offsets[i] ) + \"\\\", expecting \\\"\" + error_lookaheads[i].join() + \"\\\"\\n\" ; alert( errstr );}";

  //driver is for output
  driver = driver.replace( /##PREFIX##/gi, "" );
  driver = driver.replace( /##HEADER##/gi, jscco.code_head );
  driver = driver.replace( /##TABLES##/gi, jscco.print_parse_tables( jscco.MODE_GEN_JS ) );
  driver = driver.replace( /##DFA##/gi, jscco.print_dfa_table( jscco.dfa_table ) );
  driver = driver.replace( /##TERMINAL_ACTIONS##/gi, jscco.print_term_actions() );
  driver = driver.replace( /##LABELS##/gi, jscco.print_symbol_labels() );
  driver = driver.replace( /##ACTIONS##/gi, jscco.print_actions() );
  driver = driver.replace( /##FOOTER##/gi, '' /*code_foot*/ ); //no code foot in compiled parser
  driver = driver.replace( /##ERROR##/gi, jscco.get_error_symbol_id() );
  driver = driver.replace( /##EOF##/gi, jscco.get_eof_symbol_id() );
  driver = driver.replace( /##WHITESPACE##/gi, jscco.get_whitespace_symbol_id() );
            
  //webdriver is for execution and parse tree generator
  webdriver = webdriver.replace( /##PREFIX##/gi, "" );
  webdriver = webdriver.replace( /##HEADER##/gi, jscco.code_head );
  webdriver = webdriver.replace( /##TABLES##/gi, jscco.print_parse_tables( jscco.MODE_GEN_JS ) );
  webdriver = webdriver.replace( /##DFA##/gi, jscco.print_dfa_table( jscco.dfa_table ) );
  webdriver = webdriver.replace( /##TERMINAL_ACTIONS##/gi, jscco.print_term_actions() );
  webdriver = webdriver.replace( /##LABELS##/gi, jscco.print_symbol_labels() );
  webdriver = webdriver.replace( /##ACTIONS##/gi, jscco.print_actions() );
  webdriver = webdriver.replace( /##FOOTER##/gi, jscco.code_foot );
  webdriver = webdriver.replace( /##ERROR##/gi, jscco.get_error_symbol_id() );
  webdriver = webdriver.replace( /##EOF##/gi, jscco.get_eof_symbol_id() );
  webdriver = webdriver.replace( /##WHITESPACE##/gi, jscco.get_whitespace_symbol_id() );            
  //driver = webdriver;
            
  //output the code
  //var parser_js_code = driver.replace( /\n/g, "<br />" ).replace( /\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;" );

  // Output the compiled parser.
  if (dstid != null)
    document.getElementById(dstid).innerHTML = parser_js_code;
  //document.getElementById(dstid).innerHTML = webdriver;

  //eval( webdriver ); // Run the web version of the parser.
  return webdriver;
}

this.build = function(str, dstid, show_warnings) {
  var pure_code, out_code, i;
            
  jscco.html_output = new String();
  jscco.error_output = new String();
  jscco.reset_all( jscco.EXEC_WEB );
            
  //show_warnings = document.source.with_warnings.checked;
  if (show_warnings == null) show_warnings = false;

  var src = new String( str );
  jscco.parse_grammar( src );
            
  if( jscco.errors == 0 ) {
    jscco.undef();
    jscco.unreachable();
                
    if( jscco.errors == 0 ) {
      jscco.first();
      jscco.print_symbols();
      jscco.print_grammar( jscco.MODE_GEN_HTML );
                    
      jscco.html_output += "<hr />";
                    
      jscco.dfa_table = jscco.create_subset( jscco.nfa_states );
      jscco.dfa_table = jscco.minimize_dfa( jscco.dfa_table );

      jscco.lalr1_parse_table( true );
                    
      jscco.errors = 0;
      //if( jscco.errors == 0 )
      //  document.getElementById( "output" ).innerHTML = jscco.html_output + "<hr />" + jscco.print_parse_tables( jscco.MODE_GEN_HTML );
    }
  }

  if( jscco.errors > 0 || jscco.warnings > 0 && jscco.error_output != "" )
    alert( jscco.error_output );
    
  return this.run_parser(dstid);
}

return this.build(str, dstid, show_warnings);

},

// For generating a parser by first loading a grammar from a specified location.
load: function(parserObjName, grammarLoc, success) {
  if (parserObjName == null || parserObjName == '' || grammarLoc == null || grammarLoc == '') return;
  var valId = 'JSCC_TEMP';
  var self = this;
  $("#body").append('<textarea id="'+valId+'" style="display:none;"></textarea>');
  $("#"+valId).load(grammarLoc, function(){
    var grammar = ge(valId).value;
    grammar = grammar.replace(/__ROOT__:/g, "p:");
    eval(parserObjName+' = '+self.parser(self.parser_prefix+" "+grammar+" "+self.parser_suffix)+';');
    $("#"+valId).remove();
    if (success != null) success();
  });
},

////////////////////////////////////////////////////////////////
// Parser combinators and preprocessors.

// Each unindented line is its own block. No new markup is added.
split_into_blocks_starting_with_unindented_line: function (s, marker) {
  if (marker == null || marker == undefined)
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
      if (lines[i].substring(0,1) != ' ') {
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
},

// Markup is added to delineate indentation blocks.
// A single string is returned.
indentation_blocks_add_markup: function (s) { 
  var lines = s.split("\n"), text = '', indent = [];
  var last = 0;
  for (var i = 0; i < lines.length; i++) {
    var cur = lines[i].countLeadingSpaces();
    
    if (cur > last) {
      text += "\n`INDENT_L`\n";
      indent.push(cur);
    }

    if (cur < last) {
      indent.pop();
      text += "\n`INDENT_R`\n";
      var expected = indent.last();
      while (cur != expected && indent.length > 0) {
        indent.pop();
        text += "\n`INDENT_R`\n";
        expected = indent.last();
      }
      if (cur != 0 && indent.length == 0) {
        alert("error");
        return null;
      }
    }

    if (lines[i].trim().length > 0)
      text += '`NEWLINE`'+lines[i];
    if (i < lines.length - 1)
      text += "\n";

    last = cur;
  }
  
  while (indent.length > 0) {
    text += "\n`INDENT_R`\n";
    indent.pop();
  }
  
  return text;
},

html_output: new String(),
error_output: new String(),
dfa_table: null,

parser_prefix: "[* function(str) { var __RESULT__ = null; *]",
parser_suffix: "[*"
  + " var error_offsets = new Array(), error_lookaheads = new Array(), error_count = 0;"
  + " if ( ( error_count = __parse( str, error_offsets, error_lookaheads ) ) > 0 )"
  + "   return new Error('parsing error'+error_lookaheads.join(''));"
  + " else"
  + "   return (__RESULT__==null || __RESULT__[0]==null) ? new Error('parsing error') : {status:'success', ast:__RESULT__}; } *]"
};

// The publically accessible namespace.
var JSCC = jscco;

/*eof*/
