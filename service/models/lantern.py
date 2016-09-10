"""
Model objects to go along with the Lantern integration
"""

from octopus.modules.infosys.models import InfoSysModel

from octopus.lib import dates

from datetime import date, datetime

class LanternJob(InfoSysModel):
    """
    Model representing a job request (for a batch of identifiers) from Lantern
    """
    def __init__(self, full=None, *args, **kwargs):
        super(LanternJob, self).__init__(type="lantern_job", record_struct=RECORD_STRUCT, full=full)

    @property
    def job_id(self):
        return self._get_single("record.job_id")

    @job_id.setter
    def job_id(self, val):
        self._set_with_struct("record.job_id", val)

    @property
    def account(self):
        return self._get_single("record.account")

    @account.setter
    def account(self, val):
        self._set_with_struct("record.account", val)

    @property
    def status(self):
        return self._get_single("record.status")

    @status.setter
    def status(self, val):
        self._set_with_struct("record.status", val)

    ###########################################
    ## Data access methods

    def list_active(self, checked_before=None, **kwargs):
        """
        Get an iterator over a list of active jobs that were last checked before the given date

        :param checked_before: cutoff date for list
        :param kwargs:
        :return:
        """
        if checked_before is None:
            checked_before = datetime.utcnow()
        if isinstance(checked_before, date):
            checked_before = dates.format(checked_before)
        q = ActiveQuery(checked_before)
        return self.scroll(q=q.query(), **kwargs)

RECORD_STRUCT = {
    "fields" : {
        "job_id" : {"coerce" : "unicode"},
        "account" : {"coerce" : "unicode"},
        "status" : {"coerce" : "unicode", "allowed_values" : [u"active", u"complete"]}
    }
}
""" Schema for LanternJob record structure """

class ActiveQuery(object):
    """
    Prepared query to get LanternJob records which are active and which were last
    checked before a given date
    """

    def __init__(self, checked_before=None):
        self.checked_before = checked_before

    def query(self):
        return {
            "query" : {
                "bool" : {
                    "must" : [
                        {"range" : {"last_updated" : {"lte" : self.checked_before}}},
                        {"term" : {"record.status.exact" : "active"}}
                    ]
                }
            }
        }