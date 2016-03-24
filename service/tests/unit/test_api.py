from octopus.modules.es.testindex import ESTestCase
from octopus.modules.account.models import BasicAccount

from service.api import RequestApi, PublicApi, WorkflowApi
from service.models import Request, PublicAPC, WorkflowState
from service.tests.fixtures import RequestFixtureFactory, PublicAPCFixtureFactory

from copy import deepcopy
import time

################################################
## mocks

class TestException(Exception):
    pass

PUBLISH_COUNTER = 0

@classmethod
def publish_mock(cls, *args, **kwargs):
    global PUBLISH_COUNTER
    PUBLISH_COUNTER += 1
    if PUBLISH_COUNTER > 5:
        raise TestException()

DELETE_COUNTER = 0

@classmethod
def delete_mock(cls, *args, **kwargs):
    global DELETE_COUNTER
    DELETE_COUNTER += 1
    if DELETE_COUNTER > 5:
        raise TestException()

################################################

class TestModels(ESTestCase):
    def setUp(self):
        self.old_publish = PublicApi.publish
        self.old_remove = PublicApi.remove
        super(TestModels, self).setUp()

    def tearDown(self):
        PublicApi.publish = self.old_publish
        PublicApi.remove = self.old_remove
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
        assert r1.owner == acc.id
        assert r1.action == "delete"
        assert r1.public_id == "01010101"

    def test_02_find_public_record(self):
        source = PublicAPCFixtureFactory.example()
        pub = PublicAPC(source)
        pub.save(blocking=True)

        # document to form the basis of the queries
        source2 = RequestFixtureFactory.example()

        # create sources with one of each kind of identifier, then look them up using the
        # find_public_record and find_public_record_by_identifier methods
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
        pub11 = PublicApi.find_public_record_by_identifier("doi", "10.1234/me")
        assert pub11 is not None

        pmid = deepcopy(source2)
        pmid["record"]["dc:identifier"] = [{"type" : "pmid", "id" : "87654321"}]
        req = Request(pmid)
        pub1 = PublicApi.find_public_record(req)
        assert pub1 is not None
        pub11 = PublicApi.find_public_record_by_identifier("pmid", "87654321")
        assert pub11 is not None

        pmcid = deepcopy(source2)
        pmcid["record"]["dc:identifier"] = [{"type" : "pmcid", "id" : "PMC1234"}]
        req = Request(pmcid)
        pub1 = PublicApi.find_public_record(req)
        assert pub1 is not None
        pub11 = PublicApi.find_public_record_by_identifier("pmcid", "PMC1234")
        assert pub11 is not None

        url = deepcopy(source2)
        url["record"]["dc:identifier"] = [{"type" : "url", "id" : "http://example.com/whatever"}]
        req = Request(url)
        pub1 = PublicApi.find_public_record(req)
        assert pub1 is not None
        pub11 = PublicApi.find_public_record_by_identifier("url", "http://example.com/whatever")
        assert pub11 is not None

        # finally, ensure that you don't get a match when you shouldn't
        null = deepcopy(source2)
        null["record"]["dc:identifier"] = [{"type" : "doi", "id" : "10.1234/another"}]
        req = Request(null)
        pub1 = PublicApi.find_public_record(req)
        assert pub1 is None
        pub11 = PublicApi.find_public_record_by_identifier("doi", "10.1234/another")
        assert pub11 is None

    def test_03_publish_new(self):
        source = RequestFixtureFactory.example()
        req = Request(source)
        pub = PublicApi.publish(req)

        dao = PublicAPC()
        pub2 = dao.pull(pub.id)
        assert pub2 is not None

    def test_04_merge_public_apcs(self):
        source_source = PublicAPCFixtureFactory.example()
        target_source = PublicAPCFixtureFactory.example()

        # first try a merge with no apc records (this shouldn't ever happen in normal operation)
        ss1 = deepcopy(source_source)
        del ss1["record"]["jm:apc"]
        source1 = PublicAPC(ss1)

        ts1 = deepcopy(target_source)
        del ts1["record"]["jm:apc"]
        target1 = PublicAPC(ts1)

        result = PublicApi.merge_public_apcs(source1, target1)
        assert len(result.apc_records) == 0

        # next try a merge with only apc records in the source (again, shouldn't really happen in real life)
        ss2 = deepcopy(source_source)
        source2 = PublicAPC(ss2)

        ts2 = deepcopy(target_source)
        del ts2["record"]["jm:apc"]
        target2 = PublicAPC(ts2)

        result = PublicApi.merge_public_apcs(source2, target2)
        assert len(result.apc_records) == 1

        # next try a merge with only apc records in the target (also shouldn't happen in real life)
        ss3 = deepcopy(source_source)
        source3 = PublicAPC(ss3)

        ts3 = deepcopy(target_source)
        del ts3["record"]["jm:apc"]
        target3 = PublicAPC(ts3)

        result = PublicApi.merge_public_apcs(source3, target3)
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

        result = PublicApi.merge_public_apcs(source4, target4)
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

    def test_07_separate_records(self):
        apc_record = PublicAPCFixtureFactory.apc_record()

        req = Request()
        req.owner = "test"

        pub = PublicAPC()
        pub.add_apc_for_owner("test", apc_record)
        pub.add_apc_for_owner("test", apc_record)

        assert len(pub.apc_records) == 2

        PublicApi.separate_records(req, pub)

        assert not pub.has_apcs()

    def test_08_remove_separate(self):
        source = RequestFixtureFactory.example()
        req = Request(source)
        req.owner = "test"

        # create a record with 2 distinct apcs from different owners
        source2 = PublicAPCFixtureFactory.example()
        apc_record = PublicAPCFixtureFactory.apc_record()
        del apc_record["ref"]   # do this so that the ref gets created correctly later
        pub = PublicAPC(source2)
        pub.add_apc_for_owner("test", apc_record)
        pub.save(blocking=True)

        # now request the removal
        PublicApi.remove(req)
        time.sleep(2)

        dao = PublicAPC()
        pub2 = dao.pull(pub.id)

        assert len(pub2.get_apcs_by_owner("test")) == 0
        assert len(pub2.get_apcs_by_owner("abcdefg")) == 1

    def test_09_remove_permanent(self):
        source = RequestFixtureFactory.example()
        req = Request(source)
        req.owner = "test"

        # create a record with 2 distinct apcs from different owners
        source2 = PublicAPCFixtureFactory.example()
        pub = PublicAPC(source2)
        pub.remove_apcs_by_owner("abcdefg")     # clear the existing apc record

        apc_record = PublicAPCFixtureFactory.apc_record()
        del apc_record["ref"]   # do this so that the ref gets created correctly later
        pub.add_apc_for_owner("test", apc_record)   # add a new, known one

        pub.save(blocking=True)

        # now request the removal
        PublicApi.remove(req)
        time.sleep(2)

        dao = PublicAPC()
        pub2 = dao.pull(pub.id)
        assert pub2 is None

    def test_10_find_request(self):
        source = RequestFixtureFactory.example()
        req = Request(source)
        req.save(blocking=True)

        time.sleep(2)

        source = RequestFixtureFactory.example()
        req1 = Request(source)
        req1.save(blocking=True)

        # document to form the basis of the queries
        source2 = RequestFixtureFactory.example()

        # create sources with one of each kind of identifier, then look them up using the
        # find_request_by_identifier method
        result = RequestApi.find_request_by_identifier("doi", "10.1234/me", "abcdefghij")
        assert result is not None
        assert result.created_date == req1.created_date

        result = RequestApi.find_request_by_identifier("pmid", "87654321", "abcdefghij")
        assert result is not None
        assert result.created_date == req1.created_date

        result = RequestApi.find_request_by_identifier("pmcid", "PMC1234", "abcdefghij")
        assert result is not None
        assert result.created_date == req1.created_date

        result = RequestApi.find_request_by_identifier("url", "http://example.com/whatever", "abcdefghij")
        assert result is not None
        assert result.created_date == req1.created_date

        # finally, ensure that you don't get a match when you shouldn't
        result = RequestApi.find_request_by_identifier("doi", "10.1234/another", "abcdefghij")
        assert result is None

        result = RequestApi.find_request_by_identifier("doi", "10.1234/me", "test")
        assert result is None

    def test_11_process_requests_cycle(self):
        source = RequestFixtureFactory.example()
        if "id" in source:
            del source["id"]

        pub_dao = PublicAPC()
        wfs_dao = WorkflowState()

        # first make a record for the first time
        first = deepcopy(source)
        del first["record"]["dc:title"]
        req = Request(first)
        req.owner = "test"
        req.action = "update"
        req.save(blocking=True)

        # run the job
        WorkflowApi.process_requests()

        time.sleep(2)

        # first check that a public record was made
        pubs = pub_dao.find_by_doi("10.1234/me")
        assert len(pubs) == 1
        assert pubs[0].record.get("dc:title") is None

        # check that the workflow state was created
        wfs = wfs_dao.pull("state")
        assert wfs is not None
        assert wfs.last_request == req.created_date
        assert wfs.already_processed == [req.id]

        # now run an update with a different date
        second = deepcopy(source)
        second["record"]["dc:title"] = "Update"
        second["created_date"] = "2002-01-01T00:00:00Z"
        req2 = Request(second)
        req2.owner = "test"
        req2.action = "update"
        req2.save(blocking=True)

        # run the job again
        WorkflowApi.process_requests()

        time.sleep(2)

        # check the public record was updated
        pubs = pub_dao.find_by_doi("10.1234/me")
        assert len(pubs) == 1
        assert pubs[0].record.get("dc:title") == "Update"

        # check that the workflow state was updated
        wfs = wfs_dao.pull("state")
        assert wfs is not None
        assert wfs.last_request == req2.created_date
        assert wfs.already_processed == [req2.id]

        # now run an update with the same date, to observe the difference in the workflow state
        third = deepcopy(source)
        third["record"]["dc:title"] = "Update 2"
        third["created_date"] = "2002-01-01T00:00:00Z"
        req3 = Request(third)
        req3.owner = "test"
        req3.action = "update"
        req3.save(blocking=True)

        # run the job again
        WorkflowApi.process_requests()

        time.sleep(2)

        # check the public record was updated
        pubs = pub_dao.find_by_doi("10.1234/me")
        assert len(pubs) == 1
        assert pubs[0].record.get("dc:title") == "Update 2"   # should have been updated, as there are only apc contributions from one source

        # check that the workflow state was updated
        wfs = wfs_dao.pull("state")
        assert wfs is not None
        assert wfs.last_request == req3.created_date
        assert wfs.already_processed == [req2.id, req3.id]  # processed records should have been appended

        # finally issue a delete request
        fourth = deepcopy(source)
        fourth["created_date"] = "2003-01-01T00:00:00Z"
        req4 = Request(fourth)
        req4.owner = "test"
        req4.action = "delete"
        req4.save(blocking=True)

        # run the job again
        WorkflowApi.process_requests()

        time.sleep(2)

        # check the public record was updated
        pubs = pub_dao.find_by_doi("10.1234/me")
        assert len(pubs) == 0

        # check that the workflow state was updated
        wfs = wfs_dao.pull("state")
        assert wfs is not None
        assert wfs.last_request == req4.created_date
        assert wfs.already_processed == [req4.id]  # processed records should have been appended


    def test_11_process_requests_exception(self):
        sources = RequestFixtureFactory.request_per_day("2001-01", 9)

        dois = ["10.1234/first", "10.1234/second", "10.1234/third"]

        # we're going to construct a series of requests for each doi
        # starting with a create, then an update, followed by a delete
        # (not that it matters, as we're going to pump them through a mock)
        for i in range(len(sources)):
            s = sources[i]
            doi_idx = (i % 3)   # iterate over the dois 3 times
            doi = dois[doi_idx]
            s["record"]["dc:identifier"] = [{"type" : "doi", "id" : doi}]
            if i < 3:
                s["record"]["dc:title"] = "Create"
                req = Request(s)
                req.action = "update"
                req.save()
            elif i < 6:
                s["record"]["dc:title"] = "Update"
                req = Request(s)
                req.action = "update"
                req.save()
            else:
                s["record"]["dc:title"] = "Delete"
                req = Request(s)
                req.action = "delete"
                req.save()

        time.sleep(2)

        # set up the mocks
        PublicApi.publish = publish_mock
        PublicApi.remove = delete_mock

        # now run the process job back to the first day
        with self.assertRaises(TestException):
            WorkflowApi.process_requests()

        # we know this died during the 6th update request being processed,
        # so just check that the workflow state reflects that
        wfs_dao = WorkflowState()
        wfs = wfs_dao.pull("state")
        assert wfs.last_request == "2001-01-05T00:00:00Z"
        assert len(wfs.already_processed) == 1




