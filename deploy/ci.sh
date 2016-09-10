#! /bin/bash
# Continuous integration script, run via codeship to deploy monitoruk.cottagelabs.com

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR/..

# Update the project submodules
git submodule update --init --recursive

# Update the project dependencies
. ../bin/activate
pip install -r requirements.txt

# Update the supervisor config then restart the application group
sudo supervisorctl reread
sudo supervisorctl update monitor-uk
sudo supervisorctl restart monitor-uk:*

# reload the webserver config if syntax is OK
sudo nginx -t && sudo nginx -s reload
