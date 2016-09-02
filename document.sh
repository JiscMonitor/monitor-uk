#!/usr/bin/env bash

# You need to have node installed and on your path, and you need to have jsdoc installed in node
# See: http://usejsdoc.org/

# You also need to have pdoc installed, which is part of the project dependencies installed via pip

JSDOC=~/node_modules/jsdoc/jsdoc.js
#JSDOC=node_modules/jsdoc/jsdoc.js

node $JSDOC -d ~/Code/External/monitor-uk/docs/js/ ~/Code/External/monitor-uk/service/static/js-src/muk.publisher.js ~/Code/External/monitor-uk/service/static/js-src/muk.search.js

rm -r docs/js/*
node $JSDOC -c jsdoc.conf.json

rm -r docs/py/*
. ../bin/activate
pdoc --html service --html-dir docs/py
pdoc --html config --html-dir docs/py

# You also need to have epydoc (http://epydoc.sourceforge.net/) installed, which can be done
# on Ubuntu with
#
# sudo apt-get install python-epydoc
#epydoc --html -o docs/py/ --name "Monitor UK" --url https://github.com/JiscMonitor/monitor-uk --graph all --inheritance grouped --docformat restructuredtext service config
