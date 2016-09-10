"""
Model objects representing workflow state for record and enhancement processing
"""

from octopus.modules.infosys import models
from octopus.core import app

class WorkflowState(models.InfoSysModel):
    """
    Model object for Workflow State, which records when a process was last run, and the identifiers that
    were run during the final second of the timestamp (to allow disambiguation at next run)
    """
    def __init__(self, full=None, *args, **kwargs):
        super(WorkflowState, self).__init__(type="workflow", record_struct=WORKFLOW_STRUCT, full=full)

    @property
    def last_request(self):
        return self._get_single("record.last_request_date", default=app.config.get("WORKFLOW_STATE_EARLIEST_DATE"))

    @last_request.setter
    def last_request(self, val):
        self._set_with_struct("record.last_request_date", val)

    @property
    def already_processed(self):
        return self._get_list("record.already_processed")

    @already_processed.setter
    def already_processed(self, val):
        self._set_with_struct("record.already_processed", val)

    def add_processed(self, val):
        self._add_to_list_with_struct("record.already_processed", val)

    def is_processed(self, id):
        return id in self.already_processed

WORKFLOW_STRUCT = {
    "fields" : {
        "last_request_date" : {"coerce" : "utcdatetime"}
    },
    "lists" : {
        "already_processed" : {"contains" : "field", "coerce" : "unicode"}
    }
}
""" Schema for WorkflowState record structure"""