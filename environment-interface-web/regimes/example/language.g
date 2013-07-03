
Top ::=
  Top | `Stmt

Stmt ::=
   Assert | assert `Exp
   Assume | assume `Exp

Exp ::=
   True | true
  False | false
    Not | not `Exp
