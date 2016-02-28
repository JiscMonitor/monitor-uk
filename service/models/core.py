from octopus.modules.infosys.models import InfoSysModel
from octopus.lib import dataobj
from service import queries

class RecordMethods(dataobj.DataObj):

    @property
    def doi(self):
        return self._get_first_identifier("doi")

    @property
    def pmid(self):
        return self._get_first_identifier("pmid")

    @property
    def pmcid(self):
        return self._get_first_identifier("pmcid")

    @property
    def url(self):
        return self._get_first_identifier("url")

    def _get_first_identifier(self, type):
        for ident in self._get_list("record.dc:identifier"):
            if ident.get("type") == type:
                return ident.get("id")
        return None

class Request(InfoSysModel, RecordMethods):
    def __init__(self, full=None, *args, **kwargs):
        super(Request, self).__init__(type="request", record_struct=CORE_STRUCT, admin_struct=REQUEST_ADMIN_STRUCT, full=full)

    @property
    def owner(self):
        return self._get_single("admin.owner")

    @owner.setter
    def owner(self, val):
        self._set_with_struct("admin.owner", val)

    @property
    def action(self):
        return self._get_single("admin.action")

    @action.setter
    def action(self, val):
        self._set_with_struct("admin.action", val)

    @property
    def public_id(self):
        return self._get_single("admin.public_id")

    @public_id.setter
    def public_id(self, val):
        self._set_with_struct("admin.public_id", val)

class PublicAPC(InfoSysModel, RecordMethods):
    def __init__(self, full=None, *args, **kwargs):
        super(PublicAPC, self).__init__(type="public", record_struct=CORE_STRUCT, admin_struct=PUBLIC_ADMIN_STRUCT, index_rules=PUBLIC_INDEX_RULES, full=full)

    def set_apc_ref(self, account_id, ref):
        ro = {"owner" : account_id, "ref" : ref}
        self._add_to_list_with_struct("admin.apc_owners", ro)

    def get_apc_refs(self, account_id):
        owners = self._get_single("admin.apc_owners")
        if owners is None:
            return []
        return [x.get("ref") for x in owners]

    def find_by_doi(self, val):
        q = queries.IndexedIdentifierQuery("doi", val)
        return self.object_query(q=q.query())

    def find_by_pmid(self, val):
        q = queries.IndexedIdentifierQuery("pmid", val)
        return self.object_query(q=q.query())

    def find_by_pmcid(self, val):
        q = queries.IndexedIdentifierQuery("pmcid", val)
        return self.object_query(q=q.query())

    def find_by_url(self, val):
        q = queries.IndexedIdentifierQuery("url", val)
        return self.object_query(q=q.query())

###############################################################
## Shared resources for class construction

PUBLIC_INDEX_RULES = [
    {
        "index_field" : "apc_total_amount_gbp",
        "struct_args" : {"coerce" : "float"},
        "function" : {
            "name" : "add",
            "args" : ["$.record.'jm:apc'.amount_gbp"]
        }
    },
    {
        "index_field" : "apc_total_vat_gbp",
        "struct_args" : {"coerce" : "float"},
        "function" : {
            "name" : "add",
            "args" : ["$.record.'jm:apc'.vat_gbp"]
        }
    },
    {
        "index_field" : "apc_total_gbp",
        "struct_args" : {"coerce" : "float"},
        "function" : {
            "name" : "add",
            "args" : ["$.record.'jm:apc'.amount_gbp", "$.record.'jm:apc'.vat_gbp"]
        }
    },
    {
        "index_field" : "sum_total_gbp",
        "struct_args" : {"coerce" : "float"},
        "function" : {
            "name" : "add",
            "args" : ["$.record.'jm:apc'.amount_gbp", "$.record.'jm:apc'.vat_gbp", "$.record.'jm:apc'.additional_costs"]
        }
    },
    {
        "index_field" : "doi",
        "struct_args" : {"coerce" : "unicode"},
        "function" : {
            "name" : "opath",
            "args" : ["$.record.'dc:identifier'[@.type is 'doi'].id"]
        }
    },
    {
        "index_field" : "pmcid",
        "struct_args" : {"coerce" : "unicode"},
        "function" : {
            "name" : "opath",
            "args" : ["$.record.'dc:identifier'[@.type is 'pmcid'].id"]
        }
    },
    {
        "index_field" : "pmid",
        "struct_args" : {"coerce" : "unicode"},
        "function" : {
            "name" : "opath",
            "args" : ["$.record.'dc:identifier'[@.type is 'pmid'].id"]
        }
    },
    {
        "index_field" : "url",
        "struct_args" : {"coerce" : "unicode"},
        "function" : {
            "name" : "opath",
            "args" : ["$.record.'dc:identifier'[@.type is 'url'].id"]
        }
    },
    {
        "index_field" : "issn",
        "struct_args" : {"coerce" : "unicode"},
        "function" : {
            "name" : "opath",
            "args" : [
                "$.record.'dc:source'.identifier[@.type is 'issn'].id",
                "$.record.'dc:source'.identifier[@.type is 'e-issn'].id",
                "$.record.'dc:source'.identifier[@.type is 'p-issn'].id",
                "$.record.'dc:source'.identifier[@.type is 'issn-l'].id",
            ]
        }
    },
    {
        "index_field" : "ascii_unpunc_title",
        "struct_args" : {"coerce" : "unicode"},
        "function" : {
            "name" : "ascii_unpunc",
            "args" : ["$.record.'dc:title'"]
        }
    },
]

