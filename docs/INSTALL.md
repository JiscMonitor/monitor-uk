# For Developers

Information about the JS and CSS assets, is in [ASSETS.md](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/ASSETS.md) - you need to choose between development and minified production assets.

For production deployment guidance, see [DEPLOY.md](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/DEPOLOY.md).

## Dependencies

* Ubuntu 14.04 - most dev has been done under this version of Linux, but it ought to work under all flavours.

* OS X - installation requires xcode-select via ```xcode-select --install``` to compile libxml.

* Python 2.7 + pip, setuptools and virtualenv.  If you are using Ubuntu, python, pip and setuptools should already be installed, then you can do:

    sudo pip install virtualenv

* LibXML2 and LibXSLT1.1.  Under Ubuntu this can be done with:

    sudo apt-get install libxml2 libxml2-dev python-libxml2
    
    sudo apt-get install libxslt1.1 libxslt1-dev python-libxslt1
    
    sudo apt-get install python-dev
    
    sudo apt-get install zlib1g-dev

* ElasticSearch 1.x - the development has so far been done on ES 1.7.5, though any version on the 1.x branch should do.  Do not use 0.x.  2.x has not been tested, but may work.

* Some non-essential functions depend on Node modules - see [DEPENDS.md](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/DEPENDS.md).

## Installation

Clone the project:

    git clone https://github.com/JiscMonitor/monitor-uk.git

Get all of the submodules:

    cd monitor-uk
    git submodule update --init --recursive
    
This will initialise and clone the esprit and magnificent-octopus libraries, and their submodules in turn.

Create your virtualenv and activate it:

    virtualenv /path/to/venv
    source /path/tovenv/bin/activate
    
(To disable the virtualenv later, use the ```deactivate``` command.)

Install the dependencies and this app in the correct order:

    cd monitor-uk
    pip install -r requirements.txt
    
Create your local config by copying the template local config:

    cp monitor-uk/template.local.cfg monitor-uk/local.cfg

Then open that file up for editing, and set any parameters for your local deployment, such as ElasticSearch and mail configurations.

## Startup

Ensure that ElasticSearch is running, the ```local.cfg``` points to the correct location, and your virtualenv is active.

Start the web app with:

    python service/web.py

Start the scheduler (which runs all the asynchronous processing) with:

    python magnificent-octopus/octopus/bin/run.py start_scheduler
    

## Creating the first Admin user

First create the user account with the basic information:

    python magnificent-octopus/octopus/bin/run.py usermod -e <your email> -p <password> -r admin

Then log in as this user in the running web app from:

    /account/login

(The app will be accessible where configured in the ```local.cfg``` file, by default this is ```http://localhost:5000```)

Then visit "Your Account" and populate the remaining required information:

    /account/<your email>

## Testing

For information on running the system tests, see [Test Information](https://github.com/JiscMonitor/monitor-uk/blob/develop/service/tests/README.md)