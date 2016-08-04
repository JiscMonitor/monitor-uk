from octopus.modules.infosys.models import InfoSysModel

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

RECORD_STRUCT = {
    "fields" : {
        "job_id" : {"coerce" : "unicode"},
        "account" : {"coerce" : "unicode"},
        "status" : {"coerce" : "unicode", "allowed_values" : [u"active", u"complete"]}
    }
}