from octopus.modules.infosys.models import InfoSysModel

from octopus.lib import dates

from datetime import date, datetime

class LanternJob(InfoSysModel):
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

class ActiveQuery(object):
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