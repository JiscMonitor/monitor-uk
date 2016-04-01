# For Developers

## Dependencies

* Ubuntu 14.04 - all dev has been done under this version of linux, but it ought to work under all flavours.

* Python 2.7 + pip, setuptools and virtualenv.  If you are using Ubuntu, python, pip and setuptools should already be installed, then you can do:

    sudo pip install virtualenv

* LibXML2 and LibXSLT1.1.  Under Ubuntu this can be done with:

    sudo apt-get install libxml2 libxml2-dev python-libxml2
    
    sudo apt-get install libxslt1.1 libxslt1-dev python-libxslt1
    
    sudo apt-get install python-dev
    
    sudo apt-get install zlib1g-dev

* Elasticsearch 1.x - the development has so far been done on ES 1.7.5, though any version on the 1.x branch should do.  Do not use 0.x.  2.x has not been tested, but may work.

## Installation

Clone the project:

    git clone https://github.com/JiscMonitor/monitor-uk.git

get all the submodules

    cd monitor-uk
    git submodule update --init --recursive
    
This will initialise and clone the esprit and magnificent octopus libraries, and their submodules in turn.

Create your virtualenv and activate it

    virtualenv /path/to/venv
    source /path/tovenv/bin/activate

Install the dependencies and this app in the correct order:

    cd monitor-uk
    pip install -r requirements.txt
    
Create your local config by copying the template local config

    cp monitor-uk/template.local.cfg monitor-uk/local.cfg

Then open that file up for editing, and set any parameters for your local deployment.

## Startup

Ensure that Elasticsearch is running, and the local.cfg points to the correct location

Start the web app with:

    python service/web.py

Start the scheduler (which runs all the asynchronous processing) with:

    python magnificent-octopus/octopus/bin/run.py start_scheduler
    

