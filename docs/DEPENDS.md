# All Dependencies for Monitor UK

All dependencies are gathered here for your convenience.

## The Web App
**```INSTALL.md```**

### Environment

* Ubuntu 14.04 - most dev has been done under this version of Linux, but it ought to work under all flavours.

* OS X - installation requires xcode-select via ```xcode-select --install``` to compile libxml.

* Python 2.7 + pip, setuptools and virtualenv.  If you are using Ubuntu, python, pip and setuptools should already be installed, then you can do:

    sudo pip install virtualenv

* LibXML2 and LibXSLT1.1.  Under Ubuntu this can be done with:

    sudo apt-get install libxml2 libxml2-dev python-libxml2
    
    sudo apt-get install libxslt1.1 libxslt1-dev python-libxslt1
    
    sudo apt-get install python-dev
    
    sudo apt-get install zlib1g-dev
    
### Submodules
* ElasticSearch 1.x - the development has so far been done on ES 1.7.5, though any version on the 1.x branch should do.  Do not use 0.x.  2.x has not been tested, but may work.

* esprit - installed via a submodule, this is a lightweight toolbox which handles communication with ElasticSearch. Mounted at ```esprit/```.

* magnificent-octopus - this is the Cottage Labs web app framework, based on Flask, it contains useful modules for Python web apps which use ElasticSearch. 
Mounted at ```magnificent-octpus/```.

    + edges - a reporting, searching, and visualisation frontend for web apps using ElasticSearch. 
    Submodule of octopus, mounted at ```magnificent-octpus/octopus/static/vendor/edges```.
    
    + facetview2 - the predecessor to edges, not used in this project. Submodule of octopus, mounted at ```magnificent-octpus/octopus/static/vendor/facetview2```.
    
    
## Secondary functions
**For documentation generation ```DOCUMENT.md``` and the asset compiler ```ASSETS.md```.**

* NVM (recommended, not required) https://github.com/creationix/nvm - this lets you install various versions of Node on the same system, to ease version mismatch problems.
Once installed, you can use ```nvm install 6.5``` to get the most recent version of Node, then ```nvm use 6.5```.
* Node: https://nodejs.org/en/ - can be installed with NVM as above.
* JSDoc: https://github.com/jsdoc3/jsdoc - install via ```npm install jsdoc``` (for the current directory) or ```npm install jsoc --global``` for a global install.
* Uglify: http://lisperator.net/uglifyjs/ - ```npm install uglifyjs``` or with ```--global```.

You will probably need to update the scripts referred by the documentation depending on where you install Node and the packages.

## Deployment
```DEPLOY.md```

* supervisor (optional) to run the application as a group with easy management
* nginx to serve it
* SSL certificates, etc.
