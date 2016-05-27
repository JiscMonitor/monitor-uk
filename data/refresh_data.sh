#! /bin/bash

# Switch to the data directory
cd "$( dirname "${BASH_SOURCE[0]}" )"

# Activate the virtualenv if it's not already on
if [[ -z "$VIRTUAL_ENV" ]]; then
    . ../../bin/activate
fi

# Drop the types for requests and public records
curl -X DELETE localhost:9200/muk/request
curl -X DELETE localhost:9200/muk/public

# Re-import the data
python import_data.py
