from service.api import WorkflowApi

def process_requests():
    """
    Function for binding the WorkflowApi to the scheduled task runner

    :return:
    """
    WorkflowApi.process_requests()