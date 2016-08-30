"""
Unit tests for Lantern components
"""

from octopus.modules.es.testindex import ESTestCase
from octopus.modules.lantern import client
from octopus.lib import dates

from service.lantern import LanternApi
from service.models import PublicAPC, MonitorUKAccount, LanternJob, Enhancement

from service.tests.fixtures import PublicAPCFixtureFactory, LanternFixtureFactory

from copy import deepcopy
import time

################################################
## mocks

CREATED_JOBS = []

QUOTA = 5000

PROGRESS_REQUESTS = []

RESULTS_REQUESTS = []

class LanternMock(object):
    def __init__(self, *args, **kwargs):
        pass

    def create_job(self, email, filename, ident_objects):
        global CREATED_JOBS
        CREATED_JOBS.append({
            "email" : email,
            "filename" : filename,
            "list" : ident_objects
        })
        return {
            "status" : "success",
            "data" : {
                "job" : "abcdefg"
            }
        }

    def get_job_info(self, job_id):
        return None

    def get_original_data(self, job_id):
        return None

    def get_progress(self, job_id):
        global PROGRESS_REQUESTS
        PROGRESS_REQUESTS.append(job_id)

        if job_id == "222222222":
            # return an incomplete result
            return {
                "status" : "success",
                "data" : {
                    "progress" : 47
                }
            }
        elif job_id == "333333333":
            # return a complete results
            return {
                "status" : "success",
                "data" : {
                    "progress" : 100
                }
            }
        elif job_id == "444444444":
            # return an api error
            return {
                "status" : "error"
            }

    def get_todo(self, job_id):
        return None

    def get_results(self, job_id):
        global RESULTS_REQUESTS
        RESULTS_REQUESTS.append(job_id)

        return {
            "status" : "success",
            "data" : [LanternFixtureFactory.record()]
        }

    def get_results_csv(self, job_id):
        return None

    def list_jobs(self, email):
        return None

    def get_quota(self, email):
        return {
            "status" : "success",
            "data" : {
                "available" : QUOTA
            }
        }

################################################

