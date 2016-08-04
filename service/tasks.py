from octopus.core import app

from service.api import WorkflowApi
from service.lantern import LanternApi


def process_requests():
    """
    Function for binding the WorkflowApi to the scheduled task runner

    :return:
    """
    WorkflowApi.process_requests()


def lantern_jobs():
    if not app.config.get("ENABLE_LANTERN", False):
        return
    LanternApi.make_new_jobs()