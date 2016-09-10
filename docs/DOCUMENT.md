# Documentation Generation

To compile the documentation, there is a script ```document.sh``` at the root of the repository.

## Dependencies

* NVM (recommended, not required) https://github.com/creationix/nvm
* Node: https://nodejs.org/en/
* JSDoc: https://github.com/jsdoc3/jsdoc

You should also have Monitor-UK fully installed, which will fulfil the requirement of pdoc for Python documentation - it is installed
with the other project requirements.

## Generation

Ensure Node is accessible on your ```PATH```, check that ```document.sh``` contains the correct path to your installed version of JSDoc,
by changing the line:

    JSDOC=~/node_modules/jsdoc/jsdoc.js

Then run ```document.sh``` - the documentation in ```docs/js``` and ```docs/py``` will be refreshed.
