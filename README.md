# Monitor UK

APC aggregation and reporting interface.

## Developers

See the Install Guide in ```docs/INSTALL.md```.

System documentation is available in ```docs/system```.

By convention, development has been undertaken with [git flow](https://github.com/nvie/gitflow) which means:

* development work is undertaken on the ```develop``` branch, which has been set at the repo's default branch. The staging site is deployed from this branch.
* features are developed on **feature branches** prefixed ```feature/```. These will later be merged to ```develop``` and released.
* hotfixes are created on branches prefixed ```hotfix/``` and are deployed to both ```master``` and ```develop``` to fix urgent bugs.
* the ```master``` branch is reserved for tagged production releases.

## API Users

See the API documentation in ```docs/API```.

