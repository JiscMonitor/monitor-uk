from copy import deepcopy

class RequestFixtureFactory(object):
    @classmethod
    def example(cls):
        return deepcopy(EXAMPLE_REQUEST)

    @classmethod
    def record(cls):
        return deepcopy(EXAMPLE_RECORD)

    @classmethod
    def request_per_day(cls, prefix, days):
        sources = []
        for i in range(1, days + 1):
            day = ("0" if i < 10 else "") + str(i)
            date = prefix + "-" + day + "T00:00:00Z"
            data = deepcopy(EXAMPLE_REQUEST)
            data["created_date"] = date
            data["last_updated"] = date
            del data["id"]
            sources.append(data)
        return sources


class PublicAPCFixtureFactory(object):

    @classmethod
    def example(cls):
        return deepcopy(EXAMPLE_PUBLIC)

    @classmethod
    def make_record(cls, owner, title, date_submitted, date_accepted):
        source = PublicAPCFixtureFactory.example()
        del source["id"]
        del source["created_date"]
        del source["last_updated"]
        source["admin"]["apc_owners"][0]["owner"] = owner
        source["record"]["dcterms:dateSubmitted"] = date_submitted
        source["record"]["dcterms:dateAccepted"] = date_accepted
        source["record"]["dc:title"] = title
        return source

    @classmethod
    def record_merge_source(cls):
        return deepcopy(MERGE_SOURCE)

    @classmethod
    def record_merge_target(cls):
        return deepcopy(MERGE_TARGET)

    @classmethod
    def record_merge_result(cls):
        return deepcopy(MERGE_RESULT)

    @classmethod
    def apc_record(cls):
        return deepcopy(EXAMPLE_PUBLIC["record"]["jm:apc"][0])

class WorkflowStateFixtureFactory(object):

    @classmethod
    def example(cls):
        return deepcopy(WORKFLOW_STATE)

WORKFLOW_STATE = {
    "id" : "123456789",
    "created_date" : "2001-01-01T00:00:00Z",
    "last_updated" : "2002-01-01T00:00:00Z",

    "record" : {
        "last_request_date" :  "2003-01-01T00:00:00Z",
        "already_processed" : ["123456789", "987654321"]
    },
}

MERGE_SOURCE = {
    "dcterms:dateSubmitted" : "2003-01-01T00:00:00Z",
    "dcterms:dateAccepted" : "2004-01-01T00:00:00Z",
    "rioxxterms:publication_date" : "2005-01-01T00:00:00Z",

    "dc:identifier" : [
        {"type" : "pmcid", "id" : "PMC1234"},
        {"type" : "url", "id" : "http://example.com/whatever"}
    ],

    "dc:title" : "A Source record object",
    "dc:subject" : ["maths", "physics"],

    "rioxxterms:author" : [
        {
            "name" : "Richard Jones",
            "identifier" : [
                {"type" : "orcid", "id" : "1111-1111-1111-1111"},
            ],
            "affiliation" : [
                {
                    "name" : "Cottage Labs",
                    "identifier" : [
                        {"type" : "url", "id" : "http://cottagelabs.com"}
                    ]
                }
            ]
        },
        {
            "name" : "AN Other"
        }
    ],
    "rioxxterms:contributor" : [
        {
            "name" : "A.N. Other",
            "identifier" : [
                {"type" : "orcid", "id" : "2222-2222-2222-2222"},
                {"type" : "email", "id" : "another@example.com"}
            ]
        },
        {
            "name" : "Wilfred"
        }
    ],

    "dcterms:publisher" : {
        "name" : "Publishing Warehouse",
        "identifier" : [
            {"type" : "url", "id" : "http://publisher.example.com"}
        ]
    },

    "dc:source" : {
        "name" : "Journal of Important Things",
        "identifier" : [
            {"type" : "issn", "id" : "1234-5678" },
            {"type" : "e-issn", "id" : "1234-5678" },
            {"type" : "p-issn", "id" : "9876-5432" },
        ],
        "oa_type" : "oa",
        "self_archiving" : {
            "preprint" : {
                "policy" : "cannot",
                "embargo" : 24
            },
            "publisher" : {
                "policy" : "can",
                "embargo" : 6
            }
        }
    },

    "jm:apc" : [{"organisation_name" : "University 1"}],

    "ali:license_ref" : [
        {
            "type" : "CC BY",
            "version" : "3.0",
            "url" : "http://creativecommons.org/licenses/by/3.0/",
            "start_date" : "2008-01-01T00:00:00Z",
            "source" : "http://publisher.example.com/thisone"
        }
    ],

    "ali:free_to_read" : {
        "free_to_read" : True,
        "start_date" : "2009-01-01T00:00:00Z",
        "end_date" : "2010-01-01T00:00:00Z",
    },

    "jm:license_received" : [
        {"date" : "2010-01-01T00:00:00Z", "received" : True}
    ],

    "jm:repository" : [
        {
            "repo_name" : "CORE",
            "repo_url" : "http://core.ac.uk",
            "record_url" : "http://core.ac.uk/12345678790",
            "metadata" : "True",
            "fulltext" : "True",
            "machine_readable_fulltext" : "Unknown",
            "version" : "AAM"
        }
    ],

    "jm:provenance" : [
        "Richard typed all this data in for a test"
    ]
}

