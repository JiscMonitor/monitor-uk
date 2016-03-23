from octopus.modules.es.testindex import ESTestCase

from octopus.lib import dataobj, dictmerge
from service.models import core, Request, PublicAPC, ModelException
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
        dictmerge.validate_rules(core.RECORD_MERGE_RULES)

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

            assert inst.has_apcs() is True
            inst.apc_records = []
            assert inst.has_apcs() is False

    def test_05_request_dao(self):
        dao = Request()

        source = RequestFixtureFactory.example()
        req = Request(source)
        req.owner = "test1"
        req.action = "update"
        req.public_id = "abcdefg"
        req.save(blocking=True)

        req2 = dao.pull(req.id)
        assert req2 is not None

        # check successful queries for identifiers
        res = dao.find_by_identifier("doi", "10.1234/me", "test1")
        assert len(res) == 1

        res = dao.find_by_identifier("pmcid", "PMC1234", "test1")
        assert len(res) == 1

        res = dao.find_by_identifier("pmid", "87654321", "test1")
        assert len(res) == 1

        res = dao.find_by_identifier("url", "http://example.com/whatever", "test1")
        assert len(res) == 1

        # check unsuccessful ones
        res = dao.find_by_identifier("doi", "10.1234/you", "test1")
        assert len(res) == 0

        res = dao.find_by_identifier("pmcid", "PMC5678", "test1")
        assert len(res) == 0

        res = dao.find_by_identifier("pmid", "123456789", "test1")
        assert len(res) == 0

        res = dao.find_by_identifier("url", "http://example.com/this", "test1")
        assert len(res) == 0

        # and check using the wrong owner
        res = dao.find_by_identifier("doi", "10.1234/me", "test2")
        assert len(res) == 0

        res = dao.find_by_identifier("pmcid", "PMC1234", "test2")
        assert len(res) == 0

        res = dao.find_by_identifier("pmid", "87654321", "test2")
        assert len(res) == 0

        res = dao.find_by_identifier("url", "http://example.com/whatever", "test2")
        assert len(res) == 0

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

    def test_09_merge_records(self):
        merge_source = PublicAPCFixtureFactory.record_merge_source()
        merge_target = PublicAPCFixtureFactory.record_merge_target()
        result = PublicAPCFixtureFactory.record_merge_result()

        source = PublicAPC()
        source.record = merge_source
        source.set_apc_ref("22222", "bbbbb")

        target = PublicAPC()
        target.record = merge_target
        target.set_apc_ref("11111", "aaaaa")

        target.merge_records(source)

        assert target.record == result
        assert target.get_apc_refs("11111") == ["aaaaa"]
        assert target.get_apc_refs("22222") == []

        # now just try some basic error cases
        with self.assertRaises(ModelException):
            target.merge_records({"random" : "data"})

    def test_10_request_refs(self):
        # first check that refs are stripped automatically on construction
        source = RequestFixtureFactory.example()
        source["record"]["jm:apc"][0]["ref"] = "1234567890"
        req = Request(source)
        assert "ref" not in req.apc_records[0]

        # now do it again, setting the record explicitly
        source = RequestFixtureFactory.example()
        record = source.get("record")
        record["jm:apc"][0]["ref"] = "123456789"
        req = Request()
        req.record = record
        assert "ref" not in req.apc_records[0]

    def test_11_public_refs(self):
        source = PublicAPCFixtureFactory.example()
        pub = PublicAPC(source)

        assert pub.record.get("jm:apc")[0]["ref"] == "1111111111"
        assert "ref" not in pub.clean_record.get("jm:apc")[0]