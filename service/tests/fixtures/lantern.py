from copy import deepcopy

class LanternFixtureFactory(object):

    @classmethod
    def record(cls):
        return deepcopy(LANTERN_RECORD)

    @classmethod
    def xwalk_result(cls):
        return deepcopy(XWALK_RESULT)


LANTERN_RECORD = {
    "_id": "1111111111",
    "pmcid": "PMC4160115",
    "pmid": "25115429",
    "doi": "10.1097/sla.0000000000000894",
    "title": "Addressing the appropriateness of elective colon resection for diverticulitis",
    "journal": {
        "in_doaj": False,
        "title": "Annals of surgery",
        "issn": "0003-4932",
        "eissn": "1528-1140",
        "dateOfPublication": "01-09-2014"
    },
    "publisher": "Ovid Technologies (Wolters Kluwer Health)",
    "confidence": 1,
    "in_epmc": True,
    "is_aam": True,
    "is_oa": True,
    "aheadofprint": None,
    "has_fulltext_xml": False,
    "licence": "cc-by",
    "epmc_licence": "cc-by",
    "licence_source": "epmc_html",
    "epmc_licence_source": "epmc_html",
    "romeo_colour": "yellow",
    "embargo": {
        "preprint": 12,
        "postprint": False,
        "pdf": 6
    },
    "archiving": {
        "preprint": False,
        "postprint": "can",
        "pdf": "cannot"
    },
    "author": [
        {
            "fullName": "Simianu VV",
            "firstName": "Vlad V",
            "lastName": "Simianu",
            "initials": "VV",
            "affiliation": "Department of Surgery, University of Washington",
            "authorId": {
                "type": "ORCID",
                "value": "0000-0001-9535-022X"
            }
        }
    ],
    "repositories": [
        "Aberdeen University Research Archive"
    ],
    "grants": [
        {
            "grantId": "MR/K026992/1",
            "agency": "Medical Research Council",
            "orderIn": 0,
            "PI": "Professor Ian Deary"
        }
    ],
    "provenance": [
        "Added PMCID from EUPMC",
        "Added PMID from EUPMC",
        "Added DOI from EUPMC",
        "Confirmed is in EUPMC",
        "Added journal title from EUPMC",
        "Added eissn from EUPMC",
        "Added issn from EUPMC",
        "Added grants data from EUPMC",
        "Added date of publication from EUPMC",
        "Added EPMC licence from epmc_html. ",
        "Added author list from EUPMC",
        "Checked author manuscript status in EUPMC, returned Y_IN_EPMC_SPLASHPAGE",
        "Added publisher name from Crossref",
        "Could not find DOI in CORE",
        "Could not find journal in DOAJ",
        "Added embargo and archiving data from Sherpa Romeo",
        "Unable to retrieve licence data via article publisher splash page lookup (used to be OAG)."
    ],
    "publisher_licence_check_ran": True,
    "publisher_licence": "unknown",
    "createdAt": 1470153620775,
    "PMID": "",
    "DOI": "",
    "process": "1111111111"
}

XWALK_RESULT = {
    "id" : "123456789",
    "created_date" : "2001-01-01T00:00:00Z",
    "last_updated" : "2002-01-01T00:00:00Z",

    "record" : {
        "rioxxterms:publication_date" : u"2014-09-01T00:00:00Z",

        "dc:identifier" : [
            {"type" : u"doi", "id" : u"10.1097/sla.0000000000000894"},
            {"type" : u"pmcid", "id" : u"PMC4160115"},
            {"type" : u"pmid", "id" : u"25115429"}
        ],

        "dc:title" : u"Addressing the appropriateness of elective colon resection for diverticulitis",
        "rioxxterms:version" : u"AAM",

        "rioxxterms:author" : [
            {
                "name" : u"Simianu VV",
                "affiliation" : [
                    {
                        "name" : u"Department of Surgery, University of Washington",
                    }
                ]
            }
        ],

        "dcterms:publisher" : {
            "name" : u"Ovid Technologies (Wolters Kluwer Health)"
        },

        "dc:source" : {
            "name" : u"Annals of surgery",
            "identifier" : [
                {"type" : u"issn", "id" : u"0003-4932" },
                {"type" : u"e-issn", "id" : u"1528-1140" }
            ],
            "oa_type" : u"hybrid",
            "self_archiving" : {
                "preprint" : {
                    "embargo" : 12
                },
                "postprint" : {
                    "policy" : u"can"
                },
                "publisher" : {
                    "policy" : u"cannot",
                    "embargo" : 6
                }
            }
        },

        "rioxxterms:project" : [
            {
                "funder_name" : u"Medical Research Council",
                "grant_number" : u"MR/K026992/1"
            }
        ],

        "ali:license_ref" : [
            {
                "type" : u"cc-by",
            }
        ],

        "jm:repository" : [
            {
                "repo_name" : u"Aberdeen University Research Archive"
            }
        ],

        "jm:provenance" : [
            u"Record enhanced via Lantern (not all data necessarily used), which provided provenance information: " + "; ".join(LANTERN_RECORD["provenance"])
        ]
    }
}