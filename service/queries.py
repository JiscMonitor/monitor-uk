"""
A set of pre-prepared, useful queries, to be applied to the various index types
"""
from octopus.modules.es.dao import SearchAPIQuery

class IndexedIdentifierQuery(object):
    """
    Prepared query for listing records with an identifier of a given type.

    Suitable for objects which index their identifier types as

    index.<type> = <val>
    """
    def __init__(self, type, val):
        self.type = type
        self.val = val

    def query(self):
        field = "index." + self.type + ".exact"
        return {
            "query" : {
                "bool" : {
                    "must" : [
                        {"term" : {field : self.val}}
                    ]
                }
            }
        }

class RequestByIndexedIdentifierQuery(object):
    """
    Prepared query for listing Requests with a given identifier (of a specified type), owned by a specified user
    """
    def __init__(self, type, val, owner, size=10):
        self.type = type
        self.val = val
        self.owner = owner
        self.size = size

    def query(self):
        field = "index." + self.type + ".exact"
        return {
            "query" : {
                "bool" : {
                    "must" : [
                        {"term" : {field : self.val}},
                        {"term" : {"admin.owner.exact" : self.owner}}
                    ]
                }
            },
            "size" : self.size,
            "sort" : [{"created_date" : {"order" : "desc"}}]
        }

class CreatedDateQueueQuery(object):
    """
    Prepared query for listing all records which have a created date after the given date

    Results are ordered by created_date, most oldest first
    """
    def __init__(self, since, size=1000):
        self.size = size
        self.since = since

    def query(self):
        return {
            "query" : {
                "bool" : {
                    "must" : [
                        {"range" : {"created_date" : {"gte" : self.since}}}
                    ]
                }
            },
            "size" : self.size,
            "sort" : [{"created_date" : {"order" : "asc"}}]
        }

class OwnerQuery(object):
    """
    Prepared query for listing records which are owned by a specific user account
    """
    def __init__(self, owner):
        self.owner = owner

    def query(self):
        return {
            "query" : {
                "bool" : {
                    "must" : [
                        {"term" : {"admin.apc_owners.owner.exact" : self.owner}}
                    ]
                }
            }
        }

class PublicSearchQuery(SearchAPIQuery):
    """
    This class just gives us a place to hang any changes to the default SearchAPIQuery for public
    requests
    """
    pass

class PrivateSearchQuery(SearchAPIQuery):
    """
    Applies a constraint to the SearchAPIQuery, limiting it only to results owned by the specified user
    """
    def query(self):
        q = {
            "query" :{
                "bool" : {
                    "must" : [
                        {
                            "query_string" : {
                                "query" : self.qs
                            }
                        },
                        {
                            "term" : {
                                "admin.apc_owners.owner.exact" : self.acc.id
                            }
                        }
                    ]
                }
            },
            "from" : self.fro,
            "size" : self.psize,
        }

        if self.sortby is not None:
            q["sort"] = [{self.sortby : {"order" : self.sortdir, "mode" : "min"}}]

        return q

