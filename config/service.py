"""
Main service configuration, overrides default Octopus configurations and adds application specific ones
"""

##################################################
# overrides for the webapp deployment

DEBUG = False
""" Run the web server in debug mode"""

PORT = 5000
""" Port to run the web server on"""

SSL = True
""" Is SSL enabled"""

THREADED = True
""" Should the server run in multi-threaded mode (almost always should be True)"""

VERSION = "1.0.2"
""" Version number of the application, which is used in part to version the URLs to UI assets, for cache-busting purposes """

############################################
# important overrides for the ES module

# elasticsearch back-end connection settings
ELASTIC_SEARCH_HOST = "http://localhost:9200"
""" Elasticsearch Host URL"""

ELASTIC_SEARCH_INDEX = "muk"
""" Application index name """

ELASTIC_SEARCH_VERSION = "5.1.1"
""" Elasticsearch version.   Do not use 0.x.  Code should work with 1.x and 5.x and probably everything in between"""

ELASTIC_SEARCH_DEFAULT_MAPPING = {
    'dynamic_templates': [
        {
            'default': {
                'match': '*',
                'match_mapping_type': 'string',

                'mapping': {
                    "type" : "{dynamic_type}",
                    'index': True,
                    'store': False,
                    'fields': {
                        'exact': {
                            'index': True,
                            'store': True,
                            'type': 'keyword'
                        }
                    }
                }
            }
        }
    ],
    'properties': {
        'location': {'type': 'geo_point'}
    }
}
""" ES 5.x mapping override for the default mapping in Octopus (which is for < 5.x """

# Classes from which to retrieve ES mappings to be used in this application
# (note that if ELASTIC_SEARCH_DEFAULT_MAPPINGS is sufficient, you don't need to
# add anything here
ELASTIC_SEARCH_MAPPINGS = [
    "octopus.modules.account.dao.BasicAccountDAO",
]
""" List of DAOs whose mappings are required to be created at first startup """

############################################
## mail server configuration

MAIL_FROM_ADDRESS = "no-reply@jisc.ac.uk"
""" address from which email from this service will appear to originate """

MAIL_SUBJECT_PREFIX = "[Monitor UK] "
""" Text string to prefix to every email which comes from this application """

# Settings for Flask-Mail. Set in local.cfg
MAIL_SERVER = None          # default localhost
""" Mail server for outgoing mail - set in local.cfg """

MAIL_PORT = 25              # default 25
""" Mail port for outgoing mail - set in local.cfg """

MAIL_USERNAME = None              # default None
""" Mail server username, if required - set in local.cfg """

MAIL_PASSWORD = None              # default None
""" Mail server password, if required - set in local.cfg """

#######################################################
# Command line scripts

# if you want to disable the user modification script once admin has been added, comment out the line beginning "usermod"
CLI_SCRIPTS = {
    "usermod" : "octopus.modules.account.scripts.UserMod",
    "start_scheduler" : "octopus.modules.scheduler.cli.StartScheduler"
}

############################################
# important overrides for account module

ACCOUNT_ENABLE = True
""" Is the account module enabled - required for this application """

SECRET_KEY = "super-secret-key"
""" Secret key to use in user authentication - set this in local.cfg """

ACCOUNT_LIST_USERS = True
""" Account module allows user listing """

# list of fields to be inserted into the _source part of a query on the account index.
# This prevents us from sending information like api keys or hashed passwords to the front-end
ACCOUNT_LIST_USERS_INCLUDE_SOURCE = ["id", "email", "created_date", "last_updated", "role", "organisation", "org_role", "name"]
""" When users are listed, this list limits the fields that are returned, as a security measure """

ACCOUNT_MODEL = "service.models.MonitorUKAccount"
""" Model object to use to represent user accounts """

ACCOUNT_USER_FORM_CONTEXT = "service.forms.account.MonitorUKUserFormContext"
""" Form context class to provide user account form """

ACCOUNT_USER_FORM_ADMIN_CONTEXT = "service.forms.account.MonitorUKUserAdminFormContext"
""" Form context class to provide user admin form """

ACCOUNT_ACTIVATE_FORM_CONTEXT = "service.forms.account.MonitorUKActivateFormContext"
""" Form context class to provide account activation form """

ACCOUNT_DEFAULT_ROLES = ["write_apc", "read_apc"]
""" Default roles added to all users that are created via the account system """

CLIENTJS_ACCOUNT_LIST_ENDPOINT = "/account_query/account"
""" URL path to the account list query endpoint (needs to tie up with an equivalent query endpoint configuration in QUERY_ROUTE below) """

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
""" Definitions of query endpoints.  Here we define two: one for listing user accounts, only accessible to administrators, and one for general search queries """

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
""" Definitions of the CRUD endpoint.  This configures service.models.crud.ApiRequest to handle CRUD requests for APCs """

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
""" Search API configuration, enabling a public search of all public records, and a private search of all records owned by an authenticated user """

#######################################################
## Task scheduler configuration

