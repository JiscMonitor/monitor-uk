"""
Module which handles all the Lantern integration needs
"""

from octopus.core import app
from octopus.modules.lantern import client
from octopus.lib import dates, dataobj

from service.models import MonitorUKAccount, PublicAPC, LanternJob, Enhancement


class LanternApi(object):
    """
    Static class which provides methods for integrating with Lantern
    """

    @classmethod
    def make_new_jobs(cls):
        """
        Send new requests to lantern, and record the jobs that are created.

        This method looks for accounts who have Lantern credentials, looks for PublicAPC records belonging to those
        accounts which could benefit from lookup in Lantern,

        :return:
        """
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
                    apc.lantern_lookup = dates.now()
                    apc.save()

            # if there are no identifiers, no need to do any more
            if len(identifiers) == 0:
                continue

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
    def check_jobs(cls):
        """
        Check any existing Lantern jobs for progress, and process any that have completed

        :return:
        """
        dao = LanternJob()

        delay = app.config.get("JOB_LOOKUP_DELAY_LANTERN", 3600)
        cutoff = dates.before_now(delay)
        gen = dao.list_active(cutoff, keepalive="30m")

        for job in gen:
            acc = MonitorUKAccount.pull(job.account)
            lc = client.Lantern(api_key=acc.lantern_api_key)
            prog = lc.get_progress(job.job_id)
            if prog.get("status") == "success":
                pc = prog.get("data",  {}).get("progress", 0)
                if pc != 100:
                    # this will update the last_updated date, which means we won't look at it again for a while
                    job.save()
                    continue

                # if we get here, the job is complete so we need to retrieve it
                results = lc.get_results(job.job_id)
                if results.get("status") == "success":
                    for res in results.get("data", []):
                        enhancement = LanternApi._xwalk(res)
                        enhancement.save()

                # set the job as complete
                job.status = "complete"
                job.save()

    @classmethod
    def _needs_lantern_data(cls, apc):
        """
        Check to see if the PublicAPC record could benefit from Lantern lookup

        :param apc:
        :return:
        """
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
        """
        Get the identifiers from the PublicAPC

        :param apc:
        :return:
        """
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
        """
        Batch the identifiers up for submission

        :param identifiers:
        :return:
        """
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

    @classmethod
    def _xwalk(cls, result):
        """
        Crosswalk the Lantern result to an Enhancement object

        :param result:
        :return:
        """
        journal_record = result.get("journal", {})

        # publication date
        publication_date = None
        if journal_record is not None:
            publication_date = journal_record.get("dateOfPublication")
            try:
                dates.parse(publication_date)
            except:
                publication_date = None

        # Version
        is_aam = result.get("is_aam", False)
        version = None
        if is_aam is not None and is_aam is not False:
            version = "AAM"

        # authors
        authors = result.get("author", [])
        eauthors = []
        if authors is not None:
            for author in authors:
                ea = {}
                if author.get("fullName") is not None:
                    ea["name"] = author.get("fullName")
                if author.get("affiliation") is not None:
                    ea["affiliation"] = [{"name" : author.get("affiliation")}]
                if len(ea.keys()) > 0:
                    eauthors.append(ea)

        # publisher
        publisher = result.get("publisher")

        # DOI
        doi = result.get("doi")

        # pmcid
        pmcid = result.get("pmcid")

        # pmid
        pmid = result.get("pmid")

        journal = None
        issn = None
        essn = None
        oa_type = "unknown"

        if journal_record is not None:
            # journal title
            journal = journal_record.get("title")

            # issn
            issn = journal_record.get("issn")

            # essn
            essn = journal_record.get("eissn")

            # oa type
            in_doaj = journal_record.get("in_doaj")
            if in_doaj is not None:
                if in_doaj is True:
                    oa_type = "oa"
                else:
                    oa_type = "hybrid"

        # self_archiving policies
        archiving = result.get("archiving")
        archive_preprint = False
        archive_postprint = False
        archive_pdf = False
        if archiving is not None:
            archive_preprint = archiving.get("preprint", False)
            archive_postprint = archiving.get("postprint", False)
            archive_pdf = archiving.get("pdf", False)

        # embargo policies
        embargo = result.get("embargo")
        embargo_preprint = False
        embargo_postprint = False
        embargo_pdf = False
        if embargo is not None:
            embargo_preprint = result.get("embargo", {}).get("preprint", False)
            if not isinstance(embargo_preprint, bool):
                try:
                    embargo_preprint = int(embargo_preprint)
                except: pass
            embargo_postprint = result.get("embargo", {}).get("postprint", False)
            if not isinstance(embargo_postprint, bool):
                try:
                    embargo_postprint = int(embargo_postprint)
                except: pass
            embargo_pdf = result.get("embargo", {}).get("pdf", False)
            if not isinstance(embargo_pdf, bool):
                try:
                    embargo_pdf = int(embargo_pdf)
                except: pass

        # grant funding
        projects = []
        grants = result.get("grants", [])
        if grants is not None:
            for g in grants:
                project = {}
                grant_number = g.get("grantId")
                if grant_number is not None:
                    project["grant_number"] = grant_number
                agency = g.get("agency")
                if agency is not None:
                    project["funder_name"] = agency
                if len(project.keys()) > 0:
                    projects.append(project)

        # licence
        licence_type = None
        free_to_read = False
        licence = result.get("licence")
        if licence != "non-standard-licence":
            if licence == "free-to-read":
                free_to_read = True
            elif licence != "unknown":
                licence_type = licence

        # provenance
        prov = result.get("provenance", [])
        if prov is not None:
            prov = "Record enhanced via Lantern (not all data necessarily used), which provided provenance information: " + "; ".join(prov)

        # repository
        repository = result.get("repositories", [])
        rrecords = []
        if repository is not None:
            for r in repository:
                obj = {}
                if isinstance(r, basestring):
                    obj["repo_name"] = r
                    obj["metadata"] = "True"
                    obj["fulltext"] = "Unknown"
                    obj["machine_readable_fulltext"] = "Unknown"
                elif isinstance(r, dict):
                    obj["metadata"] = "True"
                    obj["fulltext"] = "Unknown"
                    obj["machine_readable_fulltext"] = "Unknown"
                    if "name" in r:
                        obj["repo_name"] = r["name"]
                    if "url" in r:
                        obj["repo_url"] = r["url"]
                    if "fulltexts" in r and len(r["fulltexts"]) > 0:
                        obj["record_url"] = " | ".join(r["fulltexts"])

                if len(obj.keys()) > 0:
                    rrecords.append(obj)

        # article title
        title = result.get("title")

        # assign the values to the object
        do = dataobj.DataObj()

        if publication_date is not None:
            do._set_single("rioxxterms:publication_date", publication_date)
        if version is not None:
            do._set_single("rioxxterms:version", version)
        if len(eauthors) > 0:
            do._set_single("rioxxterms:author", eauthors)
        if publisher is not None:
            do._set_single("dcterms:publisher.name", publisher)
        if doi is not None:
            do._add_to_list("dc:identifier", {"type" : "doi", "id" : doi})
        if pmcid is not None:
            do._add_to_list("dc:identifier", {"type" : "pmcid", "id" : pmcid})
        if pmid is not None:
            do._add_to_list("dc:identifier", {"type" : "pmid", "id" : pmid})
        if journal is not None:
            do._set_single("dc:source.name", journal)
        if issn is not None:
            do._add_to_list("dc:source.identifier", {"type" : "issn", "id" : issn})
        if issn is not None:
            do._add_to_list("dc:source.identifier", {"type" : "e-issn", "id" : essn})
        if oa_type is not None:
            do._set_single("dc:source.oa_type", oa_type)
        if isinstance(archive_preprint, basestring):
            do._set_single("dc:source.self_archiving.preprint.policy", archive_preprint)
        if isinstance(archive_postprint, basestring):
            do._set_single("dc:source.self_archiving.postprint.policy", archive_postprint)
        if isinstance(archive_pdf, basestring):
            do._set_single("dc:source.self_archiving.publisher.policy", archive_pdf)
        if isinstance(embargo_preprint, int) and not isinstance(embargo_preprint, bool):
            do._set_single("dc:source.self_archiving.preprint.embargo", embargo_preprint)
        if isinstance(embargo_postprint, int) and not isinstance(embargo_postprint, bool):
            do._set_single("dc:source.self_archiving.postprint.embargo", embargo_postprint)
        if isinstance(embargo_pdf, int) and not isinstance(embargo_pdf, bool):
            do._set_single("dc:source.self_archiving.publisher.embargo", embargo_pdf)
        if len(projects) > 0:
            do._set_single("rioxxterms:project", projects)
        if licence_type is not None:
            do._add_to_list("ali:license_ref", {"type" : licence_type})
        if free_to_read is True:
            do._set_single("ali:free_to_read.free_to_read", free_to_read)
        do._add_to_list("jm:provenance", prov)
        if len(rrecords) > 0:
            do._set_single("jm:repository", rrecords)
        if title is not None:
            do._set_single("dc:title", title)

        # build and return an Enhancement object around the data
        e = Enhancement({"record" : do.data})
        return e

