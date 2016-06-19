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
## mail server configuration

MAIL_FROM_ADDRESS = "no-reply@jisc.ac.uk"

MAIL_SUBJECT_PREFIX = "[Monitor UK] "

# Settings for Flask-Mail. Set in local.cfg
MAIL_SERVER = None          # default localhost
MAIL_PORT = 25              # default 25
MAIL_USERNAME = None              # default None
MAIL_PASSWORD = None              # default None

############################################
# important overrides for account module

ACCOUNT_ENABLE = True
SECRET_KEY = "super-secret-key"

ACCOUNT_LIST_USERS = True

# list of fields to be inserted into the _source part of a query on the account index.
# This prevents us from sending information like api keys or hashed passwords to the front-end
ACCOUNT_LIST_USERS_INCLUDE_SOURCE = ["id", "email", "created_date", "last_updated", "role", "organisation", "org_role", "name"]

ACCOUNT_MODEL = "service.models.MonitorUKAccount"
ACCOUNT_USER_FORM_CONTEXT = "service.forms.account.MonitorUKUserFormContext"
ACCOUNT_USER_FORM_ADMIN_CONTEXT = "service.forms.account.MonitorUKUserAdminFormContext"
ACCOUNT_ACTIVATE_FORM_CONTEXT = "service.forms.account.MonitorUKActivateFormContext"