SCHEDULER_TASKS = [
    # every 10 seconds trigger the request processing task - this converts requests for updates into public apc records
    (10, "seconds", None, "service.tasks.process_updates"),

    # every hour trigger the lantern lookup - this sends any new records out to Lantern for enhancement
    (1, "hours", None, "service.tasks.lantern_jobs"),

    # every hour trigger the lantern job checker - this will pull in any updates from Lantern
    (1, "hours", None, "service.tasks.lantern_check")
]
""" Asynchronous job scheduling.  Schedules updates via the API every 10 seconds, and synchronisation with Lantern on a longer cycle """


##############################################
## App specific config

# if the workflow state does not have a "last request" date recorded, what is the date it should report
# (basically, this just needs to be earlier than the service went live.  We use the start of the unix epoch by default)
WORKFLOW_STATE_EARLIEST_DATE = "1970-01-01T00:00:00Z"
""" When a workflow state is first created, what is the default earliest date """

API_JSON_LD_CONTEXT = {
    "jm": "http://jiscmonitor.jiscinvolve.org/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dcterms": "http://purl.org/dc/terms/",
    "rioxxterms": "http://rioxx.net/v2-0-beta-1/",
    "ali" : "http://www.niso.org/schemas/ali/1.0/jsonld.json"
}
""" Defines the JSON-LD @context properties for use in the API """

# Email address to be presented on the login page for the user to contact if they wish to request an account
MONITOR_ACCOUNT_REQUEST_EMAIL = "monitor+account@jisc.ac.uk"
""" Email address users should contact if they would like an account with Monitor UK """

PRIMARY_NAVIGATION = [
    {
        "label": "About",
        "url": {
            "url": "https://monitor.jisc.ac.uk/uk/about",
        },
        "visibility": {
            "auth": True,
            "anonymous": True
        },
        "main_nav": True,
        "breadcrumb": False
    },
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
        "label" : "Reports",
        "visibility" : {
            "auth" : True,
            "anonymous" : False
        },
        "main_nav" : True,
        "breadcrumb" : False,
        "subnav" : [
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
            },
            {
                "label": "Institution",
                "url": {
                    "url_for": "institution"
                },
                "visibility": {
                    "auth": True,
                    "anonymous": False
                },
                "main_nav": True,
                "breadcrumb": False
            }
        ]
    },
    {
        "label": "Help and resources",
        "url": {
            "url": "https://monitor.jisc.ac.uk/uk/help",
        },
        "visibility": {
            "auth": True,
            "anonymous": True
        },
        "main_nav": True,
        "breadcrumb": False
    }
]
""" Definition for primary navigation, rendered on the left-hand side of the navigation bar """

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
        "main_nav" : False,
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
    }
]
""" Definition for secondary navigation, rendered on the right-hand side of the navigation bar """

SITE_NAVIGATION = PRIMARY_NAVIGATION + SECONDARY_NAVIGATION
""" Overall site navigation """

# Javascript endpoint configurations
CLIENTJS_PUBLIC_QUERY_ENDPOINT = "/query/apc"
""" Public query endpoint, for use by reports and search interface.  Should be defined above in QUERY_ROUTES """

#################################################
## Settings for Lantern integration

ENABLE_LANTERN = True
""" Is Lantern integration enabled """

# The list of paths to fields which trigger a lookup for a record in Lantern
# (uses objectpath notation)
MISSING_FIELD_TRIGGERS_LANTERN = [
    "$.record.'rioxxterms:publication_date'",
    "$.record.'rioxxterms:version'",
    "$.record.'dc:source'.name",
    "$.record.'dc:source'.identifier[@.type is 'issn'].id",
    "$.record.'dc:source'.oa_type",
    "$.record.'dc:source'.self_archiving.preprint.policy",
    "$.record.'dc:source'.self_archiving.preprint.embargo",
    "$.record.'dc:source'.self_archiving.postprint.policy",
    "$.record.'dc:source'.self_archiving.postprint.embargo",
    "$.record.'dc:source'.self_archiving.publisher.policy",
    "$.record.'dc:source'.self_archiving.publisher.embargo",
    "$.record.'rioxxterms:project'.funder_name",
    "$.record.'ali:license_ref'.type",
    "$.record.'jm:repository'.repo_name"
]
""" List of fields in a PublicAPC, using objectpath notiation, which, if missing, trigger a request to Lantern for a record """

# batch sizes to send to Lantern.  Lantern permits up to 3000 per request, but we keep it low here for
# performance on our side
BATCH_SIZE_LANTERN = 1000
""" Batch size for Lantern requests.  Maximum allowed his higher, this just gives us room to manoevre """

# length of time (in seconds) to wait before re-submitting a previously checked item
# default here is 6 months
DATA_REFRESH_LANTERN = 15552000
""" Time period (in seconds) to wait before re-looking up a record in Lantern (the default is 6 months) """

# The minimum amount of time to wait between polling Lantern for updates on a previously submitted job
JOB_LOOKUP_DELAY_LANTERN = 3600
""" Time period (in seconds) to wait before re-checking a submitted Lantern job """

# For the purposes of the functional/integration tests with Lantern, you can provide a test account email address and
# api key, via your local.cfg file
TEST_ACCOUNT_EMAIL_LANTERN = False
""" Your Lantern test account email address - set in local.cfg """

TEST_API_KEY_LANTERN = False
""" Your Lantern test account api key - set in local.cfg """
