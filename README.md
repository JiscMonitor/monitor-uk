# Monitor UK

APC aggregation and reporting interface

## Installation

Clone the project:

    git clone https://github.com/JiscMonitor/monitor-uk.git

get all the submodules

    cd myapp
    git submodule update --init --recursive
    
This will initialise and clone the esprit and magnificent octopus libraries, and their submodules in turn.

Create your virtualenv and activate it

    virtualenv /path/to/venv
    source /path/tovenv/bin/activate

Install the dependencies and this app in the correct order:

    cd myapp
    pip install -r requirements.txt
    
Create your local config

    cd myapp
    touch local.cfg

Then you can override any config values that you need to

Then, start your app with

    python service/web.py

