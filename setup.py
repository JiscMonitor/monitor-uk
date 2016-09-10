from setuptools import setup, find_packages

setup(
    name = 'Monitor UK',
    version = '1.0.0',
    packages = find_packages(),
    install_requires = [
        "octopus==1.0.0",                                                       # Skeleton web app modules and tools
        "esprit",                                                               # For communicating with ElasticSearch
        "Flask==0.10.1",                                                        # The web app framework
        "pdoc"                                                                  # Used only for generating documentation
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
