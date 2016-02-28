from service.models import Request, PublicAPC

class RequestAPIException(Exception):
    pass

class RequestApi(object):

    @classmethod
    def update(cls, record, account, public_id=None):
        if record is None:
            raise RequestAPIException("You can't call 'update' with a NoneType record argument")
        if account is None:
            raise RequestAPIException("You can't call 'update' with a NoneType account argument")

        req = Request()
        req.record = record
        req.owner = account.id
        req.action = "update"
        if public_id is not None:
            req.public_id = public_id

        req.save()
        return req

    @classmethod
    def delete(cls, record, account, public_id):
        if record is None:
            raise RequestAPIException("You can't call 'delete' with a NoneType record argument")
        if account is None:
            raise RequestAPIException("You can't call 'delete' with a NoneType account argument")
        if public_id is None:
            raise RequestAPIException("You can't call 'delete' with a NoneType public_id argument")

        req = Request()
        req.record = record
        req.owner = account.id
        req.action = "delete"
        req.public_id = public_id

        req.save()
        return req

class PublicApi(object):

    @classmethod
    def publish(cls):
        pass

    @classmethod
    def find_public_record(cls, req):
        # We look for public records with the following precedence:
        # 1. by public id
        # 2. By DOI
        # 3. By PMID
        # 4. By PMCID
        # 5. By URL
        dao = PublicAPC()
        pub = None

        if req.public_id is not None:
            pub = dao.pull(req.public_id)

        if pub is not None:
            return pub

        if req.doi is not None:
            pub = dao.find_by_doi(req.doi)

        if pub is not None:
            return pub

        if req.pmid is not None:
            pub = dao.find_by_pmid(req.pmid)

        if pub is not None:
            return pub

        if req.pmcid is not None:
            pub = dao.find_by_pmcid(req.pmcid)

        if pub is not None:
            return pub

        if req.url is not None:
            pub = dao.find_by_url(req.url)

        # by now we have it or it is None still
        return pub

    @classmethod
    def merge_records(cls, source, target):
        pass

    @classmethod
    def separate_records(cls, source, target):
        pass

    @classmethod
    def remove(cls, pub):
        pass