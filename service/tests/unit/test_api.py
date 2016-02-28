from octopus.modules.es.testindex import ESTestCase
from octopus.modules.account.models import BasicAccount

from service.api import RequestApi
from service.models import Request
from service.tests.fixtures import RequestFixtureFactory, PublicAPCFixtureFactory

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