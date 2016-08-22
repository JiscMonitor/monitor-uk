# -*- coding: UTF-8 -*-

from copy import deepcopy

class LanternFixtureFactory(object):

    @classmethod
    def record(cls):
        return deepcopy(LANTERN_RECORD)

    @classmethod
    def xwalk_result(cls):
        return deepcopy(XWALK_RESULT)

    @classmethod
    def interesting_dois(cls):
        # these two dois return a complete spread of data when sent to Lantern
        return [
            "10.1002/ana.24026",
            "10.1097/sla.0000000000000894"
        ]

    @classmethod
    def expected_enhancement_record(cls, doi):
        return deepcopy(EXPECTED_ENHANCEMENTS.get(doi, {}))

EXPECTED_ENHANCEMENTS = {
    "10.1002/ana.24026" : {
        "dc:identifier" : [
            {"type" : u"doi", "id" : u"10.1002/ana.24026"},
            {"type" : u"pmcid", "id" : u"PMC4223937"},
            {"type" : u"pmid", "id" : u"24085376"}
        ],

        "dc:title" : u"Diffusion-weighted imaging and diagnosis of transient ischemic attack.",

        "rioxxterms:author" : [
            {
                "name" : u"Brazzelli M",
                "affiliation" : [
                    {
                        "name" : u"Brain Research Imaging Centre, Centre for Clinical Brain Sciences, University of Edinburgh, Edinburgh, United Kingdom; Health Services Research Unit, University of Aberdeen, Aberdeen, United Kingdom.",
                    }
                ]
            },
            {"name" : u"Chappell FM"},
            {"name" : u"Miranda H"},
            {"name" : u"Shuler K"},
            {"name" : u"Dennis M"},
            {"name" : u"Sandercock PA"},
            {"name" : u"Muir K"},
            {"name" : u"Wardlaw JM"}
        ],

        "dcterms:publisher" : {
            "name" : u"Wiley-Blackwell"
        },

        "dc:source" : {
            "name" : u"Annals of neurology",
            "identifier" : [
                {"type" : u"issn", "id" : u"0364-5134" },
                {"type" : u"e-issn", "id" : u"1531-8249" }
            ],
            "oa_type" : u"hybrid"
        },

        "rioxxterms:project" : [
            {
                "funder_name" : u"Medical Research Council",
                "grant_number" : u"MR/K026992/1"
            }
        ],

        "ali:license_ref" : [
            {
                "type" : u"cc-by-nc-nd",
            }
        ],

        # when the Lantern repository data model is updated, this should be the new comparison
        #"jm:repository" : [
        #    {
        #        "repo_name" : u"Aberdeen University Research Archive",
        #        "repo_url" : u"http://aura.abdn.ac.uk/",
        #        "record_url" : u"http://hdl.handle.net/2164/3837",
        #        "metadata" : "True",
        #        "fulltext" : "Unknown",
        #        "machine_readable_fulltext" : "Unknown"
        #    }
        #],
        # meanwhile this is the one to use
        "jm:repository" : [
            {
                "repo_name" : u"Aberdeen University Research Archive",
                "metadata" : "True",
                "fulltext" : "Unknown",
                "machine_readable_fulltext" : "Unknown"
            }
        ]
    },
    "10.1097/sla.0000000000000894" : {
        "dc:identifier" : [
            {"type" : u"doi", "id" : u"10.1097/sla.0000000000000894"},
            {"type" : u"pmcid", "id" : u"PMC4160115"},
            {"type" : u"pmid", "id" : u"25115429"}
        ],

        "dc:title" : u"Addressing the appropriateness of elective colon resection for diverticulitis: a report from the SCOAP CERTAIN collaborative.",
        "rioxxterms:version" : u"AAM",

        "rioxxterms:author" : [
            {
                "name" : u"Simianu VV",
                "affiliation" : [
                    {
                        "name" : u"*Department of Surgery, University of Washington, Seattle †Department of Surgery, Swedish Medical Center, Seattle, WA ‡Surgical Care and Outcomes Assessment Program (SCOAP), Seattle, WA §Department of Surgery, Oregon Health & Science University, Portland ¶Department of Surgery, Madigan Army Medical Center, Tacoma, WA ‖Department of Surgery, Virginia Mason Medical Center, Seattle, WA.",
                    }
                ]
            },
            {"name" : u"Bastawrous AL"},
            {"name" : u"Billingham RP"},
            {"name" : u"Farrokhi ET"},
            {"name" : u"Fichera A"},
            {"name" : u"Herzig DO"},
            {"name" : u"Johnson E"},
            {"name" : u"Steele SR"},
            {"name" : u"Thirlby RC"},
            {"name" : u"Flum DR"}
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
            "oa_type" : u"hybrid"
        },

        "rioxxterms:project" : [
            {
                "funder_name" : u"NIDDK NIH HHS",
                "grant_number" : u"5T32DK070555-04"
            },
            {
                "funder_name" : u"NIDDK NIH HHS",
                "grant_number" : u"T32 DK070555"
            },
            {
                "funder_name" : u"AHRQ HHS",
                "grant_number" : u"HS20025"
            }
        ]
    }
}

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
        {
            "name": "Aberdeen University Research Archive",
            "fulltexts": [
                "http://hdl.handle.net/2164/3837"
            ],
            "url": "http://aura.abdn.ac.uk/"
        }
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
                "repo_name" : u"Aberdeen University Research Archive",
                "repo_url" : u"http://aura.abdn.ac.uk/",
                "record_url" : u"http://hdl.handle.net/2164/3837",
                "metadata" : "True",
                "fulltext" : "Unknown",
                "machine_readable_fulltext" : "Unknown"
            }
        ],

        "jm:provenance" : [
            u"Record enhanced via Lantern (not all data necessarily used), which provided provenance information: " + "; ".join(LANTERN_RECORD["provenance"])
        ]
    }
}