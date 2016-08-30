"""
Tasks to be executed by the task scheduler
"""

from octopus.core import app
from octopus.lib import dates

from service.api import WorkflowApi
from service.lantern import LanternApi


def process_updates():
    """
    Process all new Requests and all new Enhancements
    """
    print "[{x}] Processing Requests".format(x=dates.now())
    WorkflowApi.process_requests()
    WorkflowApi.process_enhancements()


def lantern_jobs():
    """
    Create any new jobs with Lantern that are requried
    """
    if not app.config.get("ENABLE_LANTERN", False):
        print "[{x}] Not sending Lantern jobs - interface disabled".format(x=dates.now())
        return
    print "[{x}] Sending Lantern jobs".format(x=dates.now())
    LanternApi.make_new_jobs()

def lantern_check():
    """
    Check any existing Lantern jobs
    """
    if not app.config.get("ENABLE_LANTERN", False):
        print "[{x}] Not checking Lantern jobs - interface disabled".format(x=dates.now())
        return
    print "[{x}] Checking Lantern jobs".format(x=dates.now())
    LanternApi.check_jobs()