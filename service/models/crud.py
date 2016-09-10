"""
Models associated with the CRUD API
"""
from octopus.modules.infosys.models import InfoSysCrud
from octopus.modules.crud.models import AuthorisationException
from octopus.core import app
from octopus.lib import dataobj

from service.models.core import Request, PublicAPC             # because we're all in the models directory, have to be specific about the imports, or we'll have a circular dependency
from service.api import PublicApi, RequestApi

from copy import deepcopy
import json

class ApiRequest(InfoSysCrud):
    """
    The main model object for handing incoming requests to the CRUD API.  This object provides
    a proxy and validation for data coming in via the web API before it is converted to a true,
    core system object
    """
    def __init__(self, raw=None, headers=None, account=None, validate=True):
        """
        Make a new instance of an object around the incoming API data

        :param raw:     the raw data supplied by the caller
        :param headers:     the HTTP headers in the request
        :param account:     the user account associated with the request
        :param validate:    whether to aggressively validate the request
        :return:
        """
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
        self.update(raw, headers, validate)

        super(ApiRequest, self).__init__(raw, headers, account)

    @classmethod
    def pull(cls, id, account=None):
        """
        Pull a record with the given id, in the context of the supplied account (response content may vary slightly
        if the user owns the record)

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
        """
        Get the preferred id of the record

        :return:
        """
        ident = self.request.doi
        if ident is not None:
            return ident
        if self.public_id is not None:
            return self.public_id
        return None

    def json(self):
        """
        Get the record JSON, suitable for delivery over the web API
        :return:
        """
        if self.raw is not None:
            dumpable = deepcopy(self.raw)
            dumpable["@context"] = app.config.get("API_JSON_LD_CONTEXT")
            return json.dumps(dumpable)
        return None

    def save(self):
        """
        Save the incoming request.  This passes the (validated) data on to the RequestApi for processing

        :return:
        """
        self.request = RequestApi.update(self.raw, account=self.account, public_id=self.public_id)

    def delete(self):
        """
        Delete the associated object.

        This passes to the RequestApi to raise a delete request, so does not necessarily happen immediately

        :return:
        """
        # only allow delete to be called on a record where the requester has a stake in it
        # in reality, this doesn't really matter, as a request with no stake will just have no
        # effect, but this may be a clearer reaction to the user's request, and also may cut down
        # on effect-less requests.
        if self.public_record is not None:
            if self.account.id not in self.public_record.list_owners():
                raise AuthorisationException("You may only request delete on a record where you have previously provided data")
        self.request = RequestApi.delete(self.raw, account=self.account, public_id=self.public_id)

    def update(self, data, headers=None, validate=True):
        """
        Pass new data to the object to update its contents

        This carries out some validation of the incoming data (if requested), and populates this object with the
        updated information.

        :param data:
        :param headers:
        :param validate:
        :return:
        """
        # clean up the json-ld stuff that might be in the data
        if data is not None and "@context" in data:
            del data["@context"]

        if self.request is None:
            self.request = Request()
        if data is not None:
            self.request.record = data      # this will throw a DataSchemaException for the API layer to catch

        # we also need to do some API-specific validation here
        if data is not None and validate:
            # must have at least one identifier
            idents = self.request.identifiers
            if idents is None or len(idents) == 0:
                raise dataobj.DataStructureException("There must be at least one identifier associated with a record")

            # must have at least one APC record
            apcs = self.request.apc_records
            if apcs is None or len(apcs) == 0:
                raise dataobj.DataStructureException("There must be at least one APC entry associated with a record")

            # each APC must have the amount_gbp_inc_vat set
            for apc in apcs:
                amount = apc.get("amount_inc_vat_gbp")
                if amount is None:
                    raise dataobj.DataStructureException("All APC entries must contain a valid value in the field 'amount_inc_vat_gbp'")

        self.raw = data

    def append(self, data, headers=None, validate=True):
        """
        Synonym for update

        :param data:
        :param headers:
        :return:
        """
        self.update(data, headers, validate)

    def created_response(self):
        """
        Generate a response body to go along with a 201 (Created)
        :return:
        """
        resp = {"status" : "created"}
        return self._add_identifiers(resp)

    def updated_response(self):
        """
        Generate a response body to go along with a 200 (OK) in the context of successful update
        :return:
        """
        resp = {"status" : "updated"}
        return self._add_identifiers(resp)

    def deleted_response(self):
        """
        Generate a response body to go along witha  200 (OK) in the context of a successful delete
        :return:
        """
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
        req = ApiRequest(pub.clean_record, account=account, validate=False)
        req.public_id = pub.id
        req.public_record = pub
        return req
