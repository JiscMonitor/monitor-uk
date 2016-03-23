from octopus.modules.infosys.models import InfoSysCrud
from service.models.core import Request, PublicAPC             # because we're all in the models directory, have to be specific about the imports, or we'll have a circular dependency
from service.api import PublicApi, RequestApi
import json

class ApiRequest(InfoSysCrud):
    def __init__(self, raw=None, headers=None, account=None):
        # do a validation step
        self.request = None
        self.raw = raw
        self.account = account
        self.public_id = None
        self.request_id = None

        # just call update, as it's the same operation as construction
        self.update(raw, headers)

        super(ApiRequest, self).__init__(raw, headers, account)

    @classmethod
    def pull(cls, id, account=None):
        """
        The id may be one of 3 things, in order of preference:

        1. The DOI
        2. The public id
        3. The request id

        We'll then determine the record we pull based on the following criteria:

        If id is a DOI (determined by inspection), look for it in the public space.
        If it is not there, look for it in the request space, for this user
        If it is an opaque id (might be public, might be request), look for it in the public space
        If it is not there, look for it in the requests space for this user
        If still not found, return None

        :param id:
        :param account:
        :return:
        """
        # if this is a DOI, do the DOI queries
        if id.startswith("10."):
            pub = PublicApi.find_public_record_by_identifier("doi", id)
            if pub is not None:
                return ApiRequest._make_from_public(pub, account)

            req = RequestApi.find_request_by_identifier("doi", id, account.id)
            if req is not None:
                return ApiRequest._make_from_request(req, account)

        else:
            dao = PublicAPC()
            pub = dao.pull(id)
            if pub is not None:
                return ApiRequest._make_from_public(pub, account)

            dao = Request()
            req = dao.pull(id)
            if req.owner == account.id:
                return ApiRequest._make_from_request(req, account)

        return None

    @property
    def id(self):
        ident = self.request.doi
        if ident is not None:
            return ident
        if self.public_id is not None:
            return self.public_id
        if self.request_id is not None:
            return self.request_id

    def json(self):
        if self.raw is not None:
            return json.dumps(self.raw)
        return None

    def save(self):
        self.request = RequestApi.update(self.raw, account=self.account, public_id=self.public_id)

    def delete(self):
        self.request = RequestApi.delete(self.raw, account=self.account, public_id=self.public_id)

    def update(self, data, headers=None):
        if self.request is None:
            self.request = Request()
        if data is not None:
            self.request.record = data      # this will throw a DataSchemaException for the API layer to catch
        self.raw = data

    @classmethod
    def _make_from_public(cls, pub, account):
        req = ApiRequest(pub.clean_record, account=account)
        req.public_id = pub.id
        return req

    @classmethod
    def _make_from_request(cls, req, account):
        obj = ApiRequest(req.record, account=account)
        obj.request_id = req.id
        return obj
