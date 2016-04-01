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

ACCOUNT_MODEL = "service.models.MonitorUKAccount"
ACCOUNT_USER_FORM_CONTEXT = "service.forms.account.MonitorUKUserFormContext"

ACCOUNT_DEFAULT_ROLES = ["write_apc"]

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
            "dao" : "service.models.MonitorUKAccount"
        }
    }
}

###############################################
# CRUD API configuration

CRUD = {
    "apc" : {
        "model" : "service.models.crud.ApiRequest",
        "create" : {
            "enable" : True,
            "auth" : True,
            "roles" : ["write_apc"],
            "response" : {
                "location" : False
            }
        },
        "retrieve" : {
            "enable" : True,
            "auth" : True,
            "roles" : ["write_apc"]
        },
        "update" : {
            "enable" : True,
            "auth" : True,
            "roles" : ["write_apc"],
            "response" : {
                "location" : False
            }
        },
        "append" : {
            "enable" : True,
            "auth" : True,
            "roles" : ["write_apc"],
            "response" : {
                "location" : False
            }
        },
        "delete" : {
            "enable" : True,
            "auth" : True,
            "roles" : ["write_apc"],
        }
    }
}

##############################################################
# Public Search API Configuration

# The search configuration for each mount point
SEARCHAPI = {
    "public" : {
        "auth" : True,
        "roles" : ["read_apc"],
        "default_page_size" : 10,
        "max_page_size" : 100,
        "search_no_mod" : [
            "created_date",
            "last_updated"
        ],
        "search_prefix" : "record.",
        "search_subs" : {
            "id" : "id.exact",
            "doi" : "index.doi.exact",
            "pmcid" : "index.pmcid.exact",
            "pmid" : "index.pmid.exact",
            "url" : "index.url.exact",
            "issn" : "index.issn.exact"
        },
        "sort_prefix" : "record.",
        "sort_subs" : {
            "dc:title" : "index.ascii_unpunc_title.exact",
            "record.dc:title" : "index.ascii_unpunc_title.exact",
            "apc_total_amount_gbp" : "index.apc_total_amount_gbp",
            "apc_total_vat_gbp" : "index.apc_total_vat_gbp",
            "apc_total_gbp" : "index.apc_total_gbp",
            "sum_total_gbp" : "index.sum_total_gbp"
        },
        "query_builder" : "service.queries.PublicSearchQuery",
        "dao" : "service.search.StaticPublicDAOProxy",
        "results_filter" : "service.search.public_filter"
    },

    "private" : {
        "auth" : True,
        "roles" : ["write_apc"],
        "default_page_size" : 10,
        "max_page_size" : 100,
        "search_no_mod" : [
            "created_date",
            "last_updated"
        ],
        "search_prefix" : "record.",
        "search_subs" : {
            "id" : "id.exact",
            "doi" : "index.doi.exact",
            "pmcid" : "index.pmcid.exact",
            "pmid" : "index.pmid.exact",
            "url" : "index.url.exact",
            "issn" : "index.issn.exact"
        },
        "sort_prefix" : "record.",
        "sort_subs" : {
            "dc:title" : "index.ascii_unpunc_title.exact",
            "record.dc:title" : "index.ascii_unpunc_title.exact",
            "apc_total_amount_gbp" : "index.apc_total_amount_gbp",
            "apc_total_vat_gbp" : "index.apc_total_vat_gbp",
            "apc_total_gbp" : "index.apc_total_gbp",
            "sum_total_gbp" : "index.sum_total_gbp"
        },
        "query_builder" : "service.queries.PrivateSearchQuery",
        "dao" : "service.search.StaticPublicDAOProxy",
        "results_filter" : "service.search.private_filter"
    }
}

#######################################################
## Task scheduler configuration

SCHEDULER_TASKS = [
    # every 10 seconds trigger the request processing task - this converts requests for updates into public apc records
    (10, "seconds", None, "service.tasks.process_requests")
]

#############################################
# important overrides for storage module

#STORE_IMPL = "octopus.modules.store.store.StoreLocal"
#STORE_TMP_IMPL = "octopus.modules.store.store.TempStore"

from octopus.lib import paths
STORE_LOCAL_DIR = paths.rel2abs(__file__, "..", "service", "tests", "local_store", "live")
STORE_TMP_DIR = paths.rel2abs(__file__, "..", "service", "tests", "local_store", "tmp")



##############################################
## App specific config

# if the workflow state does not have a "last request" date recorded, what is the date it should report
# (basically, this just needs to be earlier than the service went live.  We use the start of the unix epoch by default)
WORKFLOW_STATE_EARLIEST_DATE = "1970-01-01T00:00:00Z"