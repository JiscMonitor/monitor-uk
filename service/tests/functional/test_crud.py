"""
Functional tests for the API.

This test suite will work fine against a standard MUK install on the local machine with the default accounts.

If you want to run it in a different environment you will need to modify some of the constants used in this test.
"""

from octopus.modules.es.testindex import ESTestCase
from octopus.modules.test.helpers import get_first_free_port, TestServer, make_config
from octopus.core import app
from octopus.lib import paths

from service.tests import fixtures
from service import models
from service import web
from service import api

import time
import requests, json, os

class TestCRUD(ESTestCase):
    def setUp(self):
        super(TestCRUD, self).setUp()
        self.config = {
            "PORT" : get_first_free_port(),
            "ELASTIC_SEARCH_INDEX" : app.config['ELASTIC_SEARCH_INDEX'],
            "THREADED" : True,
            "FUNCTIONAL_TEST_MODE" : True
        }
        self.cfg_file = paths.rel2abs(__file__, "..", "resources", "test-server.cfg")

        make_config(self.config, self.cfg_file)
        self.test_server = TestServer(port=None, index=None, python_app_module_path=os.path.abspath(web.__file__), cfg_file=self.cfg_file)
        self.test_server.spawn_with_config()

        self.appurl = "http://localhost:{x}".format(x=self.config["PORT"])
        self.api_base = self.appurl + "/api/v1/"

    def tearDown(self):
        super(TestCRUD, self).tearDown()
        self.test_server.terminate()
        os.remove(self.cfg_file)

    def test_01_create_retrieve_request(self):
        # create an account with the correct rights
        acc = models.MonitorUKAccount()
        acc.generate_api_key()
        acc.add_role("write_apc")
        acc.save(blocking=True)

        # first, create a record via the API
        record = fixtures.RequestFixtureFactory.record()
        create_url = self.api_base + "apc?api_key=" + acc.api_key

        resp = requests.post(create_url, data=json.dumps(record), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 201
        j = resp.json()
        assert j.get("status") == "created"
        assert j.get("public_id") == "10.1234/me"
        assert j.get("request_id") is not None

        time.sleep(2)

        # now it has been created, and while it still sits in the request space, attempt to retrieve
        # it - this should fail
        retrieve_url = self.api_base + "apc/" + j.get("public_id") + "?api_key=" + acc.api_key

        resp2 = requests.get(retrieve_url)
        assert resp2.status_code == 404

    def test_02_create_error(self):
        # create an account with the correct rights
        acc = models.MonitorUKAccount()
        acc.generate_api_key()
        acc.add_role("write_apc")
        acc.save()

        record = fixtures.RequestFixtureFactory.record()

        # try a create without an API key
        create_url = self.api_base + "apc"
        resp = requests.post(create_url, data=json.dumps(record), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 401

        # try a create with the wrong role
        create_url = self.api_base + "apc?api_key=" + acc3.api_key
        resp = requests.post(create_url, data=json.dumps(record), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 403

        # try a create with the wrong format data
        create_url = self.api_base + "apc?api_key=" + acc.api_key
        resp = requests.post(create_url, data=json.dumps({"random" : "junk"}), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 400

    def test_03_update_request(self):
        # this is basically 2 consecutive creates for the same item - things get more interesting in the next
        # test when we publish the item in between ...

        # create an account with the correct rights
        acc = models.MonitorUKAccount()
        acc.generate_api_key()
        acc.add_role("write_apc")
        acc.save(blocking=True)

        # first, create a record via the API
        record = fixtures.RequestFixtureFactory.record()
        create_url = self.api_base + "apc?api_key=" + acc.api_key

        resp = requests.post(create_url, data=json.dumps(record), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 201

        time.sleep(2)

        # now send an update to the base APC url - which is the only thing we can do at the moment, as the public_id
        # is not yet active
        record2 = fixtures.RequestFixtureFactory.record()
        record2["dc:title"]  = "Updated"
        j = resp.json()
        update_url = self.api_base + "apc?api_key=" + acc.api_key

        resp2 = requests.post(update_url, data=json.dumps(record2), headers={"Content-Type" : "application/json"})
        assert resp2.status_code == 201
        j = resp2.json()
        assert j.get("status") == "created"
        assert j.get("public_id") == "10.1234/me"
        assert j.get("request_id") is not None

        # no point trying to retrieve it, as it still sits in the public space, where we can't access it

    def test_04_retrieve_update_public(self):
        pub_dao = models.PublicAPC()

        # create an account with the correct rights
        acc = models.MonitorUKAccount()
        acc.generate_api_key()
        acc.add_role("write_apc")
        acc.save()

        # and another account without the correct role
        acc3 = models.MonitorUKAccount()
        acc3.generate_api_key()
        acc3.save(blocking=True)

        # first, create a record via the API
        record = fixtures.RequestFixtureFactory.record()
        create_url = self.api_base + "apc?api_key=" + acc.api_key

        resp = requests.post(create_url, data=json.dumps(record), headers={"Content-Type" : "application/json"})
        j = resp.json()
        assert resp.status_code == 201

        # execute the back-end workflow, which should publish the request
        time.sleep(2)
        api.WorkflowApi.process_requests()
        time.sleep(2)

        # check that publication took place
        pubs = pub_dao.find_by_doi(j.get("public_id"))
        assert len(pubs) == 1

        # attempt to retrieve the record from the public space

        retrieve_url = self.api_base + "apc/" + j.get("public_id") + "?api_key=" + acc.api_key

        resp2 = requests.get(retrieve_url)
        assert resp2.status_code == 200
        assert resp2.json() == record

        # now issue an update against that record
        update_url = self.api_base + "apc/" + j.get("public_id") + "?api_key=" + acc.api_key
        record2 = fixtures.RequestFixtureFactory.record()
        record2["dc:title"]  = "Updated"

        resp3 = requests.put(update_url, data=json.dumps(record2), headers={"Content-Type" : "application/json"})
        assert resp3.status_code == 200
        j = resp3.json()
        assert j.get("status") == "updated"
        assert j.get("public_id") == "10.1234/me"
        assert j.get("request_id") is not None

        # execute the back-end workflow, which should publish the update
        time.sleep(2)
        api.WorkflowApi.process_requests()
        time.sleep(2)

        retrieve_url = self.api_base + "apc/" + j.get("public_id") + "?api_key=" + acc.api_key
        resp4 = requests.get(retrieve_url)
        assert resp4.status_code == 200
        assert resp4.json() == record2

        # finally, a quick security check - that a user without the correct role can't access
        retrieve_url = self.api_base + "apc/" + j.get("public_id") + "?api_key=" + acc3.api_key
        resp4 = requests.get(retrieve_url)
        assert resp4.status_code == 403

    def test_05_update_error(self):
        # create an account with the correct rights
        acc = models.MonitorUKAccount()
        acc.generate_api_key()
        acc.add_role("write_apc")
        acc.save()

        # and a third account without the correct role
        acc3 = models.MonitorUKAccount()
        acc3.generate_api_key()
        acc3.save(blocking=True)

        # first, create a record via the API
        record = fixtures.RequestFixtureFactory.record()
        create_url = self.api_base + "apc?api_key=" + acc.api_key

        resp = requests.post(create_url, data=json.dumps(record), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 201
        j = resp.json()

        # execute the back-end workflow, which should publish the update
        time.sleep(2)
        api.WorkflowApi.process_requests()
        time.sleep(2)

        location = self.api_base + "apc/" + j.get("public_id")

        # try an update without an API key
        update_url = location
        resp = requests.put(update_url, data=json.dumps(record), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 401

        # try an update with the wrong role
        update_url = location + "?api_key=" + acc3.api_key
        resp = requests.put(update_url, data=json.dumps(record), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 403

        # try an update with the wrong format data
        update_url = location + "?api_key=" + acc.api_key
        resp = requests.put(update_url, data=json.dumps({"random" : "junk"}), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 400

    def test_06_delete_request(self):
        pub_dao = models.PublicAPC()

        # create an account with the correct rights
        acc = models.MonitorUKAccount()
        acc.generate_api_key()
        acc.add_role("write_apc")
        acc.save(blocking=True)

        # first, create a record via the API
        record = fixtures.RequestFixtureFactory.record()
        create_url = self.api_base + "apc?api_key=" + acc.api_key

        resp = requests.post(create_url, data=json.dumps(record), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 201
        j = resp.json()

        # execute the back-end workflow, which should publish the update
        time.sleep(2)
        api.WorkflowApi.process_requests()
        time.sleep(2)

        # check that publication took place
        pubs = pub_dao.find_by_doi(j.get("public_id"))
        assert len(pubs) == 1

        # now send a delete request
        delete_url = self.api_base + "apc/" + j.get("public_id") + "?api_key=" + acc.api_key

        resp2 = requests.delete(delete_url)
        assert resp2.status_code == 200
        j = resp2.json()
        assert j.get("status") == "deleted"
        assert j.get("public_id") == "10.1234/me"
        assert j.get("request_id") is not None

        # execute the back-end workflow, which should delete the public record
        time.sleep(2)
        api.WorkflowApi.process_requests()
        time.sleep(2)

        # request the record, and discover that it is no longer there (even though, secretly, it's still on
        # the request queue)
        retrieve_url = self.api_base + "apc/" + j.get("public_id") + "?api_key=" + acc.api_key

        resp3 = requests.get(retrieve_url)
        assert resp3.status_code == 404

    def test_07_delete_error(self):
        # create an account with the correct rights
        acc = models.MonitorUKAccount()
        acc.generate_api_key()
        acc.add_role("write_apc")
        acc.save()

        # and a third account without the correct role
        acc2 = models.MonitorUKAccount()
        acc2.generate_api_key()
        acc.add_role("write_apc")
        acc2.save(blocking=True)

        # and a third account without the correct role
        acc3 = models.MonitorUKAccount()
        acc3.generate_api_key()
        acc3.save(blocking=True)

        # first, create a record via the API
        record = fixtures.RequestFixtureFactory.record()
        create_url = self.api_base + "apc?api_key=" + acc.api_key

        resp = requests.post(create_url, data=json.dumps(record), headers={"Content-Type" : "application/json"})
        assert resp.status_code == 201
        j = resp.json()

        # execute the back-end workflow, which should publish the update
        time.sleep(2)
        api.WorkflowApi.process_requests()
        time.sleep(2)

        location = self.api_base + "apc/" + j.get("public_id")

        # try a delete without an API key
        delete_url = location
        resp = requests.delete(delete_url)
        assert resp.status_code == 401

        # try a delete with the wrong role
        delete_url = location + "?api_key=" + acc3.api_key
        resp = requests.delete(delete_url)
        assert resp.status_code == 403

        # try a delete with an account which has no stake in this record
        delete_url = location + "?api_key=" + acc2.api_key
        resp = requests.delete(delete_url)
        assert resp.status_code == 403