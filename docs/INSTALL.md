# For Developers

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

Start the web app with:

    python service/web.py

Start the scheduler (which runs all the asynchronous processing) with:

    python magnificent-octopus/octopus/bin/run.py start_scheduler
    

