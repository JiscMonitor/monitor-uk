from octopus.core import app

from service.api import WorkflowApi
from service.lantern import LanternApi


def process_updates():
    """
    Function for binding the WorkflowApi to the scheduled task runner

    :return:
    """
    WorkflowApi.process_requests()
    WorkflowApi.process_enhancements()


def lantern_jobs():
    if not app.config.get("ENABLE_LANTERN", False):
        return
    LanternApi.make_new_jobs()

def lantern_check():
    if not app.config.get("ENABLE_LANTERN", False):
        return
    LanternApi.check_jobs()