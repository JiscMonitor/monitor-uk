from octopus.modules.infosys.models import InfoSysModel
from octopus.lib import dataobj, dictmerge
from service import queries
import uuid
from copy import deepcopy

class ModelException(Exception):
    pass

class RecordMethods(dataobj.DataObj):

    @property
    def apc_records(self):
        return self._get_list("record.jm:apc")

    @apc_records.setter
    def apc_records(self, val):
        self._set_with_struct("record.jm:apc", val)

    def has_apcs(self):
        return len(self.apc_records) > 0

    def remove_apc_by_ref(self, ref):
        self._delete_from_list("record.jm:apc", matchsub={"ref" : ref})

    def add_apc_record(self, apc_record):
        self._add_to_list_with_struct("record.jm:apc", apc_record)

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
        super(Request, self).__init__(type="request", record_struct=CORE_STRUCT, admin_struct=REQUEST_ADMIN_STRUCT, index_rules=REQUEST_INDEX_RULES, full=full)
        self.clear_refs()

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

    @InfoSysModel.record.setter
    def record(self, val):
        InfoSysModel.record.fset(self, val)
        self.clear_refs()

    def make_public_apc(self):
        # make a new record which just contains the record data
        pub = PublicAPC()
        pub.record = self.record

        # go through all the apc records and assign references.
        # We do this by reading and then completely re-setting to ensure
        # that we go through full struct validation, so there's no chance
        # of us introducing badly formatted data
        refs = []
        updated_apcs = []
        for apc in pub.apc_records:
            ref = uuid.uuid4()
            refs.append(ref)
            apc["ref"] = ref
            updated_apcs.append(apc)
        pub.apc_records = updated_apcs

        # now add the admin data, linking the account to the reference(s)
        for ref in refs:
            pub.set_apc_ref(self.owner, ref)

        return pub

    def clear_refs(self):
        """
        Clear out any references that may be in the apc data

        Note, although this is a record-level operation, we put it on the Request because it is not relevant
        to the PublicAPC, and just would be a bug-risk
        :return:
        """
        for apc in self.apc_records:
            if "ref" in apc:
                del apc["ref"]

    ##################################################
    ## Data Access methods

    def find_by_identifier(self, type, id, owner, size=1):
        q = queries.RequestByIndexedIdentifierQuery(type, id, owner, size)
        return self.object_query(q=q.query())

    def list_all_since(self, since, page_size=1000):
        q = queries.RequestQueueQuery(since, page_size)
        # we use iterate rather than scroll because that way each request is a paged query, which has lower memory
        # requirements, and it means that the iteration is exhaustive, and includes items which were added to the
        # index right up until the last page is requested.  We can use an iterator here because the Request index
        # is append-only, and the query is in created_date order.
        return self.iterate(q=q.query(), page_size=page_size)


class PublicAPC(InfoSysModel, RecordMethods):
    def __init__(self, full=None, *args, **kwargs):
        super(PublicAPC, self).__init__(type="public", record_struct=CORE_STRUCT, admin_struct=PUBLIC_ADMIN_STRUCT, index_rules=PUBLIC_INDEX_RULES, full=full)

    def prep(self):
        # aside from the usual indexing prep, we also need to make sure we've got suitable numbers in all the
        # amount fields for each apc
        for apc in self.apc_records:
            if apc.get("amount_inc_vat_gbp") is None:
                apc["amount_inc_vat_gbp"] = apc.get("amount_ex_vat_gbp", 0) + apc.get("vat_gbp", 0)
        super(PublicAPC, self).prep()

    @property
    def clean_record(self):
        rec = deepcopy(self.record)
        for apc in rec.get("jm:apc", []):
            if "ref" in apc:
                del apc["ref"]
        return rec

    def copy(self):
        return PublicAPC(deepcopy(self.data))

    def overwrite(self, replacement):
        self.record = replacement.record
        self.admin = replacement.admin

    #####################################################
    ## Methods for working with apc ref admin data

    def get_apc_refs(self, account_id):
        owners = self._get_single("admin.apc_owners")
        if owners is None:
            return []
        return [x.get("ref") for x in owners if x.get("owner") == account_id]

    def set_apc_ref(self, account_id, ref):
        ro = {"owner" : account_id, "ref" : ref}
        self._add_to_list_with_struct("admin.apc_owners", ro)

    def remove_apc_refs(self, account_id):
        self._delete_from_list("admin.apc_owners", matchsub={"owner" : account_id})

    def list_owners(self):
        return list(set([x.get("owner") for x in self._get_list("admin.apc_owners")]))

    ######################################################
    ## Methods for working with apc records

    def get_apcs_by_owner(self, owner):
        refs = self.get_apc_refs(owner)
        return [x for x in self.apc_records if x.get("ref") in refs]

    def add_apc_for_owner(self, owner, apc_record):
        if "ref" not in apc_record:
            apc_record["ref"] = uuid.uuid4()
        self.add_apc_record(apc_record)
        self.set_apc_ref(owner, apc_record.get("ref"))

    def remove_apcs_by_owner(self, owner):
        refs = self.get_apc_refs(owner)
        for r in refs:
            self.remove_apc_by_ref(r)
        self.remove_apc_refs(owner)

    #####################################################
    ## Merge capability

    def merge_records(self, source):
        if not isinstance(source, PublicAPC):
            raise ModelException("Attempt to merge a PublicAPC with another kind of record")
        self.record = dictmerge.merge(source.record, self.record, RECORD_MERGE_RULES)

    #####################################################
    ## Data access methods

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

