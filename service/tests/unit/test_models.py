from octopus.modules.es.testindex import ESTestCase

from octopus.lib import dataobj
from service.models import core, Request, PublicAPC
from service.models.core import RecordMethods
from service.tests.fixtures import RequestFixtureFactory, PublicAPCFixtureFactory

from copy import deepcopy

class TestModels(ESTestCase):
    def setUp(self):
        super(TestModels, self).setUp()

    def tearDown(self):
        super(TestModels, self).tearDown()

    def test_01_constructs(self):
        dataobj.construct_validate(core.CORE_STRUCT)
        dataobj.construct_validate(core.REQUEST_ADMIN_STRUCT)
        dataobj.construct_validate(core.PUBLIC_ADMIN_STRUCT)

    def test_02_request(self):
        # first make a blank one
        req = Request()

        # now make one around the fixture
        source = RequestFixtureFactory.example()
        req = Request(source)

        # make one with a broken source
        broken = {"whatever" : "broken"}
        with self.assertRaises(dataobj.DataStructureException):
            req = Request(broken)

        # now make one bit by bit
        req = Request()
        req.record = source.get("record")
        req.owner = "test1"
        req.action = "update"
        req.public_id = "abcdefg"

        assert req.owner == "test1"
        assert req.action == "update"
        assert req.public_id == "abcdefg"

        # now make it broken
        req = Request()
        with self.assertRaises(dataobj.DataStructureException):
            req.record = {"random" : "stuff"}

    def test_03_public(self):
        # first make a blank one
        pub = PublicAPC()

        # now make one around the fixture
        source = PublicAPCFixtureFactory.example()
        pub = PublicAPC(source)

        # make one with a broken source
        broken = {"whatever" : "broken"}
        with self.assertRaises(dataobj.DataStructureException):
            pub = PublicAPC(broken)

        # now make one bit by bit
        pub = PublicAPC()
        pub.record = source.get("record")
        pub.set_apc_ref("test1", "1111111111")

        apc_refs =  pub.get_apc_refs("test1")
        assert len(apc_refs) == 1
        assert apc_refs[0] == "1111111111"

        # now make it broken
        pub = PublicAPC()
        with self.assertRaises(dataobj.DataStructureException):
            pub.record = {"random" : "stuff"}

    def test_04_record_methods(self):
        classes = [Request, PublicAPC]
        source = RequestFixtureFactory.example()
        record = source.get("record")
        additional_apcs = deepcopy(record.get("jm:apc")) + deepcopy(record.get("jm:apc"))

        for c in classes:
            inst = c()
            assert isinstance(inst, RecordMethods)

            inst.record = deepcopy(record)

            assert inst.doi == "10.1234/me"
            assert inst.pmid == "87654321"
            assert inst.pmcid == "PMC1234"
            assert inst.url == "http://example.com/whatever"

            assert len(inst.apc_records) == 1

            inst.apc_records = additional_apcs
            assert len(inst.apc_records) == 2

            # now try adding and removing apc records
            withref = deepcopy(record.get("jm:apc")[0])
            withref["ref"] = "myref"
            inst.add_apc_record(withref)
            assert len(inst.apc_records) == 3

            inst.remove_apc_by_ref("myref")
            assert len(inst.apc_records) == 2
            for apc in inst.apc_records:
                assert "ref" not in apc

    def test_05_request_dao(self):
        dao = Request()

        source = RequestFixtureFactory.example()
        req = Request(source)
        req.owner = "test1"
        req.action = "update"
        req.public_id = "abcdefg"
        req.save()

        req2 = dao.pull(req.id)
        assert req2 is not None

    def test_06_public_dao(self):
        dao = PublicAPC()

        source = PublicAPCFixtureFactory.example()
        pub = PublicAPC(source)
        pub.set_apc_ref("test1", "1111111111")
        pub.save(blocking=True)

        # first try the straight-forward pull
        pub2 = dao.pull(pub.id)
        assert pub2 is not None

        # now do the successful queries
        res = dao.find_by_doi("10.1234/me")
        assert len(res) == 1

        res = dao.find_by_pmid("87654321")
        assert len(res) == 1

        res = dao.find_by_pmcid("PMC1234")
        assert len(res) == 1

        res = dao.find_by_url("http://example.com/whatever")
        assert len(res) == 1

        # now to check those queries don't always return, make sure we can get 0 results
        res = dao.find_by_doi("10.1234/whatever")
        assert len(res) == 0

        res = dao.find_by_pmid("88888888")
        assert len(res) == 0

        res = dao.find_by_pmcid("PMC1111")
        assert len(res) == 0

        res = dao.find_by_url("http://example.com/another")
        assert len(res) == 0

    def test_07_request2public(self):
        source = RequestFixtureFactory.example()
        req = Request(source)
        pub = req.make_public_apc()

        assert pub is not None
        assert pub.record is not None
        assert len(pub.apc_records) == 1

        setrefs = []
        for apc in pub.apc_records:
            assert apc.get("ref") is not None
            setrefs.append(apc.get("ref"))
        assert len(setrefs) == 1

        refs = pub.get_apc_refs(req.owner)
        assert len(refs) == 1
        assert refs[0] == setrefs[0]

    def test_08_public_apc_methods(self):
        pub = PublicAPC()

        assert len(pub.get_apc_refs("11111")) == 0

        pub.set_apc_ref("11111", "aaaaa")
        assert pub.get_apc_refs("11111")[0] == "aaaaa"

        pub.set_apc_ref("22222", "bbbbb")
        assert len(pub.get_apc_refs("22222")) == 1

        pub.remove_apc_refs("11111")
        assert len(pub.get_apc_refs("22222")) == 1
        assert len(pub.get_apc_refs("11111")) == 0

        assert "11111" not in pub.list_owners()
        assert "22222" in pub.list_owners()

        pub.remove_apc_refs("22222")

        assert len(pub.get_apcs_by_owner("11111")) == 0

        apc_record = PublicAPCFixtureFactory.apc_record()

        first = deepcopy(apc_record)
        first["ref"] = "aaaaa"
        pub.add_apc_for_owner("11111", first)

        assert len(pub.get_apc_refs("11111")) == 1
        assert pub.get_apc_refs("11111")[0] == "aaaaa"
        assert len(pub.get_apcs_by_owner("11111")) == 1
        assert pub.get_apcs_by_owner("11111")[0]["ref"] == "aaaaa"

        second = deepcopy(apc_record)
        second["ref"] = "bbbbb"
        pub.add_apc_for_owner("22222", second)

        assert len(pub.get_apc_refs("22222")) == 1
        assert pub.get_apc_refs("22222")[0] == "bbbbb"
        assert len(pub.get_apcs_by_owner("22222")) == 1
        assert pub.get_apcs_by_owner("22222")[0]["ref"] == "bbbbb"

        assert len(pub.apc_records) == 2

        pub.remove_apcs_by_owner("11111")
        assert len(pub.apc_records) == 1
        assert pub.apc_records[0]["ref"] == "bbbbb"
        assert len(pub.get_apc_refs("22222")) == 1
        assert pub.get_apc_refs("22222")[0] == "bbbbb"
        assert len(pub.get_apcs_by_owner("22222")) == 1
        assert pub.get_apcs_by_owner("22222")[0]["ref"] == "bbbbb"

        pub.remove_apcs_by_owner("22222")
        assert len(pub.apc_records) == 0
        assert len(pub.get_apc_refs("11111")) == 0
        assert len(pub.get_apc_refs("22222")) == 0
