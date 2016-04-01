from octopus.modules.infosys.models import InfoSysCrud
from octopus.modules.crud.models import AuthorisationException
from octopus.core import app

from service.models.core import Request, PublicAPC             # because we're all in the models directory, have to be specific about the imports, or we'll have a circular dependency
from service.api import PublicApi, RequestApi

from copy import deepcopy
import json

class ApiRequest(InfoSysCrud):
    def __init__(self, raw=None, headers=None, account=None):
        # first clean out the json-ld stuff that might be in raw
        if raw is not None and "@context" in raw:
            del raw["@context"]

        # record the incoming data
        self.request = None
        self.raw = raw
        self.account = account
        self.public_id = None
        self.public_record = None

        # just call update, as it's the same operation as construction
        self.update(raw, headers)

        super(ApiRequest, self).__init__(raw, headers, account)

    @classmethod
    def pull(cls, id, account=None):
        """
        The id may be one of 2 things, in order of preference:

        1. The DOI
        2. The public id

        :param id:
        :param account:
        :return:
        """
        # if this is a DOI, do the DOI queries
        if id.startswith("10."):
            pub = PublicApi.find_public_record_by_identifier("doi", id)
            if pub is not None:
                return ApiRequest._make_from_public(pub, account)

        else:
            dao = PublicAPC()
            pub = dao.pull(id)
            if pub is not None:
                return ApiRequest._make_from_public(pub, account)

        return None

    @property
    def id(self):
        ident = self.request.doi
        if ident is not None:
            return ident
        if self.public_id is not None:
            return self.public_id
        return None

    def json(self):
        if self.raw is not None:
            dumpable = deepcopy(self.raw)
            dumpable["@context"] = app.config.get("API_JSON_LD_CONTEXT")
            return json.dumps(dumpable)
        return None

    def save(self):
        self.request = RequestApi.update(self.raw, account=self.account, public_id=self.public_id)

    def delete(self):
        # only allow delete to be called on a record where the requester has a stake in it
        # in reality, this doesn't really matter, as a request with no stake will just have no
        # effect, but this may be a clearer reaction to the user's request, and also may cut down
        # on effect-less requests.
        if self.public_record is not None:
            if self.account.id not in self.public_record.list_owners():
                raise AuthorisationException("You may only request delete on a record where you have previously provided data")
        self.request = RequestApi.delete(self.raw, account=self.account, public_id=self.public_id)

    def update(self, data, headers=None):
        # clean up the json-ld stuff that might be in the data
        if data is not None and "@context" in data:
            del data["@context"]

        if self.request is None:
            self.request = Request()
        if data is not None:
            self.request.record = data      # this will throw a DataSchemaException for the API layer to catch
        self.raw = data

    def append(self, data, headers=None):
        self.update(data, headers)

    def created_response(self):
        resp = {"status" : "created"}
        return self._add_identifiers(resp)

    def updated_response(self):
        resp = {"status" : "updated"}
        return self._add_identifiers(resp)

    def deleted_response(self):
        resp = {"status" : "deleted"}
        return self._add_identifiers(resp)

    def _add_identifiers(self, resp):
        if self.request is not None and self.request.id is not None:
            resp["request_id"] = self.request.id
        if self.request.doi is not None:
            resp["public_id"] = self.request.doi
        elif self.public_id is not None:
            resp["public_id"] = self.public_id
        return resp

    @classmethod
    def _make_from_public(cls, pub, account):
        req = ApiRequest(pub.clean_record, account=account)
        req.public_id = pub.id
        req.public_record = pub
        return req
