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
        print(ast.dump(a))
        return self.verify(a)

    def verify(self, a):
        pass

##eof