MERGE_TARGET = {
    "rioxxterms:publication_date" : "2005-02-01T00:00:00Z",

    "dc:identifier" : [
        {"type" : "pmcid", "id" : "PMC1234"},
        {"type" : "pmid", "id" : "87654321"},
        {"type" : "doi", "id" : "10.1234/me"},
    ],

    "rioxxterms:type" : "article",
    "dc:title" : "An example Request Object",
    "dc:subject" : ["maths"],
    "rioxxterms:version" : "AAM",

    "rioxxterms:author" : [
        {
            "name" : "Richard Jones",
            "identifier" : [
                {"type" : "orcid", "id" : "1111-1111-1111-1111"},
                {"type" : "email", "id" : "richard@example.com"},
            ]
        },
        {
            "name" : "Bobzilla"
        }
    ],
    "rioxxterms:contributor" : [
        {
            "name" : "A.N. Other",
            "identifier" : [
                {"type" : "orcid", "id" : "2222-2222-2222-2222"},
            ],
            "affiliation" : [
                {
                    "name" : "Jisc",
                    "identifier" : [
                        {"type" : "url", "id" : "http://www.jisc.ac.uk"}
                    ]
                }
            ]
        },
        {
            "name" : "Harold"
        }
    ],

    "dcterms:publisher" : {
        "name" : "Publishing Warehouse"
    },

    "dc:source" : {
        "name" : "Journal of Important Things",
        "identifier" : [
            {"type" : "issn-l", "id" : "2222-1111" },
            {"type" : "doi", "id" : "10.1234" }
        ],
        "self_archiving" : {
            "preprint" : {
                "policy" : "cannot",
                "embargo" : 24
            },
            "postprint" : {
                "policy" : "restricted",
                "embargo" : 12
            }
        }
    },

    "jm:apc" : [{"organisation_name" : "University 2"}],

    "ali:license_ref" : [
        {
            "type" : "CC BY",
            "version" : "2.0",
            "url" : "http://creativecommons.org/licenses/by/2.0/",
            "start_date" : "2008-01-01T00:00:00Z",
            "source" : "http://publisher.example.com/thisone"
        }
    ],

    "ali:free_to_read" : {
        "free_to_read" : False,
        "start_date" : "2009-01-01T00:00:00Z",
        "end_date" : "2010-01-01T00:00:00Z",
    },

    "jm:license_received" : [
        {"date" : "2011-01-01T00:00:00Z", "received" : True}
    ],

    "jm:repository" : [
        {
            "repo_name" : "EPMC",
            "repo_url" : "http://europepmc.org",
            "record_url" : "http://europepmc.org/12345678790",
            "metadata" : "True",
            "fulltext" : "True",
            "machine_readable_fulltext" : "Unknown",
            "version" : "AAM"
        }
    ],

    "jm:provenance" : [
        "Richard copied and pasted some of this"
    ]
}

