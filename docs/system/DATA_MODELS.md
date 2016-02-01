# Data Models

## General Structure

The overall structure of the model documents at any point in the system is as follows:

```json

{
    "id" : "<opaque system id for the record>",
    "created_date" : "<date the record was created>",
    "last_updated" : "<date the record was last updated>",
    
    "record" : {
        <the apc data record itself>
    }
    
    "admin" : {
        <any internal administrative or state information for the record>
    },
    
    "index" : {
        <any data required to improve search/discovery/reporting capabilities on the object>
    }    
}

```

Depending on the context, any of **admin**, **record** and **index** could be omitted.

## Core Record Model

This is the data-structure of the core information held about an APC, its related article, and other OA 
compliance information.

Bibliographic metadata supported is a minimal set for the purposes of identification of the work, and some basic
reporting capabilities.  Monitor UK is NOT a bibliographic aggregation.

```json

{
    "dcterms:dateSubmitted" : "<date article was submitted for publication (iso format)>",
    "dcterms:dateAccepted" : "<date article was accepted for publication (iso format)>",
    "rioxxterms:publication_date" : "<publication date (iso format)>",
    
    "dc:identifier" : [
        {"type" : "pmcid", "id" : "<europe pubmed central id>"},
        {"type" : "pmid", "id" : "<pubmed id>"},
        {"type" : "doi", "id" : "<doi>"},
        {"type" : "url", "id" : "<url to object>"}
    ],
    
    "rioxxterms:type" : "<publication type (article, etc) - ideally from rioxx guidelines>",
    "dc:title" : "<title>",
    "dc:subject" : ["<list of subject categories, ideally standardised>"],
    "rioxxterms:version" : "<rioxx resource version - from guidelines>",
    
    "rioxxterms:author" : [
        {
            "name" : "<author name>",
            "identifier" : [
                {"type" : "orcid", "id" : "<author's orcid>"},
                {"type" : "email", "id" : "<author's email address>"},
                {"type" : "<identifier type>", "id" : "<author identifier>"}
            ],
            "affiliation" : [
                {
                    "name" : "<name of organisation>",
                    {"type" : "<identifier type>", "id" : "<organisation identifier>"}
                }
            ]
        }
    ],
    "rioxxterms:contributor" : [
        {
            "name" : "<contributor name>",
            "identifier" : [
                {"type" : "orcid", "id" : "<contributor's orcid>"},
                {"type" : "email", "id" : "<contributor's email address>"},
                {"type" : "<identifier type>", "id" : "<contributor identifier>"}
            ],
            "affiliation" : [
                {
                    "name" : "<name of organisation>",
                    {"type" : "<identifier type>", "id" : "<organisation identifier>"}
                }
            ]
        }
    ],

    "dcterms:publisher" : {
        "name" : "<publisher of the article>",
        "identifier" : [
            {"type" : "<identifier type>", "id" : "<publisher identifier>"}
        ]
    },
    
    "dc:source" : {
        "name" : "<name of the journal or other source (e.g. book)>",
        "identifier" : [
            {"type" : "issn", "id" : "<issn of the journal (could be print or electronic)>" },
            {"type" : "e-issn", "id" : "<electronic issn of the journal>" },
            {"type" : "p-issn", "id" : "<print issn of the journal>" },
            {"type" : "issn-l", "id" : "linking issn for the journal>" },
            {"type" : "doi", "id" : "<doi for the journal or series>" }
        ],
        "oa_type" : "<hybrid|oa>",
        "self_archiving" : {
            "preprint" : {
                "policy" : "<can|restricted|cannot>",
                "embargo" : <number of months>
            },
            "postprint" : {
                "policy" : "<can|restricted|cannot>",
                "embargo" : <number of months>
            },
            "publisher" : {
                "policy" : "<can|restricted|cannot>",
                "embargo" : <number of months>
            }
        }
    },
    
    "rioxxterms:project" : [
        {
            "funder_name" : "<name of funder>", 
            "funder_identifier" : [
                {"type" : "isni", "id" : "<funder isni>"}
                {"type" : "<identifier type>", "id" : "<funder identifier>"}
            ]
            "grant_number" : "<funder's grant number>"
        }
    ],

    "jm:apc" : [
        {
            "ref" : "<system generated reference for this payment>",
            "date_applied" : "<date APC was initially applied for by author (iso format)>",
            "submitted_by" : {
                "name" : "<submitter's name>",
                "identifier" : [
                    {"type" : "orcid", "id" : "<submitter's orcid>"},
                    {"type" : "email", "id" : "<submitter's email address>"},
                    {"type" : "<identifier type>", "id" : "<submitter identifier>"}
                ]
            }
            
            "organisation_name" : "<name of organisation>",
            "organisation_identifier" : [
                {"type" : "<identifier type>", "id" : "<organisation identifier>"}
            ]
            "organisation_department" : "<name of department>",
            
            "date_paid" : "<date apc paid (iso format)>",
            "amount" : <amount paid in native currency, excluding vat (float)>,
            "vat" : <vat paid in native currency (float)>
            "currency" : "<currency paid in - from iso currency code list>",
            "amount_gbp" : <amount paid in equivalent GBP, excluding vat (float)>,
            "vat_gbp" : <vat paid in equivalent GBP (float)>,
            "additional_costs" : <additional publication costs in GBP (float)>,
            "discounts" : ["<names or identifiers of any discounts applied (e.g. Prepayment)>"],
            
            "fund" : [
                {
                    "name" : "<name of the fund paid from>",
                    "amount" : <amount paid from this fund, including VAT (float)>,
                    "currency" : "<currency received from this fund - from iso currency code list>",
                    "amount_gbp" : <amout paid from this fund in equivalent GBP (float)>
                }
            ],
            
            "publication_process_feedback" : ["<notes on the process of publication>"],
            "notes" : "<free text notes on the APC record from this institution>"
        }
    ],

    "ali:license_ref" : [
        {
            "type" : "<type of licence (e.g. CC BY)>", 
            "version" : "<version of licence>",
            "url" : "<url>", 
            "start_date" : "<date licence is valid from>",
            "source" : "<where this licence was obtained (e.g. publisher site, repository)>"
        }
    ],
    
    "ali:free_to_read" : {
        "free_to_read" : true|false
        "start_date" : "<date free to read started>",
        "end_date" : "<date free to read ended>",
    },

    "jm:license_received" : [
        {"date" : "<date licence was checked>", "received" : true|false}
    ],

    "jm:repository" : [
        {
            "repo_name" : "<Name of repository which holds a copy>",
            "repo_url" : "<url for repository>",
            "record_url" : "<url to representation of record in repository>",
            "metadata" : "True|False|Unknown",
            "fulltext" : "True|False|Unknown",
            "machine_readable_fulltext" : "True|False|Unknown",
            "version" : "AAM|etc."
        }
    ],

    "jm:provenance" : [
        "<free-text provenance information for the data in this record>"
    ]
}

```

