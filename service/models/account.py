from octopus.modules.account.models import BasicAccount, ContactableAccount, APIAccount, OrganisationAccount

class MonitorUKAccount(BasicAccount, ContactableAccount, APIAccount, OrganisationAccount):
    """
    This account object composes itself
    of the 4 types of account components that we want to support:

    * BasicAccount - must extend from this first, and provides all the essential account information
    * ContactableAccount - contains name, phone and geoloc for the user
    * APIAccount - supports api keys
    * OrganisationAccount - supports information about organisation name/role

    In addition, it contains support for integration with Lantern, by incorporating:

    {
        "lantern_email" : "<email address for lantern account>",
        "lantern_api_key" : "<api key lantern account>"
    }

    """

    @property
    def lantern_email(self):
        return self._get_single("lantern_email", coerce=self._utf8_unicode())

    @lantern_email.setter
    def lantern_email(self, val):
        self._set_single("lantern_email", val, coerce=self._utf8_unicode())

    @property
    def lantern_api_key(self):
        return self._get_single("lantern_api_key", coerce=self._utf8_unicode())

    @lantern_api_key.setter
    def lantern_api_key(self, val):
        self._set_single("lantern_api_key", val, coerce=self._utf8_unicode())

    def prep(self):
        super(MonitorUKAccount, self).prep()
        if self.api_key is None and self.activation_token is not None:
            self.generate_api_key()

    #################################################
    ## additional data access methods

    @classmethod
    def list_lantern_enabled(cls, **kwargs):
        q = LanternAPIQuery()
        return cls.scroll(q=q.query(), **kwargs)


class LanternAPIQuery(object):
    def __init__(self):
        pass

    def query(self):
        return {
            "query" : {
                "filtered" : {
                    "query" : {"match_all" : {}},
                    "filter" : {
                        "bool" : {
                            "must" : [
                                {"exists" : {"field" : "lantern_api_key"}}
                            ]
                        }
                    }
                }
            }
        }