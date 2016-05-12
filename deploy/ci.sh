#!/bin/sh

# Continuous integration script, run via codeship
cd ..

git submodule update --init --recursive
source ../bin/activate
pip install -r requirements.txt

sudo supervisorctl reread
sudo supervisorctl update monitor-uk
sudo supervisorctl restart monitor-uk

# reload the config if syntax is OK
sudo nginx -t && sudo nginx -s reload
