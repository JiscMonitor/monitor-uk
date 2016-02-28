from copy import deepcopy

class RequestFixtureFactory(object):
    @classmethod
    def example(cls):
        return deepcopy(EXAMPLE_REQUEST)

    @classmethod
    def record(cls):
        return deepcopy(EXAMPLE_RECORD)


class PublicAPCFixtureFactory(object):

    @classmethod
    def example(cls):
        return deepcopy(EXAMPLE_PUBLIC)

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
            "amount_gbp" : 1000.00,
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
EXAMPLE_RECORD["jm:apc"][0]["ref"] = "1111111111"
EXAMPLE_PUBLIC = {
    "id" : "123456789",
    "created_date" : "2001-01-01T00:00:00Z",
    "last_updated" : "2002-01-01T00:00:00Z",

    "record" : EXAMPLE_RECORD,

    "admin" : {
        "apc_owners" : [
            {"owner" : "abcdefg", "ref" : "1111111111"}
        ]
    },
}