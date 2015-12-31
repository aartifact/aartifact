from distutils.core import setup

setup(
    name             = 'Aartifact',
    version          = '0.0.1.0',
    packages         = ['aartifact',],
    license          = 'MIT License',
	url              = 'http://aartifact.org',
	author           = 'A. Lapets',
	author_email     = 'a@lapets.io',
    description      = 'Lightweight domain-specific library for assembling verified algebraic proofs directly within Python.',
    long_description = open('README.md').read(),
)