PUBLIC_ADMIN_STRUCT = {
    "lists" : {
        "apc_owners" : {"contains" : "object"}
    },
    "structs" : {
        "apc_owners" : {
            "fields" : {
                "owner" : {"coerce" : "unicode"},
                "ref" : {"coerce" : "unicode"}
            }
        }
    }
}

REQUEST_ADMIN_STRUCT = {
    "fields" : {
        "owner" : {"coerce" : "unicode"},
        "action" : {"coerce" : "unicode", "allowed_values" : [u"update", u"delete"]},
        "public_id" : {"coerce" : "unicode"}
    }
}

CORE_STRUCT = {
    "fields" : {
        "dc:title" : {"coerce" : "unicode"},
        "dcterms:dateAccepted" : {"coerce" : "utcdatetime"},
        "dcterms:dateSubmitted" : {"coerce" : "utcdatetime"},
        "rioxxterms:publication_date" : {"coerce" : "utcdatetime"},
        "rioxxterms:type" : {"coerce" : "unicode"},
        "rioxxterms:version" : {"coerce" : "unicode"}
    },
    "lists" : {
        "ali:license_ref" : {"contains" : "object"},
        "dc:identifier" : {"contains" : "object"},
        "dc:subject" : {"contains" : "field", "coerce" : "unicode"},
        "jm:apc" : {"contains" : "object"},
        "jm:license_received" : {"contains" : "object"},
        "jm:provenance" : {"contains" : "field", "coerce" : "unicode"},
        "jm:repository" : {"contains" : "object"},
        "rioxxterms:author" : {"contains" : "object"},
        "rioxxterms:contributor" : {"contains" : "object"},
        "rioxxterms:project" : {"contains" : "object"}
    },
    "objects" : [
        "dc:source",
        "dcterms:publisher",
        "ali:free_to_read"
    ],
    "structs" : {
        "ali:free_to_read" : {
            "fields" : {
                "free_to_read" : {"coerce" : "bool"},
                "start_date" : {"coerce" : "utcdatetime"},
                "end_date" : {"coerce" : "utcdatetime"}
            }
        },
        "ali:license_ref" : {
            "fields" : {
                "type" : {"coerce" : "unicode"},
                "version" : {"coerce" : "unicode"},
                "url" : {"coerce" : "unicode"},
                "start_date" : {"coerce" : "utcdatetime"},
                "source" : {"coerce" : "unicode"}
            }
        },
        "dc:identifier" : {
            "fields" : {
                "type" : {"coerce" : "unicode"},
                "id" : {"coerce" : "unicode"}
            }
        },
        "dc:source" : {
            "fields" : {
                "name" : {"coerce" : "unicode"},
                "oa_type" : {"coerce" : "unicode", "allowed_values" : [u"hybrid", u"oa"]}
            },
            "lists" : {
                "identifier" : {"contains" : "object"}
            },
            "objects" : [
                "self_archiving"
            ],
            "structs" : {
                "identifier" : {
                    "fields" : {
                        "type" : {"coerce" : "unicode"},
                        "id" : {"coerce" : "unicode"}
                    }
                },
                "self_archiving" : {
                    "objects" : [
                        "preprint",
                        "postprint",
                        "publisher"
                    ],
                    "structs" : {
                        "preprint" : {
                            "fields" : {
                                "policy" : {"coerce" : "unicode"},
                                "embargo" : {"coerce" : "integer"}
                            }
                        },
                        "postprint" : {
                            "fields" : {
                                "policy" : {"coerce" : "unicode"},
                                "embargo" : {"coerce" : "integer"}
                            }
                        },
                        "publisher" : {
                            "fields" : {
                                "policy" : {"coerce" : "unicode"},
                                "embargo" : {"coerce" : "integer"}
                            }
                        }
                    }
                }
            }
        },
        "dcterms:publisher" : {
            "fields" : {
                "name" : {"coerce" : "unicode"}
            },
            "lists" : {
                "identifier" : {"contains" : "object"}
            },
            "structs" : {
                "identifier" : {
                    "fields" : {
                        "type" : {"coerce" : "unicode"},
                        "id" : {"coerce" : "unicode"}
                    }
                }
            }
        },
        "jm:apc" : {
            "fields" : {
                "ref" : {"coerce" : "unicode"},
                "date_applied" : {"coerce" : "utcdatetime"},
                "organisation_name" : {"coerce" : "unicode"},
                "organisation_department" : {"coerce" : "unicode"},
                "date_paid" : {"coerce" : "utcdatetime"},
                "amount" : {"coerce" : "float"},
                "vat" : {"coerce" : "float"},
                "currency" : {"coerce" : "currency_code"},
                "amount_gbp" : {"coerce" : "float"},
                "vat_gbp" : {"coerce" : "float"},
                "additional_costs" : {"coerce" : "float"},
                "notes" : {"coerce" : "unicode"}
            },
            "lists" : {
                "organisation_identifier" : {"contains" : "object"},
                "discounts" : {"contains" : "field", "coerce" : "unicode"},
                "fund" : {"contains" : "object"},
                "publication_process_feedback" : {"contains" : "field", "coerce" : "unicode"}
            },
            "objects" : [
                "submitted_by"
            ],
            "structs" : {
                "submitted_by" : {
                    "fields" : {
                        "name" : {"coerce" : "unicode"}
                    },
                    "lists" : {
                        "identifier" : {"contains" : "object"}
                    },
                    "structs" : {
                        "identifier" : {
                            "fields" : {
                                "type" : {"coerce" : "unicode"},
                                "id" : {"coerce" : "unicode"}
                            }
                        }
                    }
                },
                "organisation_identifier" : {
                    "fields" : {
                        "type" : {"coerce" : "unicode"},
                        "id" : {"coerce" : "unicode"}
                    }
                },
                "fund" : {
                    "fields" : {
                        "name" : {"coerce" : "unicode"},
                        "amount" : {"coerce" : "float"},
                        "currency" : {"coerce" : "currency_code"},
                        "amount_gbp" : {"coerce" : "float"}
                    }
                }
            }
        },
        "jm:license_received" : {
            "fields" : {
                "date" : {"coerce" : "utcdatetime"},
                "received" : {"coerce" : "bool"}
            }
        },
        "jm:repository" : {
            "fields" : {
                "repo_name" : {"coerce" : "unicode"},
                "repo_url" : {"coerce" : "unicode"},
                "record_url" : {"coerce" : "unicode"},
                "metadata" : {"coerce" : "unicode", "allowed_values" : [u"True", u"False", u"Unknown"]},
                "fulltext" : {"coerce" : "unicode", "allowed_values" : [u"True", u"False", u"Unknown"]},
                "machine_readable_fulltext" : {"coerce" : "unicode", "allowed_values" : [u"True", u"False", u"Unknown"]},
                "version" : {"coerce" : "unicode"}
            }
        },
        "rioxxterms:author" : {
            "fields" : {
                "name" : {"coerce" : "unicode"}
            },
            "lists" : {
                "identifier" : {"contains" : "object"},
                "affiliation" : {"contains" : "object"}
            },
            "structs": {
                "identifier": {
                    "fields" : {
                        "type" : {"coerce" : "unicode"},
                        "id" : {"coerce" : "unicode"}
                    }
                },
                "affiliation" : {
                    "fields" : {
                        "name" : {"coerce" : "unicode"}
                    },
                    "lists" : {
                        "identifier" : {"contains" : "object"}
                    },
                    "structs" : {
                        "identifier" : {
                            "fields" : {
                                "type" : {"coerce" : "unicode"},
                                "id" : {"coerce" : "unicode"}
                            }
                        }
                    }
                }

            }
        },
        "rioxxterms:contributor" : {
            "fields" : {
                "name" : {"coerce" : "unicode"}
            },
            "lists" : {
                "identifier" : {"contains" : "object"},
                "affiliation" : {"contains" : "object"}
            },
            "structs": {
                "identifier": {
                    "fields" : {
                        "type" : {"coerce" : "unicode"},
                        "id" : {"coerce" : "unicode"}
                    }
                },
                "affiliation" : {
                    "fields" : {
                        "name" : {"coerce" : "unicode"}
                    },
                    "lists" : {
                        "identifier" : {"contains" : "object"}
                    },
                    "structs" : {
                        "identifier" : {
                            "fields" : {
                                "type" : {"coerce" : "unicode"},
                                "id" : {"coerce" : "unicode"}
                            }
                        }
                    }
                }

            }
        },
        "rioxxterms:project" : {
            "fields" : {
                "funder_name" : {"coerce" : "unicode"},
                "grant_number" : {"coerce" : "unicode"}
            },
            "lists" : {
                "funder_identifier" : {"contains" : "object"}
            },
            "structs" : {
                "funder_identifier" : {
                    "fields" : {
                        "type" : {"coerce" : "unicode"},
                        "id" : {"coerce" : "unicode"}
                    }
                }
            }
        }
    }
}