##################################################
# overrides for the webapp deployment

DEBUG = True
PORT = 5000
SSL = False
THREADED = True

############################################
# important overrides for the ES module

# elasticsearch back-end connection settings
ELASTIC_SEARCH_HOST = "http://localhost:9200"
ELASTIC_SEARCH_INDEX = "muk"
ELASTIC_SEARCH_VERSION = "1.7.5"

# Classes from which to retrieve ES mappings to be used in this application
# (note that if ELASTIC_SEARCH_DEFAULT_MAPPINGS is sufficient, you don't need to
# add anything here
ELASTIC_SEARCH_MAPPINGS = [
    "octopus.modules.account.dao.BasicAccountDAO",
]

# initialise the index with example documents from each of the types
# this will initialise each type and auto-create the relevant mappings where
# example data is provided
ELASTIC_SEARCH_EXAMPLE_DOCS = [
    # "service.dao.MyDAO"
]

############################################
# important overrides for account module

ACCOUNT_ENABLE = True
SECRET_KEY = "super-secret-key"

ACCOUNT_LIST_USERS = True

ACCOUNT_MODEL = "octopus.modules.account.models.BasicAccount"

CLIENTJS_ACCOUNT_LIST_ENDPOINT = "/account_query/account"

# You will also need to specify the query route as follows
QUERY_ROUTE = {
    "account_query" : {
        "account" : {
            "auth" : True,
            "role" : "list-users",
            "filters" : [
                 "octopus.modules.account.dao.query_filter"
             ],
            "dao" : "octopus.modules.account.dao.BasicAccountDAO"
        }
    }
}

#############################################
# important overrides for storage module

#STORE_IMPL = "octopus.modules.store.store.StoreLocal"
#STORE_TMP_IMPL = "octopus.modules.store.store.TempStore"

from octopus.lib import paths
STORE_LOCAL_DIR = paths.rel2abs(__file__, "..", "service", "tests", "local_store", "live")
STORE_TMP_DIR = paths.rel2abs(__file__, "..", "service", "tests", "local_store", "tmp")