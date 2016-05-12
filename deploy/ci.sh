#! /bin/bash

# Continuous integration script, run via codeship

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR/..
git submodule update --init --recursive
. ../bin/activate
pip install -r requirements.txt

sudo supervisorctl reread
sudo supervisorctl update monitor-uk
sudo supervisorctl restart monitor-uk

# reload the config if syntax is OK
sudo nginx -t && sudo nginx -s reload
