"""
Functional tests for Lantern integration

This connects to the real Lantern service, so is sensitive to changes in the API or changes in the
data from the real-world examples.

You need to supply the following configuration in local.cfg for it to operate:

TEST_ACCOUNT_EMAIL_LANTERN
TEST_API_KEY_LANTERN
"""

from octopus.modules.es.testindex import ESTestCase
from octopus.core import app

from service.tests import fixtures
from service import models
from service import api
from service import lantern

from copy import deepcopy
import time

class TestLantern(ESTestCase):
    def setUp(self):
        super(TestLantern, self).setUp()
        self.lookup_delay = app.config.get("JOB_LOOKUP_DELAY_LANTERN")
        app.config["JOB_LOOKUP_DELAY_LANTERN"] = 1

    def tearDown(self):
        super(TestLantern, self).tearDown()
        app.config["JOB_LOOKUP_DELAY_LANTERN"] = self.lookup_delay

    def test_01_enhance(self):
        # Create some PublicAPCs for a Lantern-enabled account and then check that jobs are created and completed successfully,
        # generating enhancements

        acc = models.MonitorUKAccount()
        acc.email = "one@example.com"
        acc.lantern_email = app.config.get("TEST_ACCOUNT_EMAIL_LANTERN")
        acc.lantern_api_key = app.config.get("TEST_API_KEY_LANTERN")
        acc.save()

        dois = fixtures.LanternFixtureFactory.interesting_dois()
        for doi in dois:
            source = fixtures.PublicAPCFixtureFactory.skeleton(doi, acc.id)
            pub = models.PublicAPC(source)
            pub.save()

        time.sleep(2)

        lantern.LanternApi.make_new_jobs()

        time.sleep(2)

        dao = models.LanternJob()
        jobs = [j for j in dao.iterall()]
        assert len(jobs) == 1
        job_id = jobs[0].id
        print "Lantern Job ID: " + jobs[0].job_id
        print "Lookup delay " + str(app.config.get("JOB_LOOKUP_DELAY_LANTERN"))

        while True:
            lantern.LanternApi.check_jobs()
            job = dao.pull(job_id)
            if job.status == "complete":
                break
            print "sleeping ..."
            time.sleep(1)

        time.sleep(2)

        # once here, we expect an enhancement to exist
        edao = models.Enhancement()
        enhancements = [e for e in edao.iterall()]
        assert len(enhancements) == len(dois)

        api.WorkflowApi.process_enhancements()

        time.sleep(2)

        pdao = models.PublicAPC()
        for doi in dois:
            pubs = pdao.find_by_doi(doi)
            assert len(pubs) == 1
            pub = pubs[0]

            enhancement = fixtures.LanternFixtureFactory.expected_enhancement_record(doi)
            expected = fixtures.PublicAPCFixtureFactory.skeleton(doi, acc.id, enhancement)

            # now clean up both sides to make them comparable
            target = deepcopy(pub.data)
            del target["id"]
            del target["created_date"]
            del target["last_updated"]
            del target["record"]["jm:provenance"] # because it's too wordy to compare
            del target["record"]["jm:apc"] # the apc is unaffected, so no need to compare
            del target["admin"]["lantern_lookup"] # difficult to predict what the timestamp would be

            del expected["record"]["jm:apc"]

            assert target == expected


