from octopus.modules.es.testindex import ESTestCase
from octopus.modules.account.models import BasicAccount

from service.api import RequestApi, PublicApi
from service.models import Request, PublicAPC
from service.tests.fixtures import RequestFixtureFactory, PublicAPCFixtureFactory

from copy import deepcopy

class TestModels(ESTestCase):
    def setUp(self):
        super(TestModels, self).setUp()

    def tearDown(self):
        super(TestModels, self).tearDown()

    def test_01_request_update(self):
        record = RequestFixtureFactory.record()

        acc = BasicAccount()
        acc.id = "test1"

        # without a public id
        r1 = RequestApi.update(record, acc)

        # with a public id
        r2 = RequestApi.update(record, acc, "01010101")

        # now check they were saved correctly
        assert r1 is not None
        assert r2 is not None

        r11 = r1.pull(r1.id)
        assert r11 is not None

        r21 = r2.pull(r2.id)
        assert r21 is not None

    def test_01_request_delete(self):
        record = RequestFixtureFactory.record()

        acc = BasicAccount()
        acc.id = "test1"

        r = RequestApi.delete(record, acc, "01010101")

        # now check it was saved correctly
        assert r is not None

        r1 = r.pull(r.id)
        assert r1 is not None

    def test_02_find_public_record(self):
        source = PublicAPCFixtureFactory.example()
        pub = PublicAPC(source)
        pub.save(blocking=True)

        # document to form the basis of the queries
        source2 = RequestFixtureFactory.example()

        # create sources with one of each kind of identifier
        pid = deepcopy(source2)
        del pid["record"]["dc:identifier"]
        req = Request(pid)
        req.public_id = pub.id
        pub1 = PublicApi.find_public_record(req)
        assert pub1 is not None

        doi = deepcopy(source2)
        doi["record"]["dc:identifier"] = [{"type" : "doi", "id" : "10.1234/me"}]
        req = Request(doi)
        pub1 = PublicApi.find_public_record(req)
        assert pub1 is not None

        pmid = deepcopy(source2)
        pmid["record"]["dc:identifier"] = [{"type" : "pmid", "id" : "87654321"}]
        req = Request(pmid)
        pub1 = PublicApi.find_public_record(req)
        assert pub1 is not None

        pmcid = deepcopy(source2)
        pmcid["record"]["dc:identifier"] = [{"type" : "pmcid", "id" : "PMC1234"}]
        req = Request(pmcid)
        pub1 = PublicApi.find_public_record(req)
        assert pub1 is not None

        url = deepcopy(source2)
        url["record"]["dc:identifier"] = [{"type" : "url", "id" : "http://example.com/whatever"}]
        req = Request(url)
        pub1 = PublicApi.find_public_record(req)
        assert pub1 is not None

        # finally, ensure that you don't get a match when you shouldn't
        null = deepcopy(source2)
        null["record"]["dc:identifier"] = [{"type" : "doi", "id" : "10.1234/another"}]
        req = Request(null)
        pub1 = PublicApi.find_public_record(req)
        assert pub1 is None

    def test_03_publish_new(self):
        source = RequestFixtureFactory.example()
        req = Request(source)
        pub = PublicApi.publish(req)

        dao = PublicAPC()
        pub2 = dao.pull(pub.id)
        assert pub2 is not None

    def test_04_merge_records(self):
        source_source = PublicAPCFixtureFactory.example()
        target_source = PublicAPCFixtureFactory.example()

        # first try a merge with no apc records (this shouldn't ever happen in normal operation)
        ss1 = deepcopy(source_source)
        del ss1["record"]["jm:apc"]
        source1 = PublicAPC(ss1)

        ts1 = deepcopy(target_source)
        del ts1["record"]["jm:apc"]
        target1 = PublicAPC(ts1)

        result = PublicApi.merge_records(source1, target1)
        assert len(result.apc_records) == 0

        # next try a merge with only apc records in the source (again, shouldn't really happen in real life)
        ss2 = deepcopy(source_source)
        source2 = PublicAPC(ss2)

        ts2 = deepcopy(target_source)
        del ts2["record"]["jm:apc"]
        target2 = PublicAPC(ts2)

        result = PublicApi.merge_records(source2, target2)
        assert len(result.apc_records) == 1

        # next try a merge with only apc records in the target (also shouldn't happen in real life)
        ss3 = deepcopy(source_source)
        source3 = PublicAPC(ss3)

        ts3 = deepcopy(target_source)
        del ts3["record"]["jm:apc"]
        target3 = PublicAPC(ts3)

        result = PublicApi.merge_records(source3, target3)
        assert len(result.apc_records) == 1

        # finally try a merge with the following criteria:
        # replacements apcs and new apcs in the source record
        # existing apcs and other apcs in the target record
        apc_record = PublicAPCFixtureFactory.apc_record()

        first = deepcopy(apc_record)
        first["ref"] = "aaaaa"
        second = deepcopy(apc_record)
        second["ref"] = "bbbbb"
        ss4 = deepcopy(source_source)
        del ss4["record"]["jm:apc"]
        source4 = PublicAPC(ss4)
        source4.add_apc_for_owner("11111", first)
        source4.add_apc_for_owner("11111", second)

        third = deepcopy(apc_record)
        third["ref"] = "ccccc"
        fourth = deepcopy(apc_record)
        fourth["ref"] = "ddddd"
        ts4 = deepcopy(target_source)
        del ts4["record"]["jm:apc"]
        target4 = PublicAPC(ts4)
        target4.add_apc_for_owner("11111", third)
        target4.add_apc_for_owner("22222", fourth)

        result = PublicApi.merge_records(source4, target4)
        assert len(result.apc_records) == 3

        ones = result.get_apcs_by_owner("11111")
        assert len(ones) == 2
        refs = [o.get("ref") for o in ones]
        assert "aaaaa" in refs
        assert "bbbbb" in refs
        assert "ccccc" not in refs
        assert "ddddd" not in refs

        twos = result.get_apcs_by_owner("22222")
        assert len(twos) == 1
        refs = [o.get("ref") for o in twos]
        assert "aaaaa" not in refs
        assert "bbbbb" not in refs
        assert "ccccc" not in refs
        assert "ddddd" in refs

    def test_05_enhance_metadata(self):
        merge_source = PublicAPCFixtureFactory.record_merge_source()
        merge_target = PublicAPCFixtureFactory.record_merge_target()
        result = PublicAPCFixtureFactory.record_merge_result()

        source = PublicAPC()
        source.record = merge_source
        source.set_apc_ref("22222", "bbbbb")

        target = PublicAPC()
        target.record = merge_target
        target.set_apc_ref("11111", "aaaaa")

        PublicApi.enhance_metadata(source, target)

        assert target.record == result
        assert target.get_apc_refs("11111") == ["aaaaa"]
        assert target.get_apc_refs("22222") == []

    def test_06_publish_update(self):
        merge_source = PublicAPCFixtureFactory.record_merge_source()
        merge_target = PublicAPCFixtureFactory.record_merge_target()
        apc_record = PublicAPCFixtureFactory.apc_record()
        result = PublicAPCFixtureFactory.record_merge_result()

        del merge_source["jm:apc"]
        del merge_target["jm:apc"]
        del result["jm:apc"]

        first = deepcopy(apc_record)
        second = deepcopy(apc_record)
        third = deepcopy(apc_record)

        first["organisation_name"] = "First"
        del first["ref"]
        second["organisation_name"] = "Second"
        del second["ref"]
        third["organisation_name"] = "Third"
        del third["ref"]

        req = Request()
        req.record = merge_source
        req.add_apc_record(first)
        req.owner = "11111"

        pub = PublicAPC()
        pub.record = merge_target
        pub.add_apc_for_owner("22222", second)
        pub.add_apc_for_owner("11111", third)
        pub.save(blocking=True)

        PublicApi.publish(req)

        dao = PublicAPC()
        pub2 = dao.pull(pub.id)

        # first check that the apcs are as we would expect
        one = pub2.get_apcs_by_owner("11111")
        two = pub2.get_apcs_by_owner("22222")

        assert len(one) == 1
        assert len(two) == 1
        assert one[0]["organisation_name"] == "First"
        assert two[0]["organisation_name"] == "Second"

        # now check that the metadata merge proceeded correctly
        record = pub2.record
        del record["jm:apc"]
        assert record == result


