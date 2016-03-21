from octopus.modules.account.models import BasicAccount, ContactableAccount, APIAccount

class MonitorUKAccount(BasicAccount, ContactableAccount, APIAccount):
    """
    This account object doesn't need to actually do anything except for compose itself
    of the 3 types of account components that we want to support:

    * BasicAccount - must extend from this first, and provides all the essential account information
    * ContactableAccount - contains name, phone and geoloc for the user
    * APIAccount - supports api keys
    """
    pass