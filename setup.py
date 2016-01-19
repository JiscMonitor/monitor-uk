from setuptools import setup, find_packages

setup(
    name = 'Monitor UK',
    version = '1.0.0',
    packages = find_packages(),
    install_requires = [
        "octopus==1.0.0",
        "esprit",
        "Flask"
    ],
    url = 'http://cottagelabs.com/',
    author = 'Cottage Labs',
    author_email = 'us@cottagelabs.com',
    description = 'Monitor UK aggregation and reporting interface',
    classifiers = [
        'Intended Audience :: Developers',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ],
)
