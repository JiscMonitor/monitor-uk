from octopus.modules.es.testindex import ESTestCase

from octopus.lib import dataobj, dictmerge
from service.models import core, Request, PublicAPC, ModelException, WorkflowState, MonitorUKAccount
from service.models.core import RecordMethods
from service.tests.fixtures import RequestFixtureFactory, PublicAPCFixtureFactory, WorkflowStateFixtureFactory

from copy import deepcopy
import time

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

    def test_12_workflow_state(self):
        # make a blank one just in case we need to
        wfs = WorkflowState()

        # now make one from source
        source = WorkflowStateFixtureFactory.example()
        wfs = WorkflowState(source)

        assert wfs.last_request == "2003-01-01T00:00:00Z"
        assert wfs.already_processed == ["123456789", "987654321"]

        # now hit the setters, and check the round-trip
        wfs.last_request = "2004-01-01T00:00:00Z"
        wfs.already_processed = ["abcdefg"]

        assert wfs.last_request == "2004-01-01T00:00:00Z"
        assert wfs.already_processed == ["abcdefg"]

        wfs.add_processed("qwerty")

        assert wfs.already_processed == ["abcdefg", "qwerty"]
        assert wfs.is_processed("qwerty")
        assert wfs.is_processed("abcdefg")
        assert not wfs.is_processed("random")

        # now make one with broken content
        with self.assertRaises(dataobj.DataStructureException):
            wfs = WorkflowState({"junk" : "data"})

    def test_13_request_iterator(self):
        sources = RequestFixtureFactory.request_per_day("2001-01", 10)

        for s in sources:
            req = Request(s)
            req.save()

        time.sleep(2)

        dao = Request()
        gen = dao.list_all_since("2001-01-01T00:00:00Z", page_size=5)   # set the page size small, to ensure the iterator has to work
        results = [x for x in gen]

        assert len(results) == 10

        dates = [r.created_date for r in results]
        comp = deepcopy(dates)
        comp.sort()     # this puts the dates in ascending order (i.e. oldest first)

        # the point of this comparison is to show that the results came out in the right order.
        # that is, oldest first
        assert dates == comp

    def test_14_copy_overwrite(self):
        source = PublicAPCFixtureFactory.example()
        pub = PublicAPC(source)

        pub2 = pub.copy()

        assert pub2.record == pub.record
        assert pub2.admin == pub.admin
        assert pub2.id == pub.id

        source3 = PublicAPCFixtureFactory.example()
        source3["record"]["dc:title"] = "Overwrite"
        pub3 = PublicAPC(source3)

        pub2.overwrite(pub3)

        assert pub2.record == pub3.record
        assert pub2.admin == pub3.admin
        assert pub2.id == pub3.id

    def test_15_public_indexing(self):
        source = PublicAPCFixtureFactory.example()
        pub = PublicAPC(source)

        apc_record1 = PublicAPCFixtureFactory.apc_record()
        apc_record2 = PublicAPCFixtureFactory.apc_record()

        del apc_record1["amount_inc_vat_gbp"]
        apc_record1["amount_ex_vat_gbp"] = 1000
        apc_record1["vat_gbp"] = 200
        apc_record1["additional_costs"] = 100

        apc_record2["amount_inc_vat_gbp"] = 2400
        apc_record2["amount_ex_vat_gbp"] = 2000
        apc_record2["vat_gbp"] = 400
        apc_record2["additional_costs"] = 200

        pub.apc_records = [apc_record1, apc_record2]
        pub.prep()

        # first check that the amount_inc_vat_gbp was calculated or kept
        assert pub.apc_records[0]["amount_inc_vat_gbp"] == 1200

        # now check all the indexed amounts add up
        assert pub.data.get("index", {}).get("additional_costs") == 300
        assert pub.data.get("index", {}).get("vat") == 600
        assert pub.data.get("index", {}).get("amount_ex_vat") == 3000
        assert pub.data.get("index", {}).get("amount_inc_vat") == 3600
        assert pub.data.get("index", {}).get("grand_total") == 3900

    def test_16_lantern_accounts(self):
        acc1 = MonitorUKAccount()
        acc1.email = "one@example.com"
        acc1.save()

        acc2 = MonitorUKAccount()
        acc2.email = "two@example.com"
        acc2.lantern_api_key = "123456789"
        acc2.save()

        acc3 = MonitorUKAccount()
        acc3.email = "three@example.com"
        acc3.lantern_api_key = "987654321"
        acc3.save(blocking=True)

        count = 0
        gen = MonitorUKAccount.list_lantern_enabled()
        for acc in gen:
            if acc.email == "two@example.com":
                assert acc.lantern_api_key == "123456789"
                count += 1
            elif acc.email == "three@example.com":
                assert acc.lantern_api_key == "987654321"
                count += 10
            else:
                count += 100
        assert count == 11





