from octopus.core import app
from service import models

class StaticPublicDAOProxy(object):

    @classmethod
    def query(cls, q, *args, **kwargs):
        dao = models.PublicAPC()
        return dao.query(q)

def public_filter(obj):
    inst = models.PublicAPC(obj)
    rec = inst.clean_record
    rec["@context"] = app.config.get("API_JSON_LD_CONTEXT")
    return rec

def private_filter(obj):
    inst = models.PublicAPC(obj)
    rec = inst.clean_record
    rec["@context"] = app.config.get("API_JSON_LD_CONTEXT")
    return rec