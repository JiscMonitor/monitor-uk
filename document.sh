#!/usr/bin/env bash
# Generate the code documentation for Monitor UK.

# For JavaScript documentation generation you need to have node installed and on your path, and you need to have jsdoc
# installed in node. See: http://usejsdoc.org/

# Python documentation requires you to have pdoc installed, which is part of the project dependencies installed via pip.

# Change this if you have jsdoc installed somewhere else!
JSDOC=~/node_modules/jsdoc/jsdoc.js

node $JSDOC -d ~/Code/External/monitor-uk/docs/js/ ~/Code/External/monitor-uk/service/static/js-src/muk.publisher.js ~/Code/External/monitor-uk/service/static/js-src/muk.search.js

# Create the JavaScript docs
rm -r docs/js/*
node $JSDOC -c jsdoc.conf.json

# Create the python docs
rm -r docs/py/*

# Change this if your monitor-uk virtualenv is elsewhere
. ../bin/activate

pdoc --html service --html-dir docs/py
pdoc --html config --html-dir docs/py
