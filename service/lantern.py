from octopus.core import app
from octopus.modules.lantern import client
from octopus.lib import dates

from service.models import MonitorUKAccount, PublicAPC, LanternJob


class LanternApi(object):

    @classmethod
    def make_new_jobs(cls):
        dao = PublicAPC()

        gen = MonitorUKAccount.list_lantern_enabled(keepalive="1h")
        for acc in gen:
            gen2 = dao.list_by_owner(acc.id)
            identifiers = []
            for apc in gen2:
                if LanternApi._needs_lantern_data(apc):
                    idents = LanternApi._get_identifiers(apc)
                    if idents is not None:
                        identifiers.append(idents)

            # now check the user's quota
            lc = client.Lantern(api_key=acc.lantern_api_key)
            quota = lc.get_quota(acc.lantern_email)
            available = quota.get("data", {}).get("available", 0)
            if available == 0:
                continue

            if len(identifiers) > available:
                identifiers = identifiers[:available]

            batches = LanternApi._batch(identifiers)
            for batch in batches:
                resp = lc.create_job(acc.lantern_email, "monitor-uk", batch)
                if resp.get("status") == "success":
                    job_id = resp.get("data", {}).get("job")
                    lj = LanternJob()
                    lj.job_id = job_id
                    lj.account = acc.id
                    lj.status = "active"
                    lj.save()

    @classmethod
    def _needs_lantern_data(cls, apc):
        refresh = app.config.get("DATA_REFRESH_LANTERN", 15552000)
        cutoff = dates.before_now(refresh)
        ds = apc.lantern_lookup_datestamp
        if ds is not None and ds > cutoff:
            return False

        fields = app.config.get("MISSING_FIELD_TRIGGERS_LANTERN", [])
        for field in fields:
            vals = apc.objectpath(field)
            if vals is None:
                return True
            hasVal = False
            for v in vals:
                if v:      # not empty string, None or False
                    hasVal = True
            if not hasVal:
                return True
        return False

    @classmethod
    def _get_identifiers(cls, apc):
        ident = {}
        if apc.doi:
            ident["DOI"] = apc.doi
        if apc.pmcid:
            ident["PMCID"] = apc.pmcid
        if apc.pmid:
            ident["PMID"] = apc.pmid
        if len(ident.keys()) > 0:
            return ident
        return None

    @classmethod
    def _batch(cls, identifiers):
        size = app.config.get("BATCH_SIZE_LANTERN", 1000)
        batches = []
        lower = 0
        upper = size
        while upper < len(identifiers):
            batches.append(identifiers[lower:upper])
            lower = upper
            upper = upper + size
        batches.append(identifiers[lower:upper])
        return batches