MERGE_RESULT = {
    "dcterms:dateSubmitted" : "2003-01-01T00:00:00Z",
    "dcterms:dateAccepted" : "2004-01-01T00:00:00Z",
    "rioxxterms:publication_date" : "2005-02-01T00:00:00Z",

    "dc:identifier" : [
        {"type" : "pmcid", "id" : "PMC1234"},
        {"type" : "pmid", "id" : "87654321"},
        {"type" : "doi", "id" : "10.1234/me"},
        {"type" : "url", "id" : "http://example.com/whatever"}
    ],

    "rioxxterms:type" : "article",
    "dc:title" : "An example Request Object",
    "dc:subject" : ["maths", "physics"],
    "rioxxterms:version" : "AAM",

    "rioxxterms:author" : [
        {
            "name" : "Richard Jones",
            "identifier" : [
                {"type" : "orcid", "id" : "1111-1111-1111-1111"},
                {"type" : "email", "id" : "richard@example.com"},
            ],
            "affiliation" : [
                {
                    "name" : "Cottage Labs",
                    "identifier" : [
                        {"type" : "url", "id" : "http://cottagelabs.com"}
                    ]
                }
            ]
        },
        {
            "name" : "Bobzilla"
        },
        {
            "name" : "AN Other"
        }
    ],
    "rioxxterms:contributor" : [
        {
            "name" : "A.N. Other",
            "identifier" : [
                {"type" : "orcid", "id" : "2222-2222-2222-2222"},
                {"type" : "email", "id" : "another@example.com"}
            ],
            "affiliation" : [
                {
                    "name" : "Jisc",
                    "identifier" : [
                        {"type" : "url", "id" : "http://www.jisc.ac.uk"}
                    ]
                }
            ]
        },
        {
            "name" : "Harold"
        },
        {
            "name" : "Wilfred"
        }
    ],

    "dcterms:publisher" : {
        "name" : "Publishing Warehouse",
        "identifier" : [
            {"type" : "url", "id" : "http://publisher.example.com"}
        ]
    },

    "dc:source" : {
        "name" : "Journal of Important Things",
        "identifier" : [
            {"type" : "issn-l", "id" : "2222-1111" },
            {"type" : "doi", "id" : "10.1234" },
            {"type" : "issn", "id" : "1234-5678" },
            {"type" : "e-issn", "id" : "1234-5678" },
            {"type" : "p-issn", "id" : "9876-5432" }
        ],
        "oa_type" : "oa",
        "self_archiving" : {
            "preprint" : {
                "policy" : "cannot",
                "embargo" : 24
            },
            "postprint" : {
                "policy" : "restricted",
                "embargo" : 12
            },
            "publisher" : {
                "policy" : "can",
                "embargo" : 6
            }
        }
    },

    "jm:apc" : [{"organisation_name" : "University 2"}],

    "ali:license_ref" : [
        {
            "type" : "CC BY",
            "version" : "2.0",
            "url" : "http://creativecommons.org/licenses/by/2.0/",
            "start_date" : "2008-01-01T00:00:00Z",
            "source" : "http://publisher.example.com/thisone"
        },
        {
            "type" : "CC BY",
            "version" : "3.0",
            "url" : "http://creativecommons.org/licenses/by/3.0/",
            "start_date" : "2008-01-01T00:00:00Z",
            "source" : "http://publisher.example.com/thisone"
        }
    ],

    "ali:free_to_read" : {
        "free_to_read" : False,
        "start_date" : "2009-01-01T00:00:00Z",
        "end_date" : "2010-01-01T00:00:00Z",
    },

    "jm:license_received" : [
        {"date" : "2011-01-01T00:00:00Z", "received" : True},
        {"date" : "2010-01-01T00:00:00Z", "received" : True}
    ],

    "jm:repository" : [
        {
            "repo_name" : "EPMC",
            "repo_url" : "http://europepmc.org",
            "record_url" : "http://europepmc.org/12345678790",
            "metadata" : "True",
            "fulltext" : "True",
            "machine_readable_fulltext" : "Unknown",
            "version" : "AAM"
        },
        {
            "repo_name" : "CORE",
            "repo_url" : "http://core.ac.uk",
            "record_url" : "http://core.ac.uk/12345678790",
            "metadata" : "True",
            "fulltext" : "True",
            "machine_readable_fulltext" : "Unknown",
            "version" : "AAM"
        }
    ],

    "jm:provenance" : [
        "Richard copied and pasted some of this",
        "Richard typed all this data in for a test"
    ]
}


#######################################################################