REQUEST_INDEX_RULES = [
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
    }
]

PUBLIC_INDEX_RULES = [
    {
        "index_field" : "additional_costs",
        "struct_args" : {"coerce" : "float"},
        "function" : {
            "name" : "add",
            "args" : ["$.record.'jm:apc'.additional_costs"]
        }
    },
    {
        "index_field" : "vat",
        "struct_args" : {"coerce" : "float"},
        "function" : {
            "name" : "add",
            "args" : ["$.record.'jm:apc'.vat_gbp"]
        }
    },
    {
        "index_field" : "amount_ex_vat",
        "struct_args" : {"coerce" : "float"},
        "function" : {
            "name" : "add",
            "args" : ["$.record.'jm:apc'.amount_ex_vat_gbp"]
        }
    },
    {
        "index_field" : "amount_inc_vat",
        "struct_args" : {"coerce" : "float"},
        "function" : {
            "name" : "add",
            "args" : ["$.record.'jm:apc'.amount_inc_vat_gbp"]
        }
    },
    {
        "index_field" : "grand_total",
        "struct_args" : {"coerce" : "float"},
        "function" : {
            "name" : "add",
            "args" : ["$.record.'jm:apc'.amount_inc_vat_gbp", "$.record.'jm:apc'.additional_costs"]
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
    {
        "index_field" : "apc_count",
        "struct_args" : {"coerce" : "integer"},
        "function" : {
            "name" : "count",
            "kwargs" : {
                "list_field" : "$.record.'jm:apc'"
            }
        }
    },
    {
        "index_field" : "org_count",
        "struct_args" : {"coerce" : "integer"},
        "function" : {
            "name" : "unique_count",
            "kwargs" : {
                "list_field" : "$.record.'jm:apc'",
                "unique_field" : "$.organisation_name"
            }
        }
    },
    {
        "index_field" : "account_count",
        "struct_args" : {"coerce" : "integer"},
        "function" : {
            "name" : "unique_count",
            "kwargs" : {
                "list_field" : "$.admin.apc_owners",
                "unique_field" : "$.owner"
            }
        }
    }
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
                "amount_inc_vat_gbp" : {"coerce" : "float"},
                "amount_ex_vat_gbp" : {"coerce" : "float"},
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

RECORD_MERGE_RULES = {
    "copy_if_missing" : [
        "dcterms:dateSubmitted",
        "dcterms:dateAccepted",
        "rioxxterms:publication_date",
        "dc:identifier",
        "rioxxterms:type",
        "dc:title",
        "dc:subject",
        "rioxxterms:author",
        "rioxxterms:contributor",
        "dcterms:publisher",
        "dc:source",
        "rioxxterms:project",
        "ali:license_ref",
        "jm:license_received",
        "jm:repository",
        "jm:provenance",
        "rioxxterms:version",
        "ali:free_to_read"
    ],
    "override" : [],
    "list_append" : {
        "dc:identifier" : {
            "dedupe" : True,
            "match" : [
                { "must" : ["$.type", "$.id"]}
            ]
        },
        "dc:subject" : {"dedupe" : True},
        "rioxxterms:author" : {
            "dedupe" : True,
            "match" : [
                {
                    "object_selector" : "$.identifier",
                    "must" : ["$.type", "$.id"]
                },
                {
                    "must" : ["$.name"]
                }
            ]
        },
        "rioxxterms:contributor" : {
            "dedupe" : True,
            "match" : [
                {
                    "object_selector" : "$.identifier",
                    "must" : ["$.type", "$.id"]
                },
                {
                    "must" : ["$.name"]
                }
            ]
        },
        "rioxxterms:project" : {
            "dedupe" : True,
            "match" : [
                {
                    "object_selector" : "$.identifier",
                    "must" : ["$.type", "$.id"]
                },
                {
                    "must" : ["$.funder_name"]
                }
            ]
        },
        "ali:license_ref" : {
            "dedupe" : True,
            "match" : [
                {
                    "must" : ["$.type", "$.version", "$.url", "$.start_date", "$.source"]
                }
            ]
        },
        "jm:license_received" : {
            "dedupe" : True,
            "match" : [
                {
                    "must" : ["$.date", "$.result"]
                }
            ]
        },
        "jm:repository" : {
            "dedupe" : True,
            "match" : [
                {
                    "must" : ["$.repo_url"]
                }
            ]
        },
        "jm:provenance" : { "dedupe" : True }
    },
    "merge" : {
        "rioxxterms:author" : {
            "copy_if_missing" : [
                "name",
                "identifier",
                "affiliation"
            ],
            "list_append" : {
                "identifier" : {
                    "dedupe" : True,
                    "match" : [
                        { "must" : ["$.type", "$.id"]}
                    ]
                },
                "affiliation" : {
                    "dedupe" : True,
                    "match" : [
                        {
                            "object_selector" : "$.identifier",
                            "must" : ["$.type", "$.id"]
                        },
                        {
                            "must" : ["$.name"]
                        }
                    ]
                }
            },
            "merge" : {
                "affiliation" : {
                    "copy_if_missing" : [
                        "name",
                        "identifier"
                    ],
                    "list_append" : {
                        "identifier" : {
                            "dedupe" : True,
                            "match" : [
                                { "must" : ["$.type", "$.id"]}
                            ]
                        }
                    }
                }
            }
        },
        "rioxxterms:contributor" : {
            "copy_if_missing" : [
                "name",
                "identifier",
                "affiliation"
            ],
            "list_append" : {
                "identifier" : {
                    "dedupe" : True,
                    "match" : [
                        { "must" : ["$.type", "$.id"]}
                    ]
                },
                "affiliation" : {
                    "dedupe" : True,
                    "match" : [
                        {
                            "object_selector" : "$.identifier",
                            "must" : ["$.type", "$.id"]
                        },
                        {
                            "must" : ["$.name"]
                        }
                    ]
                }
            },
            "merge" : {
                "affiliation" : {
                    "copy_if_missing" : [
                        "name",
                        "identifier"
                    ],
                    "list_append" : {
                        "identifier" : {
                            "dedupe" : True,
                            "match" : [
                                { "must" : ["$.type", "$.id"]}
                            ]
                        }
                    }
                }
            }
        },
        "dcterms:publisher" : {
            "copy_if_missing" : [
                "name",
                "identifier"
            ],
            "list_append" : {
                "identifier" : {
                    "dedupe" : True,
                    "match" : [
                        { "must" : ["$.type", "$.id"]}
                    ]
                }
            }
        },
        "dc:source" : {
            "copy_if_missing" : [
                "name",
                "identifier",
                "oa_type",
                "self_archiving"
            ],
            "list_append" : {
                "identifier" : {
                    "dedupe" : True,
                    "match" : [
                        { "must" : ["$.type", "$.id"]}
                    ]
                }
            },
            "merge" : {
                "self_archiving" : {
                    "copy_if_missing" : [
                        "preprint",
                        "postprint",
                        "publisher"
                    ]
                }
            }
        }
    }
}
