#!/bin/sh

# Continuous integration script

. ../bin/activate
git submodule update --init --recursive
pip install -r requirements.txt

sudo supervisorctl reread monitor-uk
sudo supervisorctl update monitor-uk
kill -HUP $(sudo supervisorctl pid monitor-uk)

# reload the config if syntax is OK
sudo nginx -t && sudo nginx -s reload
