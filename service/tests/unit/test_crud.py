from octopus.modules.es.testindex import ESTestCase
from octopus.lib import dataobj

from service.tests.fixtures import RequestFixtureFactory, PublicAPCFixtureFactory
from service.models.crud import ApiRequest
from service.models import MonitorUKAccount, PublicAPC, Request

from copy import deepcopy
import time

class TestModels(ESTestCase):
    def setUp(self):
        super(TestModels, self).setUp()

    def tearDown(self):
        super(TestModels, self).tearDown()

    def test_01_create(self):
        # construct a blank one, just to make sure we can
        req = ApiRequest()
        assert req.raw is None
        assert req.account is None
        assert req.json() is None

        # make one using valid source data
        source = RequestFixtureFactory.record()
        acc = MonitorUKAccount()
        acc.save()

        req = ApiRequest(source, account=acc)
        assert req.raw == source
        assert req.account.id == acc.id
        assert isinstance(req.json(), basestring)

        # make one with some invalid data
        with self.assertRaises(dataobj.DataStructureException):
            req = ApiRequest({"whatever" : "here"}, account=acc)

    def test_02_update(self):
        source = RequestFixtureFactory.record()
        acc = MonitorUKAccount()
        acc.save()

        # do an update on blank one (unlikely use case)
        req = ApiRequest()
        req.update(source)
        assert req.raw == source
        assert req.account is None
        assert isinstance(req.json(), basestring)

        # make one, and then update it
        source2 = deepcopy(source)
        source2["dc:title"] = "An update"
        req = ApiRequest(source, account=acc)
        req.update(source2)
        assert req.raw == source2
        assert req.account.id == acc.id
        assert isinstance(req.json(), basestring)

        # make a valid one, and then do something invalid to it
        req = ApiRequest(source, account=acc)
        with self.assertRaises(dataobj.DataStructureException):
            req.update({"whatever" : "here"})

    def test_03_pull_by_doi(self):
        acc = MonitorUKAccount()
        acc.id = "abcdefghij"
        acc.save(blocking=True)

        # first make a request which contains that doi, and check that a pull on it returns that request object
        req_source = RequestFixtureFactory.example()
        req = Request(req_source)
        req.save(blocking=True)

        result = ApiRequest.pull("10.1234/me", account=acc)
        assert result.raw == req_source.get("record")
        assert result.account.id == acc.id
        assert result.public_id is None
        assert result.request_id == req.id

        # also try the pull with the wrong owner
        acc2 = MonitorUKAccount()
        acc2.id = "incorrect"
        result = ApiRequest.pull("10.1234/me", account=acc2)
        assert result is None

        # now make a competing public version, and check that a pull on the doi prefers the public version instead
        pub_source = PublicAPCFixtureFactory.example()
        pub = PublicAPC(pub_source)
        pub.save(blocking=True)

        result = ApiRequest.pull("10.1234/me", account=acc)
        assert result.raw == pub.clean_record
        assert result.account.id == acc.id
        assert result.public_id == req.id
        assert result.request_id is None

        # also try the pull with the wrong owner, which should work this time (because the record is public)
        result = ApiRequest.pull("10.1234/me", account=acc2)
        assert result is not None

    def test_04_pull_by_identifiers(self):
        acc = MonitorUKAccount()
        acc.id = "abcdefghij"
        acc.save(blocking=True)

        req_source = RequestFixtureFactory.example()
        del req_source["id"]
        req = Request(req_source)
        req.save(blocking=True)

        pub_source = PublicAPCFixtureFactory.example()
        del pub_source["id"]
        pub = PublicAPC(pub_source)
        pub.save(blocking=True)

        result = ApiRequest.pull(req.id, account=acc)
        assert result.raw == req_source.get("record")
        assert result.account.id == acc.id
        assert result.public_id is None
        assert result.request_id == req.id

        # also try the pull with the wrong owner
        acc2 = MonitorUKAccount()
        acc2.id = "incorrect"
        result = ApiRequest.pull(req.id, account=acc2)
        assert result is None

        result = ApiRequest.pull(pub.id, account=acc)
        assert result.raw == pub.clean_record
        assert result.account.id == acc.id
        assert result.public_id == pub.id
        assert result.request_id is None

        # also try the pull with the wrong owner, which should work this time (because the record is public)
        result = ApiRequest.pull(pub.id, account=acc2)
        assert result is not None

    def test_05_pull_then_update(self):
        acc = MonitorUKAccount()
        acc.id = "abcdefghij"
        acc.save(blocking=True)

        req_source = RequestFixtureFactory.example()
        del req_source["id"]
        req = Request(req_source)
        req.save(blocking=True)

        pub_source = PublicAPCFixtureFactory.example()
        del pub_source["id"]
        pub = PublicAPC(pub_source)
        pub.save(blocking=True)

        req_source2 = deepcopy(req_source.get("record"))
        req_source2["dc:title"] = "An update"
        result = ApiRequest.pull(req.id, account=acc)
        result.update(req_source2)
        assert result.raw == req_source2
        assert result.account.id == acc.id

        pub_source2 = deepcopy(pub_source.get("record"))
        pub_source2["dc:title"] = "An update"
        result = ApiRequest.pull(pub.id, account=acc)
        result.update(pub_source2)
        assert result.raw == pub_source2
        assert result.account.id == acc.id

    def test_06_get_id(self):
        acc = MonitorUKAccount()
        acc.id = "abcdefghij"
        source = RequestFixtureFactory.record()

        # first, provide a record which has a doi, and ensure that's the id we get back
        req = ApiRequest(source, account=acc)
        assert req.id == "10.1234/me"

        req_source = RequestFixtureFactory.example()
        del req_source["id"]
        del req_source["record"]["dc:identifier"]
        req = Request(req_source)
        req.save(blocking=True)

        pub_source = PublicAPCFixtureFactory.example()
        del pub_source["id"]
        del pub_source["record"]["dc:identifier"]
        pub = PublicAPC(pub_source)
        pub.save(blocking=True)

        result = ApiRequest.pull(req.id, account=acc)
        assert result.id == req.id
        assert result.id == result.request_id

        result = ApiRequest.pull(pub.id, account=acc)
        assert result.id == pub.id
        assert result.id == result.public_id

    def test_07_save_delete(self):
        source = RequestFixtureFactory.record()
        acc = MonitorUKAccount()
        acc.save(blocking=True)

        req = ApiRequest(source, account=acc)
        req.save()

        dao = Request()
        req2 = dao.pull(req.request.id)
        assert req2 is not None
        assert req2.owner == acc.id
        assert req2.record == source
        assert req2.action == "update"

        # now pull the same request and update it
        source2 = deepcopy(source)
        source2["dc:title"] = "An update"
        next = ApiRequest.pull(req2.id, account=acc)
        next.update(source2)
        next.save()

        # now, at this point we should have 2 request objects in the index.  One for the
        # original save, and one for the new save
        req3 = dao.pull(next.request.id)
        assert req3 is not None
        assert req3.owner == acc.id
        assert req3.record == source2
        assert req3.action == "update"

        # now pull this second request and issue a delete on it
        final = ApiRequest.pull(req3.id, account=acc)
        final.delete()

        # by now we should have 3 request objects in the index, 2 for the above updates
        # and one for the delete request
        req4 = dao.pull(final.request.id)
        assert req4 is not None
        assert req4.owner == acc.id
        assert req4.record == source2
        assert req4.action == "delete"
