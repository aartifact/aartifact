var language = (function(){return uxadt.C("Parser", [uxadt.C("Productions", [[uxadt.C("Production", ["Top", [[uxadt.C("Choice", ["Top", [uxadt.C("NonTerminal", ["Stmt"])]])]]]), uxadt.C("Production", ["Stmt", [[uxadt.C("Choice", ["Assert", [uxadt.C("Terminal", ["assert"]), uxadt.C("NonTerminal", ["Exp"])]]), uxadt.C("Choice", ["Assume", [uxadt.C("Terminal", ["assume"]), uxadt.C("NonTerminal", ["Exp"])]])]]]), uxadt.C("Production", ["Exp", [[uxadt.C("Choice", ["True", [uxadt.C("Terminal", ["true"])]]), uxadt.C("Choice", ["False", [uxadt.C("Terminal", ["false"])]]), uxadt.C("Choice", ["Not", [uxadt.C("Terminal", ["not"]), uxadt.C("NonTerminal", ["Exp"])]])]]])]]), uxadt.C("Terminals", [[uxadt.C("Terminal", ["assert"]), uxadt.C("Terminal", ["assume"]), uxadt.C("Terminal", ["true"]), uxadt.C("Terminal", ["false"]), uxadt.C("Terminal", ["not"])]])]);})();