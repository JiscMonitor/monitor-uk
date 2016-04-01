from service import models

class StaticPublicDAOProxy(object):

    @classmethod
    def query(cls, q, *args, **kwargs):
        dao = models.PublicAPC()
        return dao.query(q)

def public_filter(obj):
    inst = models.PublicAPC(obj)
    return inst.clean_record

def private_filter(obj):
    inst = models.PublicAPC(obj)
    return inst.clean_record