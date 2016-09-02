# Contribution API

The Contribution API is for account holders wishing to supply APC records to Monitor UK.  Requests to create, update or delete records 
in Monitor UK pass through an asynchronous workflow, so changes are not live immediately.

In order to interact with this API:

* You must have the system role "write_apc" for all operations (all users will have this by default)
* You must have and supply an api_key with each request (this can be obtained from your account page)

When you send data to Monitor UK, it passes through a workflow which takes the following actions:

* Checks to see if a record with an equivalent identifier already exists in the system
* Publishes or merges with an existing public record

If the request you send to Monitor UK is to remove data from the system, it will

* Find the public record for which you wish to remove the data
* Remove any APC data you provided, leaving data provided by other users intact
* Remove the entire record if and only if there is no other APC data provided by other users

## Create

To create a new record in Monitor UK, POST the JSON conforming to the **JSON Record Body** (see below) to the API

    POST /api/v1/apc?api_key=<api_key>
    Content-Type: application/json
    
    {JSON Record Body}
    
If there is an error (e.g. your document does not conform to the specification of the record), you will receive a 400.

If your api key is invalid you will receive a 401.

On success, you will receive a 201, and the response body will be of the form

    {
        "status" : "created",
        "request_id" : "id of the request you just made",
        "public_id" : "id of the record when it appears in the public space"
    }

During crate, "public_id" will only be given to you if the record contains a DOI, and then this DOI will be used as
the public identifier.

If no DOI is provided in the record, there will be no public_id field, and you will need to locate the public identifier
for the record via the search interface, before issuing updates to it.

## Retrieve

To retrieve a copy of a record you created in the system:

    GET /api/v1/apc/<id>?api_key=<api_key>
    
"id" may be one of:

* DOI, if one was provided
* Opaque system identifier for public record

You can get these ids out of the JSON response body of the create/update requests.

Note that you CANNOT retrieve the item via the **request_id**, and you cannot retrieve a copy of the change request you 
made to the record via the Create, Update or Delete endpoints.  You can only retrieve the most recent publicly available 
version of a record.

If a no record is found with that id, you will receive a 404

If your api key is invalid you will receive a 401

On success, you will receive a 200, and the respond body will be as per the **JSON Record Body**.


## Update

To update an existing record in Monitor UK, there are a couple of equivalent approaches

### Update as a synonym of Create

Update is synonymous with Create in Monitor UK, so you can also simple POST your data to the Create endpoint as described above.  Provided that the
identifiers in your **JSON Record Body** can be used to identify the equivalent existing public record, the record will automatically be updated
    
    POST /api/v1/apc?api_key=<api_key>
    Content-Type: application/json
    
    {JSON Record Body}

If there is an error (e.g. your document does not conform to the specification of the record), you will receive a 400.

If your api key is invalid, you will get a 401

On success, you will receive a 201, and the response body will be of the form

    {
        "status" : "created",
        "request_id" : "id of the request you just made",
        "public_id" : "id of the record when it appears in the public space"
    }

See above for documentation on the meaning of the fields in the response body.

### Updating on the Public ID

You can also PUT or POST an update request to the public id of the record, with data conforming to the **JSON Record Body** (see below) to the API:

    PUT /api/v1/apc/<public_id>?api_key=<api_key>
    Content-Type: application/json
    
    {JSON Record Body}

or

    POST /api/v1/apc/<public_id>?api_key=<api_key>
    Content-Type: application/json
    
    {JSON Record Body}

The public_id MUST refer to a record which has already been published.  You can verify this via the 
search interface.

If there is an error (e.g. your document does not conform to the specification of the record), you will receive a 400.

If the public_id is not recognised as a public record, you will get a 404

If your api key is invalid, you will get a 401

On success, you will receive a 200, and the response body will be of the form:

    {
        "status" : "updated",
        "request_id" : "id of the request you just made",
        "public_id" : "id of the record when it appears in the public space"
    }

See above for documentation on the meaning of the fields in the response body. 

## Delete

To request that data on APCs that you previously provided be removed:

    DELETE /api/v1/apc/<public_id>?api_key=<api_key>
    
Calling delete on an item is asking that item to remove any reference to the APCs that were originally provided by your account.

If you are the only contributor to this record, this request will remove the record from the public database

If you are one of several contributors, only APCs provided by you will be removed - all other APCs and metadata will remain.
This operation does not remove other metadata that you provided - metadata is a permanent addition to the record, until
such time as all APCs by all contributors are removed from it

If the public_id does not exist, you will receive a 404

If you do not have any APCs in this record, this request will fail with a 403

If your API key is invalid, you will receive a 401

On success, you will receive a 200.


## JSON Record Body

Data send and received over the API will conform to the following structure.  If sending data, and it does
not conform to this structure, you will receive an error.

Overall, the validation requirements are:

* All strings must be suitably encoded unicode (e.g. UTF-8)
* All dates should be declared in UTC, and as a suitable ISO timestamp (e.g. YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)
* At least one dc:identifier must be present
* At least one jm:apc record must be present
* All jm:apc records must specify amount_inc_vat_gbp
* Currencies must be declared in standard ISO currency codes
* Fields which indicate a specific list of allowed values must be adhered to.
* Numeric fields should be sent as numbers, rather than strings containing numbers

```
{
    "@context" : {
        "jm": "http://jiscmonitor.jiscinvolve.org/",
        "dc": "http://purl.org/dc/elements/1.1/",
        "dcterms": "http://purl.org/dc/terms/",
        "rioxxterms": "http://rioxx.net/v2-0-beta-1/",
        "ali" : "http://www.niso.org/schemas/ali/1.0/jsonld.json"
    }

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
                    "identifier" : [
                        {"type" : "<identifier type>", "id" : "<organisation identifier>"}
                    ]
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
                    "identifier" : [
                        {"type" : "<identifier type>", "id" : "<organisation identifier>"}
                    ]
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
        "oa_type" : "<hybrid|oa|unknown>",
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
            ],
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
            },
            
            "organisation_name" : "<name of organisation>",
            "organisation_identifier" : [
                {"type" : "<identifier type>", "id" : "<organisation identifier>"}
            ],
            "organisation_department" : "<name of department>",
            
            "date_paid" : "<date apc paid (iso format)>",
            "amount" : <amount paid in native currency, excluding vat (float)>,
            "vat" : <vat paid in native currency (float)>,
            "currency" : "<currency paid in - from iso currency code list>",
            "amount_inc_vat_gbp" : <amout paid in equivalent GBP, including vat (float)>,
            "amount_ex_vat_gbp" : <amount paid in equivalent GBP, excluding vat (float)>,
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
        "free_to_read" : true|false,
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