## Manifestation: Institutional CRUD API - Create/Update

When an institution provides data to the aggregation via the API, they need only supply the apc data record, as 
defined above.  They may optionally provide the JSON-LD **@context** element.

```json
{
    "@context": {
        "jm": "http://jiscmonitor.jiscinvolve.org/",
        "dc": "http://purl.org/dc/elements/1.1/",
        "dcterms": "http://purl.org/dc/terms/",
        "rioxxterms": "http://rioxx.net/v2-0-beta-1/",
        "ali" : "http://www.niso.org/schemas/ali/1.0/jsonld.json"
    },
    
    <the apc data record itself>
}
```

Note that **record.jm:apc.ref** cannot be provided by institutions - if it is, it will be overwritten by a system generated
value.

## Manifestation: Institution/Public Search API - Retrieve

When an institution retrieves one or more records from the public search API (ignoring all the other search API meta-fields
which may be present).

```json
{
    "@context": {
        "jm": "http://jiscmonitor.jiscinvolve.org/",
        "dc": "http://purl.org/dc/elements/1.1/",
        "dcterms": "http://purl.org/dc/terms/",
        "rioxxterms": "http://rioxx.net/v2-0-beta-1/",
        "ali" : "http://www.niso.org/schemas/ali/1.0/jsonld.json"
    },
    
    results: [
        {
            "id" : "<opaque public identifier for the record>",
            "created_date" : "<date the record was created>",
            "last_updated" : "<date the record was last updated>",
            
            "record" : {
                <the apc data record itself>
            }
        }
    ]
}
```

## Manifestation: Request Register - Create/Update

The data that is stored in the request register on submission of a create or update.  In the case of an update
where the public id is provided via the URL space, this is recorded as the **admin.public_id**.

```json
{
    "id" : "<opaque request identifier for the record>",
    "created_date" : "<date the record was created>",
    "last_updated" : "<date the record was last updated>",
    
    "record" : {
        <the apc data record itself>
    },
    
    "admin" : {
        "owner" : "<user account id of creator>",
        "action" : "update",
        "public_id" : "<opaque public identifier for the record>"
    }
}
```

## Manifestation: Request Register - Delete

The data that is stored in the request register on submission of a delete.  In the case of a delete
where the public id is provided via the URL space, this is recorded as the **admin.public_id**.  Otherwise, the
record will only need to contain the article identifiers from which to delete.

```json
{
    "id" : "<opaque request identifier for the record>",
    "created_date" : "<date the record was created>",
    "last_updated" : "<date the record was last updated>",
    
    "record" : {
        "dc:identifier" : [
            {"type" : "pmcid", "id" : "<europe pubmed central id>"},
            {"type" : "pmid", "id" : "<pubmed id>"},
            {"type" : "doi", "id" : "<doi>"},
            {"type" : "url", "id" : "<url to object>"}
        ]
    },
    
    "admin" : {
        "owner" : "<user account id of deleter>",
        "action" : "delete",
        "public_id" : "<opaque public identifier for the record>"
    }
}
```


## Manifestation: Public Data Core

The data that is stored in the public data core, which forms the definitive record of an APC.

The **admin.apc_owners** field is created based on which apc entries in the record are provided by which user accounts.  
This allows a single user account to supply and control apc data from multiple institutions, while the system maintains a 
consistent update/delete cycle.

```json
{
    "id" : "<opaque public identifier for the record>",
    "created_date" : "<date the record was created>",
    "last_updated" : "<date the record was last updated>",
    
    "record" : {
        <the apc data record itself>
    },
    
    "admin" : {
        "apc_owners" : [
            {"owner" : "<user account id of organisation>", "ref" : "<reference of apc payment record>"}
        ]
    },
    
    "index" : {
        "apc_total_amount_gbp" : <sum of jm:apc.amount_gbp (float)>,
        "apc_total_vat_gbp" : <sum of jm:apc.vat_gbp (float)>,
        "apc_total_gbp" : <sum of apc_total_amount_gbp and apc_total_vat_gbp (float)>,
        "sum_total_gbp" : <sum of apc_total_gbp and jm:apc.additional_costs (float)>,
        
        "doi" : "<article doi>",
        "pmcid" : "<article pmcid>",
        "pmid" : "<article pmid>",
        "url" : "<article url>",
        "issn" : ["<journal issn>"],
        "funds" : ["<funds apcs paid from>"],
        "ascii_unpunc_title" : "<normalised title string for searching>"
    }
}
```