class TestLantern(ESTestCase):
    def setUp(self):
        super(TestLantern, self).setUp()
        self.old_lantern = client.Lantern
        client.Lantern = LanternMock

        global CREATED_JOBS
        CREATED_JOBS = []

        global PROGRESS_REQUESTS
        PROGRESS_REQUESTS = []

        global RESULTS_REQUESTS
        RESULTS_REQUESTS = []

    def tearDown(self):
        super(TestLantern, self).tearDown()
        client.Lantern = self.old_lantern

    def test_01_needs_lantern(self):
        # Check that we can tell when an object needs to be looked up in Lantern

        apc = {
            "record" : {
                "rioxxterms:publication_date" : "2001-01-01",
                "rioxxterms:version" : "AAM",
                "dc:source" : {
                    "name" : "Journal Title",
                    "identifier" : [
                        {"type" : "issn", "id" : "XXXX-XXXX"}
                    ],
                    "oa_type" : "hybrid",
                    "self_archiving" : {
                        "preprint" : {
                            "embargo" : 10,
                            "policy" : "can"
                        },
                        "postprint" : {
                            "embargo" : 20,
                            "policy" : "cannot"
                        },
                        "publisher" : {
                            "embargo" : 30,
                            "policy" : "maybe"
                        }
                    }
                },
                "rioxxterms:project" : [
                    {"funder_name" : "BBSRC"}
                ],
                "ali:license_ref" : [
                    { "type" : "CC BY" }
                ],
                "jm:repository" : [
                    {"repo_name" : "arXiv"}
                ]
            }
        }
        obj = PublicAPC(apc)

        needs = LanternApi._needs_lantern_data(obj)
        assert needs is False

        clone = deepcopy(apc)
        clone["record"]["rioxxterms:publication_date"] = ""
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        clone["record"]["rioxxterms:version"] = ""
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        clone["record"]["dc:source"]["name"] = ""
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        clone["record"]["dc:source"]["identifier"][0]["type"] = "other"
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        del clone["record"]["dc:source"]["oa_type"]
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        clone["record"]["dc:source"]["self_archiving"]["preprint"]["embargo"] = None
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        clone["record"]["dc:source"]["self_archiving"]["preprint"]["policy"] = None
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        clone["record"]["dc:source"]["self_archiving"]["postprint"]["embargo"] = None
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        clone["record"]["dc:source"]["self_archiving"]["postprint"]["policy"] = None
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        clone["record"]["dc:source"]["self_archiving"]["publisher"]["embargo"] = None
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        clone["record"]["dc:source"]["self_archiving"]["publisher"]["policy"] = None
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        del clone["record"]["rioxxterms:project"][0]["funder_name"]
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        del clone["record"]["ali:license_ref"][0]["type"]
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        clone = deepcopy(apc)
        del clone["record"]["jm:repository"][0]["repo_name"]
        cobj = PublicAPC(clone)
        needs = LanternApi._needs_lantern_data(cobj)
        assert needs is True

        # now check that having a date cut-off works
        apc = {
            "admin" : {
                "lantern_lookup" : dates.now()
            }
        }
        obj = PublicAPC(apc)
        needs = LanternApi._needs_lantern_data(obj)
        assert needs is False

        apc["admin"]["lantern_lookup"] = dates.format(dates.before_now(31104000))   # a year ago
        obj = PublicAPC(apc)
        needs = LanternApi._needs_lantern_data(obj)
        assert needs is True

    def test_02_get_identifiers(self):
        # Check we get the right identifiers from an object

        apc = {
            "record" : {
                "dc:identifier" : [
                    {"type" : "doi", "id" : "10.1"},
                    {"type" : "pmcid", "id" : "PMC1234"},
                    {"type" : "pmid", "id" : "1234"},
                    {"type" : "other", "id" : "whatever"}
                ]
            }
        }
        pub = PublicAPC(apc)
        idents = LanternApi._get_identifiers(pub)

        assert idents["DOI"] == "10.1"
        assert idents["PMCID"] == "PMC1234"
        assert idents["PMID"] == "1234"

        pub = PublicAPC()
        idents = LanternApi._get_identifiers(pub)
        assert idents is None

    def test_03_batch(self):
        # check that batches are created correctly

        idents = [True] * 4444
        batches = LanternApi._batch(idents)
        assert len(batches) == 5
        assert len(batches[0]) == 1000
        assert len(batches[1]) == 1000
        assert len(batches[2]) == 1000
        assert len(batches[3]) == 1000
        assert len(batches[4]) == 444

        idents = [True] * 12
        batches = LanternApi._batch(idents)
        assert len(batches) == 1
        assert len(batches[0]) == 12

    def test_04_create_job(self):
        # Check we can create jobs correctly

        acc1 = MonitorUKAccount()
        acc1.email = "one@example.com"
        acc1.save()

        acc2 = MonitorUKAccount()
        acc2.email = "two@example.com"
        acc2.lantern_email = "twolantern@example.com"
        acc2.lantern_api_key = "123456789"
        acc2.save()

        acc3 = MonitorUKAccount()
        acc3.email = "three@example.com"
        acc3.lantern_email = "threelantern@example.com"
        acc3.lantern_api_key = "987654321"
        acc3.save(blocking=True)

        # a record which does not need lantern
        source = PublicAPCFixtureFactory.make_record(acc2.id, None, None, None)
        source["admin"]["lantern_lookup"] = dates.now()
        pub = PublicAPC(source)
        pub.save()

        # a record that needs lantern because of a missing field
        source = PublicAPCFixtureFactory.make_record(acc2.id, None, None, None)
        del source["admin"]["lantern_lookup"]
        del source["record"]["rioxxterms:publication_date"]
        pub = PublicAPC(source)
        pub.save()

        # a record that needs lantern because it has timed out and has a missing field
        source = PublicAPCFixtureFactory.make_record(acc2.id, None, None, None)
        source["admin"]["lantern_lookup"] = dates.format(dates.before_now(31104000))   # a year ago
        del source["record"]["rioxxterms:publication_date"]
        pub = PublicAPC(source)
        pub.save()

        # a record that needs lantern but has no identifiers
        source = PublicAPCFixtureFactory.make_record(acc2.id, None, None, None)
        source["admin"]["lantern_lookup"] = dates.format(dates.before_now(31104000))   # a year ago
        del source["record"]["rioxxterms:publication_date"]
        del source["record"]["dc:identifier"]
        pub = PublicAPC(source)
        pub.save()

        # a record which does not need lantern
        source = PublicAPCFixtureFactory.make_record(acc3.id, None, None, None)
        source["admin"]["lantern_lookup"] = dates.now()
        pub = PublicAPC(source)
        pub.save()

        # a record that needs lantern because of a missing field
        source = PublicAPCFixtureFactory.make_record(acc3.id, None, None, None)
        del source["admin"]["lantern_lookup"]
        del source["record"]["rioxxterms:publication_date"]
        pub = PublicAPC(source)
        pub.save()

        # a record that needs lantern because it has timed out and has a missing field
        source = PublicAPCFixtureFactory.make_record(acc3.id, None, None, None)
        source["admin"]["lantern_lookup"] = dates.format(dates.before_now(31104000))   # a year ago
        del source["record"]["rioxxterms:publication_date"]
        pub = PublicAPC(source)
        pub.save()

        # a record that needs lantern but has no identifiers
        source = PublicAPCFixtureFactory.make_record(acc3.id, None, None, None)
        source["admin"]["lantern_lookup"] = dates.format(dates.before_now(31104000))   # a year ago
        del source["record"]["rioxxterms:publication_date"]
        del source["record"]["dc:identifier"]
        pub = PublicAPC(source)
        pub.save(blocking=True)

        LanternApi.make_new_jobs()

        time.sleep(2)

        dao = LanternJob()
        jobs = [job for job in dao.iterall()]
        assert len(jobs) == 2

        assert len(CREATED_JOBS) == 2
        count = 0
        for job in CREATED_JOBS:
            if job["email"] == "twolantern@example.com":
                count += 1
                assert len(job["list"]) == 2
            elif job["email"] == "threelantern@example.com":
                count += 10
                assert len(job["list"]) == 2
        assert count == 11

        # now do the same thing again.  The jobs should not change, as we've already created jobs
        # for all the public records
        LanternApi.make_new_jobs()
        time.sleep(2)
        jobs = [job for job in dao.iterall()]
        assert len(jobs) == 2


    def test_05_low_quota(self):
        # Check what happens when the use has a low quota on Lantern

        global QUOTA
        QUOTA = 1

        acc2 = MonitorUKAccount()
        acc2.email = "two@example.com"
        acc2.lantern_email = "twolantern@example.com"
        acc2.lantern_api_key = "123456789"
        acc2.save()

        # a record that needs lantern because of a missing field
        source = PublicAPCFixtureFactory.make_record(acc2.id, None, None, None)
        del source["admin"]["lantern_lookup"]
        del source["record"]["rioxxterms:publication_date"]
        pub = PublicAPC(source)
        pub.save()

        # a record that needs lantern because it has timed out and has a missing field
        source = PublicAPCFixtureFactory.make_record(acc2.id, None, None, None)
        source["admin"]["lantern_lookup"] = dates.format(dates.before_now(31104000))   # a year ago
        del source["record"]["rioxxterms:publication_date"]
        pub = PublicAPC(source)
        pub.save(blocking=True)

        LanternApi.make_new_jobs()

        time.sleep(2)

        dao = LanternJob()
        jobs = [job for job in dao.iterall()]
        assert len(jobs) == 1

        assert len(CREATED_JOBS) == 1
        job = CREATED_JOBS[0]

        assert job["email"] == "twolantern@example.com"
        assert len(job["list"]) == 1

    def test_06_xwalk(self):
        # Check the Lantern to Enhancement crosswalk
        record = LanternFixtureFactory.record()
        result = LanternFixtureFactory.xwalk_result()

        enhancement = LanternApi._xwalk(record)

        assert enhancement.data["record"] == result["record"]

    def test_07_check_jobs(self):
        # Ensure that we can check existing jobs correctly

        acc = MonitorUKAccount()
        acc.email = "one@example.com"
        acc.lantern_email = "onelantern@example.com"
        acc.lantern_api_key = "123456789"
        acc.save()

        lj1 = LanternJob()
        lj1.job_id = "111111111"
        lj1.account = acc.id
        lj1.status = "complete"
        lj1.save()

        lj2 = LanternJob()
        lj2.job_id = "222222222"
        lj2.account = acc.id
        lj2.status = "active"
        lj2.last_updated = dates.format(dates.before_now(5000))
        lj2.save(updated=False)

        lj3 = LanternJob()
        lj3.job_id = "333333333"
        lj3.account = acc.id
        lj3.status = "active"
        lj3.last_updated = dates.format(dates.before_now(5000))
        lj3.save(updated=False)

        lj4 = LanternJob()
        lj4.job_id = "444444444"
        lj4.account = acc.id
        lj4.status = "active"
        lj4.last_updated = dates.format(dates.before_now(5000))
        lj4.save(updated=False)

        lj5 = LanternJob()
        lj5.job_id = "555555555"
        lj5.account = acc.id
        lj5.status = "active"
        lj5.save(blocking=True)

        LanternApi.check_jobs()

        # check that the progress requests we expected were made
        assert len(PROGRESS_REQUESTS) == 3
        assert "222222222" in PROGRESS_REQUESTS
        assert "333333333" in PROGRESS_REQUESTS
        assert "444444444" in PROGRESS_REQUESTS

        # check that the job which received an error was just ignored
        dao = LanternJob()
        ignored = dao.pull(lj4.id)
        assert ignored.last_updated == lj4.last_updated
        assert ignored.status == "active"

        # check that the record which was not complete was touched
        touched = dao.pull(lj2.id)
        assert touched.last_updated != lj2.last_updated
        assert touched.status == "active"

        # check that results were requested only for one item
        assert len(RESULTS_REQUESTS) == 1
        assert "333333333" in RESULTS_REQUESTS

        # wait for a bit, so that enhancements have time to go in
        time.sleep(2)

        # check that an enhancement was registered
        edao = Enhancement()
        gen = edao.iterall()
        enhancements = [e for e in gen]

        assert len(enhancements) == 1

        result = LanternFixtureFactory.xwalk_result()
        assert enhancements[0].data["record"] == result["record"]