EXAMPLE_RECORD = {
    "dcterms:dateSubmitted" : "2003-01-01T00:00:00Z",
    "dcterms:dateAccepted" : "2004-01-01T00:00:00Z",
    "rioxxterms:publication_date" : "2005-01-01T00:00:00Z",

    "dc:identifier" : [
        {"type" : "pmcid", "id" : "PMC1234"},
        {"type" : "pmid", "id" : "87654321"},
        {"type" : "doi", "id" : "10.1234/me"},
        {"type" : "url", "id" : "http://example.com/whatever"}
    ],

    "rioxxterms:type" : "article",
    "dc:title" : "An example Request Object",
    "dc:subject" : ["maths"],
    "rioxxterms:version" : "AAM",

    "rioxxterms:author" : [
        {
            "name" : "Richard Jones",
            "identifier" : [
                {"type" : "orcid", "id" : "1111-1111-1111-1111"},
                {"type" : "email", "id" : "richard@example.com"},
            ],
            "affiliation" : [
                {
                    "name" : "Cottage Labs",
                    "identifier" : [
                        {"type" : "url", "id" : "http://cottagelabs.com"}
                    ]
                }
            ]
        }
    ],
    "rioxxterms:contributor" : [
        {
            "name" : "A.N. Other",
            "identifier" : [
                {"type" : "orcid", "id" : "2222-2222-2222-2222"},
                {"type" : "email", "id" : "another@example.com"},
            ],
            "affiliation" : [
                {
                    "name" : "Jisc",
                    "identifier" : [
                        {"type" : "url", "id" : "http://www.jisc.ac.uk"}
                    ]
                }
            ]
        }
    ],

    "dcterms:publisher" : {
        "name" : "Publishing Warehouse",
        "identifier" : [
            {"type" : "url", "id" : "http://publisher.example.com"}
        ]
    },

    "dc:source" : {
        "name" : "Journal of Important Things",
        "identifier" : [
            {"type" : "issn", "id" : "1234-5678" },
            {"type" : "e-issn", "id" : "1234-5678" },
            {"type" : "p-issn", "id" : "9876-5432" },
            {"type" : "issn-l", "id" : "2222-1111" },
            {"type" : "doi", "id" : "10.1234" }
        ],
        "oa_type" : "oa",
        "self_archiving" : {
            "preprint" : {
                "policy" : "cannot",
                "embargo" : 24
            },
            "postprint" : {
                "policy" : "restricted",
                "embargo" : 12
            },
            "publisher" : {
                "policy" : "can",
                "embargo" : 6
            }
        }
    },

    "rioxxterms:project" : [
        {
            "funder_name" : "EPSRC",
            "funder_identifier" : [
                {"type" : "isni", "id" : "3333-3333-3333-3333"},
                {"type" : "url", "id" : "http://epsrc.example.com"}
            ],
            "grant_number" : "EP/37776/B"
        }
    ],

    "jm:apc" : [
        {
            # "ref" : "<system generated reference for this payment>",
            "date_applied" : "2006-01-01T00:00:00Z",
            "submitted_by" : {
                "name" : "Richard Jones",
                "identifier" : [
                    {"type" : "orcid", "id" : "1111-1111-1111-1111"},
                    {"type" : "email", "id" : "richard@example.com"}
                ]
            },

            "organisation_name" : "University of Life",
            "organisation_identifier" : [
                {"type" : "url", "id" : "http://uol.example.com"}
            ],
            "organisation_department" : "School of Hard Knocks",

            "date_paid" : "2007-01-01T00:00:00Z",
            "amount" : 100.00,
            "vat" : 20.00,
            "currency" : "UGX",
            "amount_inc_vat_gbp" : 1200.00,
            "amount_ex_vat_gbp" : 1000.00,
            "vat_gbp" : 200.00,
            "additional_costs" : 45.00,
            "discounts" : ["prepayment"],

            "fund" : [
                {
                    "name" : "RCUK",
                    "amount" : 500.00,
                    "currency" : "GBP",
                    "amount_gbp" : 500.00
                }
            ],

            "publication_process_feedback" : ["it was ok, I guess"],
            "notes" : "nothing really to add"
        }
    ],

    "ali:license_ref" : [
        {
            "type" : "CC BY",
            "version" : "3.0",
            "url" : "http://creativecommons.org/licenses/by/3.0/",
            "start_date" : "2008-01-01T00:00:00Z",
            "source" : "http://publisher.example.com/thisone"
        }
    ],

    "ali:free_to_read" : {
        "free_to_read" : True,
        "start_date" : "2009-01-01T00:00:00Z",
        "end_date" : "2010-01-01T00:00:00Z",
    },

    "jm:license_received" : [
        {"date" : "2011-01-01T00:00:00Z", "received" : True}
    ],

    "jm:repository" : [
        {
            "repo_name" : "CORE",
            "repo_url" : "http://core.ac.uk",
            "record_url" : "http://core.ac.uk/12345678790",
            "metadata" : "True",
            "fulltext" : "True",
            "machine_readable_fulltext" : "Unknown",
            "version" : "AAM"
        }
    ],

    "jm:provenance" : [
        "Richard typed all this data in for a test"
    ]
}

EXAMPLE_REQUEST = {
    "id" : "123456789",
    "created_date" : "2001-01-01T00:00:00Z",
    "last_updated" : "2002-01-01T00:00:00Z",

    "record" : EXAMPLE_RECORD,

    "admin" : {
        "owner" : "abcdefghij",
        "action" : "update",
        "public_id" : "987654321"
    }
}

REFFED_EXAMPLE_RECORD = deepcopy(EXAMPLE_RECORD)
REFFED_EXAMPLE_RECORD["jm:apc"][0]["ref"] = "1111111111"
EXAMPLE_PUBLIC = {
    "id" : "123456789",
    "created_date" : "2001-01-01T00:00:00Z",
    "last_updated" : "2002-01-01T00:00:00Z",

    "record" : REFFED_EXAMPLE_RECORD,

    "admin" : {
        "apc_owners" : [
            {"owner" : "abcdefg", "ref" : "1111111111"}
        ]
    },
}