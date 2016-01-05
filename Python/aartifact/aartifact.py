#####################################################################
## 
## aartifact.py
##
##   Lightweight domain-specific formal verification library for
##   assembling algebraic proofs directly within Python.
##
##   Web:     aartifact.org
##   Version: 0.0.1.0
##
##

#####################################################################
## ...
##

import ast     # For working with Python abstract syntax trees.
import inspect # To retrieve a function body's source code.

class AartifactError(Exception):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)

class Context():
    def __init__(self):
        self.mod = None
        self.left = None
        self.right = None

class Term():
    def __init__(self, arg = None):
        if arg is None:
            self.dict = {():0}
        elif type(arg) == str:
            self.dict = {():0}
            self.dict[arg] = 1
        elif type(arg) == int:
            self.dict = {():arg}

    def __add__(self, other):
        result = Term()
        for k in set(self.dict.keys()) | set(other.dict.keys()):
            result[k] = 0
            if k in self.dict:
                result[k] += self.dict[k]
            if k in other.dict:
                result[k] += other.dict[k]
        return result

    def __repr__(self):
        return str(self.dict)

# The ModularArithmetic class is used for verifying an algebraic
# proof involving common constructs and algebraic manipulations in
# modular arithmetic.
class ModularArithmetic():
    def __new__(cls, func = None):
        # Either create a new object of this class in order to
        # process functions in the future (if no function is
        # supplied at the time of creation), or immediately
        # process the supplied function and return the result.
        # This allows the class to also be used as a decorator.
        if func is None:
            return object.__new__(cls)
        else:
            return object.__new__(cls).process(func)

    def process(self, func):
        a = ast.parse(inspect.getsource(func))
        #print(ast.dump(a))
        return self.convert(a)

    def convert(self, a, context = Context()):
        if type(a) == ast.Module:
            return self.convert(a.body[0], context)
        elif type(a) == ast.FunctionDef:
            for e in a.body:
                context = self.convert(e, context)
            return True
        elif type(a) == ast.Expr:
            return self.convert(a.value, context)
        elif type(a) == ast.Compare:
            if len(a.ops) == 2 and type(a.ops[0]) == ast.Eq and type(a.ops[1]) == ast.Is:
                if type(a.comparators[1]) == ast.Name and a.comparators[1].id == 'Assumption':
                    l = self.left(a.left, context)
                    r = self.right(a.comparators[0], context)
                    return True
                else:
                    raise AartifactError("The supplied justification is not supported.")
        else:
            raise AartifactError("The expression is not a supported formula.")

    def left(self, a, context):
        if type(a) == ast.Name:
            return Term(a.id)
        elif type(a) == ast.Num:
            return Term(a.n)
        elif type(a) == ast.BinOp and type(a.op) == ast.Add:
            return self.left(a.left, context) + self.left(a.right, context)
        else:
            raise AartifactError("The expression is not a supported left-hand equation term.")

    def right(self, a, context):
        if type(a) == ast.Name:
            return Term(a.id)
        elif type(a) == ast.Num:
            return Term(a.n)
        elif type(a) == ast.BinOp and type(a.op) == ast.Add:
            return self.right(a.left, context) + self.right(a.right, context)
        elif type(a) == ast.BinOp and type(a.op) == ast.Mod and type(a.right) == ast.Num:
            return self.right(a.left, context)
        else:
            raise AartifactError("The expression is not a supported right-hand equation term.")

    def verify(self, a):
        pass

##eof