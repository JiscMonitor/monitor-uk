"""
Functional tests for the Search API

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

from copy import deepcopy

import time
import requests, json, os


class TestSearch(ESTestCase):
    def setUp(self):
        super(TestSearch, self).setUp()
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
        self.api_base = self.appurl + "/search/v1/"

    def tearDown(self):
        super(TestSearch, self).tearDown()
        self.test_server.terminate()
        os.remove(self.cfg_file)

    def test_01_public_success(self):
        # make a user account which can only read generically from public
        acc = models.MonitorUKAccount()
        acc.generate_api_key()
        acc.add_role("read_apc")
        acc.save()

        # first make a small dataset for us to search over
        source1 = fixtures.PublicAPCFixtureFactory.make_record("test1", "Title A", "2001-01-01T00:00:00Z", "2002-01-01T00:00:00Z")
        pub1 = models.PublicAPC(source1)
        pub1.save()

        source2 = fixtures.PublicAPCFixtureFactory.make_record("test1", "Title B", "2001-01-02T00:00:00Z", "2002-01-02T00:00:00Z")
        pub2 = models.PublicAPC(source2)
        pub2.save()

        source3 = fixtures.PublicAPCFixtureFactory.make_record("test2", "Title C", "2001-01-03T00:00:00Z", "2002-01-03T00:00:00Z")
        pub3 = models.PublicAPC(source3)
        pub3.save()

        source4 = fixtures.PublicAPCFixtureFactory.make_record("test2", "Title D", "2001-01-04T00:00:00Z", "2002-01-04T00:00:00Z")
        pub4 = models.PublicAPC(source4)
        pub4.save(blocking=True)

        # 1. simple query for a field, with no sorting and no paging
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "public?api_key=" + acc.api_key + "&q=" + query)
        assert resp.status_code == 200

        j = resp.json()
        assert j.get("total") == 1
        assert j.get("page") == 1
        assert j.get("pageSize") == 10
        assert len(j.get("results")) == 1

        r = j.get("results")[0]
        assert r.get("dcterms:dateSubmitted") == "2001-01-01T00:00:00Z"
        assert r.get("dc:title") == "Title A"
        assert r.get("dcterms:dateAccepted") == "2002-01-01T00:00:00Z"

        # 2. more advanced query, with sorting
        query = "dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z OR dcterms\\:dateAccepted:2002-01-02T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "public?api_key=" + acc.api_key + "&q=" + query + "&sortBy=dc:title&sortDir=desc")
        assert resp.status_code == 200

        j = resp.json()
        assert j.get("total") == 2
        assert j.get("page") == 1
        assert j.get("pageSize") == 10
        assert len(j.get("results")) == 2

        r1 = j.get("results")[0]
        assert r1.get("dc:title") == "Title B", r1.get("dc:title")

        r2 = j.get("results")[1]
        assert r2.get("dc:title") == "Title A"

        # 3. advanced query, with sorting and paging
        query = "dcterms\\:dateSubmitted:2001-01-03T00\\:00\\:00Z OR dcterms\\:dateAccepted:2002-01-04T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "public?api_key=" + acc.api_key + "&q=" + query + "&sortBy=dc:title&sortDir=asc&page=2&pageSize=1")
        assert resp.status_code == 200

        j = resp.json()
        assert j.get("total") == 2
        assert j.get("page") == 2
        assert j.get("pageSize") == 1
        assert len(j.get("results")) == 1

        r1 = j.get("results")[0]
        assert r1.get("dc:title") == "Title D", r1.get("dc:title")

    def test_02_public_error(self):
        # make a user account which can only read generically from public
        acc2 = models.MonitorUKAccount()
        acc2.generate_api_key()
        acc2.save()

        acc = models.MonitorUKAccount()
        acc.generate_api_key()
        acc.add_role("read_apc")
        acc.save(blocking=True)

        # 1. query with incorrect page parameter
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "public?api_key=" + acc.api_key + "&q=" + query + "&page=fourteen")
        assert resp.status_code == 400, resp.status_code

        # 2. query with incorrect page size
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "public?api_key=" + acc.api_key + "&q=" + query + "&page=1&pageSize=huge")
        assert resp.status_code == 400

        # 3. query with incorrect sort_dir
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "public?api_key=" + acc.api_key + "&q=" + query + "&page=1&pageSize=10&sortBy=dc:title&sortDir=up")
        assert resp.status_code == 400

        # 4. wildcard query attempt
        query = "record.dc\\:title:Ti*le"
        resp = requests.get(self.api_base + "public?api_key=" + acc.api_key + "&q=" + query)
        assert resp.status_code == 400

        # 5. Proximity query attempt
        query = "record.dc\\:title:Title~5"
        resp = requests.get(self.api_base + "public?api_key=" + acc.api_key + "&q=" + query)
        assert resp.status_code == 400

        # 6. No API key
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "public?q=" + query)
        assert resp.status_code == 401

        # 7. Incorrect user role
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "public?api_key=" + acc2.api_key + "&q=" + query)
        assert resp.status_code == 403

    def test_03_private_success(self):
        # make user accounts with the correct usernames to query stuff we're about to create then search on
        acc = models.MonitorUKAccount()
        acc.id = "test1"
        acc.generate_api_key()
        acc.add_role("write_apc")
        acc.save()

        acc2 = models.MonitorUKAccount()
        acc2.id = "test2"
        acc2.generate_api_key()
        acc2.add_role("write_apc")
        acc2.save()

        # first make a small dataset for us to search over
        source1 = fixtures.PublicAPCFixtureFactory.make_record("test1", "Title A", "2001-01-01T00:00:00Z", "2002-01-01T00:00:00Z")
        pub1 = models.PublicAPC(source1)
        pub1.save()

        source2 = fixtures.PublicAPCFixtureFactory.make_record("test1", "Title B", "2001-01-02T00:00:00Z", "2002-01-02T00:00:00Z")
        pub2 = models.PublicAPC(source2)
        pub2.save()

        source3 = fixtures.PublicAPCFixtureFactory.make_record("test2", "Title C", "2001-01-03T00:00:00Z", "2002-01-03T00:00:00Z")
        pub3 = models.PublicAPC(source3)
        pub3.save()

        source4 = fixtures.PublicAPCFixtureFactory.make_record("test2", "Title D", "2001-01-04T00:00:00Z", "2002-01-04T00:00:00Z")
        pub4 = models.PublicAPC(source4)
        pub4.save(blocking=True)

        # 1. simple query for a field, with no sorting and no paging, done by the correct user account
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "private?api_key=" + acc.api_key + "&q=" + query)
        assert resp.status_code == 200

        j = resp.json()
        assert j.get("total") == 1
        assert j.get("page") == 1
        assert j.get("pageSize") == 10
        assert len(j.get("results")) == 1

        r = j.get("results")[0]
        assert r.get("dc:title") == "Title A"

        # 2. more advanced query, with sorting, which would match 2 if it weren't for the user account
        query = "dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z OR dcterms\\:dateAccepted:2002-01-03T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "private?api_key=" + acc.api_key + "&q=" + query + "&sortBy=dc:title&sortDir=desc")
        assert resp.status_code == 200

        j = resp.json()
        assert j.get("total") == 1
        assert j.get("page") == 1
        assert j.get("pageSize") == 10
        assert len(j.get("results")) == 1

        r1 = j.get("results")[0]
        assert r1.get("dc:title") == "Title A", r1.get("dc:title")

        # 3. now do the same query as above with a different account, and get the opposite result
        query = "dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z OR dcterms\\:dateAccepted:2002-01-03T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "private?api_key=" + acc2.api_key + "&q=" + query + "&sortBy=dc:title&sortDir=desc")
        assert resp.status_code == 200

        j = resp.json()
        assert j.get("total") == 1
        assert j.get("page") == 1
        assert j.get("pageSize") == 10
        assert len(j.get("results")) == 1

        r1 = j.get("results")[0]
        assert r1.get("dc:title") == "Title C", r1.get("dc:title")

    def test_04_private_error(self):
        # make a user account which can only read generically from public
        acc2 = models.MonitorUKAccount()
        acc2.generate_api_key()
        acc2.add_role("read_apc")
        acc2.save()

        acc = models.MonitorUKAccount()
        acc.generate_api_key()
        acc.add_role("write_apc")
        acc.save(blocking=True)

        # 1. query with incorrect page parameter
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "private?api_key=" + acc.api_key + "&q=" + query + "&page=fourteen")
        assert resp.status_code == 400, resp.status_code

        # 2. query with incorrect page size
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "private?api_key=" + acc.api_key + "&q=" + query + "&page=1&pageSize=huge")
        assert resp.status_code == 400

        # 3. query with incorrect sort_dir
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "private?api_key=" + acc.api_key + "&q=" + query + "&page=1&pageSize=10&sortBy=dc:title&sortDir=up")
        assert resp.status_code == 400

        # 4. wildcard query attempt
        query = "record.dc\\:title:Ti*le"
        resp = requests.get(self.api_base + "private?api_key=" + acc.api_key + "&q=" + query)
        assert resp.status_code == 400

        # 5. Proximity query attempt
        query = "record.dc\\:title:Title~5"
        resp = requests.get(self.api_base + "private?api_key=" + acc.api_key + "&q=" + query)
        assert resp.status_code == 400

        # 6. No API key
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "private?q=" + query)
        assert resp.status_code == 401

        # 7. Incorrect user role
        query = "record.dcterms\\:dateSubmitted:2001-01-01T00\\:00\\:00Z"
        resp = requests.get(self.api_base + "private?api_key=" + acc2.api_key + "&q=" + query)
        assert resp.status_code == 403