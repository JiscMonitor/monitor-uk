from octopus.modules.account.models import BasicAccount, ContactableAccount, APIAccount, OrganisationAccount

class MonitorUKAccount(BasicAccount, ContactableAccount, APIAccount, OrganisationAccount):
    """
    This account object doesn't need to actually do anything except for compose itself
    of the 4 types of account components that we want to support:

    * BasicAccount - must extend from this first, and provides all the essential account information
    * ContactableAccount - contains name, phone and geoloc for the user
    * APIAccount - supports api keys
    * OrganisationAccount - supports information about organisation name/role
    """

    def prep(self):
        super(MonitorUKAccount, self).prep()
        if self.api_key is None and self.activation_token is not None:
            self.generate_api_key()