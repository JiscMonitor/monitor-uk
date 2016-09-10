"""
Functions and classes used to refine the behaviour of the standard search API

Members of this module can be found referenced in the configuration config/service.py under SEARCHAPI
"""

from octopus.core import app
from service import models
from octopus.modules.es import sanitise
from octopus.modules.es.query import QueryFilterException

class StaticPublicDAOProxy(object):
    """
    Proxy class for providing static query methods for ES module
    """
    @classmethod
    def query(cls, q, *args, **kwargs):
        dao = models.PublicAPC()
        return dao.query(q)

def public_filter(obj):
    """
    Filter a public apc record appropriately for return to the public search API

    :param obj:
    :return:
    """
    inst = models.PublicAPC(obj)
    rec = inst.clean_record
    rec["@context"] = app.config.get("API_JSON_LD_CONTEXT")
    return rec

def private_filter(obj):
    """
    Filter a public apc record appropriately for return to the private search API

    :param obj:
    :return:
    """
    inst = models.PublicAPC(obj)
    rec = inst.clean_record
    rec["@context"] = app.config.get("API_JSON_LD_CONTEXT")
    return rec

def report_query_filter(q):
    """
    Modify (in place) the passed q to be suitable for querying for reports on the apc index

    :param q:
    :return:
    """
    include_sources = ["id", "created_date", "last_updated", "record", "index"]
    sort_fields = []
    type_field_map = {}

    raw_query = q.as_dict()

    try:
        sane = sanitise.sanitise(raw_query, sanitise.EDGES_STRUCT, source_includes=include_sources, aggs_type_field_map=type_field_map, sortable=sort_fields)
    except sanitise.QuerySanitisationException as e:
        raise QueryFilterException(e)

    # update the dict we were passed, to maintain by-reference
    raw_query.clear()
    raw_query.update(sane)