ACCOUNT_DEFAULT_ROLES = ["write_apc", "read_apc"]

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
    },
    "query" : {
        "apc" : {
            "auth" : True,
            "role" : None,
            "filters" : [
                # "service.search.report_query_filter"
            ],
            "dao" : "service.search.StaticPublicDAOProxy"
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

API_JSON_LD_CONTEXT = {
    "jm": "http://jiscmonitor.jiscinvolve.org/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dcterms": "http://purl.org/dc/terms/",
    "rioxxterms": "http://rioxx.net/v2-0-beta-1/",
    "ali" : "http://www.niso.org/schemas/ali/1.0/jsonld.json"
}

# Email address to be presented on the login page for the user to contact if they wish to request an account
MONITOR_ACCOUNT_REQUEST_EMAIL = "monitor+account@jisc.ac.uk"

PRIMARY_NAVIGATION = [
    {
        "label" : "Search",
        "url" : {
            "url_for" : "search",
        },
        "visibility" : {
            "auth" : True,
            "anonymous" : False
        },
        "main_nav" : True,
        "breadcrumb" : False
    },
    {
        "label" : "Publisher",
        "url" : {
            "url_for" : "publisher"
        },
        "visibility" : {
            "auth" : True,
            "anonymous" : False
        },
        "main_nav" : True,
        "breadcrumb" : False
    },
    {
        "label": "Funder",
        "url": {
            "url_for": "funder"
        },
        "visibility": {
            "auth": True,
            "anonymous": False
        },
        "main_nav": True,
        "breadcrumb": False
    }
]

SECONDARY_NAVIGATION = [
    {
        "label" : "Your Account",
        "url" : {
            "url_for" : "account.username",
            "current_user_kwargs" : [
                {
                    "property" : "email",
                    "arg_name" : "username"
                }
            ]
        },
        "main_nav" : True,
        "breadcrumb" : False,
        "visibility" : {
            "auth" : True,
            "anonymous" : False
        }
    },
    {
        "label" : "Admin",
        "url" : {
            "url_for" : "admin.index"
        },
        "match" : [
            {"url_for" : "account.register", "type" : "exact"},
            {"url_for" : "account.username", "kwargs" : {"username" : ""}, "type" : "startswith"},
            {
                "action" : "deactivate",
                "url_for" : "account.username",
                "current_user_kwargs" : [
                    {
                        "property" : "email",
                        "arg_name" : "username"
                    }
                ]
            },
            {"url_for" : "account.index", "type" : "exact"},
            {"url_for" : "account.login", "type" : "exact", "action" : "deactivate"},
            {"url_for" : "account.forgot", "type" : "exact", "action" : "deactivate"},
            {"url_for" : "account.forgot_pending", "type" : "exact", "action" : "deactivate"},
            {"url_for" : "account.reset", "kwargs" : {"reset_token" : ""}, "type" : "startswith", "action" : "deactivate"}
        ],
        "main_nav" : True,
        "breadcrumb" : True,
        "visibility" : {
            "auth" : True,
            "anonymous" : False,
            "role" : ["admin"]
        },
        "always_show_subnav" : True,
        "subnav" : [
            {
                "label" : "Manage&nbsp;Users",
                "url" : {
                    "url_for" : "account.index"
                },
                "match" : [
                    {"url_for" : "account.register", "type" : "exact"},
                    {"url_for" : "account.username", "kwargs" : {"username" : ""}, "type" : "startswith"},
                    {
                        "action" : "deactivate",
                        "url_for" : "account.username",
                        "current_user_kwargs" : [
                            {
                                "property" : "email",
                                "arg_name" : "username"
                            }
                        ]
                    }
                ],
                "main_nav" : True,
                "breadcrumb" : True,
                "subnav" : [
                    {
                        "label" : "Create&nbsp;User",
                        "url" : {
                            "url_for" : "account.register"
                        },
                        "main_nav" : False,
                        "breadcrumb" : True,
                        "link_on_active" : False
                    },
                    {
                        "label" : "Edit User",
                        "match" : [
                            {"url_for" : "account.username", "kwargs" : {"username" : ""}, "type" : "startswith"},
                            {
                                "action" : "deactivate",
                                "url_for" : "account.username",
                                "current_user_kwargs" : [
                                    {
                                        "property" : "email",
                                        "arg_name" : "username"
                                    }
                                ]
                            },
                            {"url_for" : "account.index", "action" : "deactivate"},
                            {"url_for" : "account.register", "action" : "deactivate"}
                        ],
                        "main_nav" : False,
                        "breadcrumb" : True,
                        "link_on_active" : False
                    }
                ]
            },
            {
                "label" : "Create User",
                "url" : {
                    "url_for" : "account.register",
                },
                "main_nav" : True,
                "breadcrumb" : False
            }
        ]
    },
    {
        "label" : "Log In",
        "url" : {
            "url_for" : "account.login",
        },
        "match" : [
            {"url_for" : "account.forgot", "type" : "exact"},
            {"url_for" : "account.forgot_pending", "type" : "exact"},
            {"url_for" : "account.reset", "kwargs" : {"reset_token" : ""}, "type" : "startswith"}
        ],
        "main_nav" : True,
        "breadcrumb" : True,
        "visibility" : {
            "auth" : False,
            "anonymous" : True
        },
        "subnav" : [
            {
                "label" : "Forgotten Password",
                "url" : {
                    "url_for" : "account.forgot"
                },
                "main_nav" : False,
                "match" : [
                    {"url_for" : "account.forgot_pending", "type" : "exact"}
                ],
                "breadcrumb" : True,
                "subnav" : [
                    {
                        "label" : "Password Reset",
                        "url_for" : "account.forgot_pending",
                        "match" : [
                            {"url_for" : "account.forgot_pending", "type" : "exact"}
                        ],
                        "main_nav" : False,
                        "breadcrumb" : True,
                        "link_on_active" : False
                    }
                ]
            },
            {
                "label" : "Reset your password",
                "match" : [
                    {"url_for" : "account.reset", "kwargs" : {"reset_token" : ""}, "type" : "startswith"}
                ],
                "main_nav" : False,
                "breadcrumb" : True,
                "link_on_active" : False
            }
        ]
    },
    {
        "label" : "Log Out",
        "url" : {
            "url_for" : "account.logout"
        },
        "main_nav" : True,
        "breadcrumb" : False,
        "visibility" : {
            "auth" : True,
            "anonymous" : False
        }
    }
]

SITE_NAVIGATION = PRIMARY_NAVIGATION + SECONDARY_NAVIGATION

# Javascript endpoint configurations
CLIENTJS_PUBLIC_QUERY_ENDPOINT = "/query/apc"
