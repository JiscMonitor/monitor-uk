"""
This module contains all the core system API, for all interactions with the aggregation.

If you need to do something with the data in the aggregation, you should endeavour to use the functions provided
here, as it will enforce all the correct workflows
"""
from service.models import Request, PublicAPC, WorkflowState, Enhancement
from octopus.core import app


class RequestAPIException(Exception):
    """
    Exception class for any exceptions thrown by the RequestApi
    """
    pass

class RequestApi(object):
    """
    Static class for providing methods for working with the Requests for change which come into the system
    """

    @classmethod
    def update(cls, record, account, public_id=None):
        """
        Record an "update" request, with the associated record data, requested by the given account

        :param record: The raw dict data (e.g. coming from the web API) which makes up the body of the request
        :param account: the account to carry out the request on behalf of
        :param public_id: The public id of a public record for which this is an update
        :return: the Request object that was created
        """
        if record is None:
            raise RequestAPIException("You can't call 'update' with a NoneType record argument")
        if account is None:
            raise RequestAPIException("You can't call 'update' with a NoneType account argument")

        req = Request()
        req.record = record
        req.owner = account.id
        req.action = "update"
        if public_id is not None:
            req.public_id = public_id

        req.save()
        return req

    @classmethod
    def delete(cls, record, account, public_id=None):
        """
        Record a "delete" request, with the associated (minimal) record data, requested by the given account

        Delete requests need only come with enough record data to identify the public record

        :param record: The mimimal record data for identifying the record
        :param account:    the account to carry out the request on behalf of
        :param public_id:  the public id of a public record for which this is a delete request
        :return: the Request object that was created
        """
        if record is None:
            raise RequestAPIException("You can't call 'delete' with a NoneType record argument")
        if account is None:
            raise RequestAPIException("You can't call 'delete' with a NoneType account argument")

        req = Request()
        req.record = record
        req.owner = account.id
        req.action = "delete"
        if public_id is not None:
            req.public_id = public_id

        req.save()
        return req

    @classmethod
    def find_request_by_identifier(cls, type, id, owner):
        """
        Find a request by the identifier, within the scope of a given owner

        :param type: the type of identifier (e.g. doi, pmcid, url, etc)
        :param id: the identifier
        :param owner: the owner of the request
        :return: The most recent request owned by that owner with that identifier
        """
        dao = Request()
        results = dao.find_by_identifier(type, id, owner)
        # results are ordered by date, so we want the latest one
        if len(results) > 0:
            return results[0]
        return None

class PublicApi(object):
    """
    Static class for providing methods for working with the Public records in the aggregation
    """

    ####################################################
    ## primary workflow entry points to the Public APC API

    @classmethod
    def publish(cls, source):
        """
        Publish a given Publishable object to the Public aggregation space.

        This method will create a Public APC record, and merge it with any existing, corresponding public
        record.  Note that if no public record exists, and the source does not contain an APC record, it will
        not be saved (though you will still get back a copy of the created object)

        :param source: a Request or Enhancement (or anything else that implements the Publishable interface)
        :return: the PublicAPC record that was created
        """
        pub = PublicApi.find_public_record(source)

        if pub is not None:
            pub = PublicApi.merge_public_apcs(source.make_public_apc(), pub)
            pub.save()
        else:
            pub = source.make_public_apc()
            if pub.has_apcs():
                pub.save()

        return pub

    @classmethod
    def remove(cls, req):
        """
        Remove all data associated with the given Request object from the Public space.

        Requests must identify an existing public record, and if they do, any APC data which is associated with
        that record which originates from the Request will be removed.  If this leaves no APC data in the Public space,
        the PublicAPC record will be deleted

        :param req: a Request object
        :return: None
        """
        pub = PublicApi.find_public_record(req)

        # if this is a request to remove something that doesn't exist, there's no more to do
        if pub is None:
            return

        PublicApi.separate_records(req, pub)

        if pub.has_apcs():
            pub.save()
        else:
            pub.delete()

    ####################################################
    ## supporting methods for the Public APC API

    @classmethod
    def find_public_record(cls, req):
        """
        Find a single public record which could be considered the same as the document in the
        supplied request.

        This will look at identifiers in the following order of precedence:

        1. by public id
        2. By DOI
        3. By PMID
        4. By PMCID
        5. By URL

        If more than one match is made at any point, a warning will be written to the logs, and the
        first result (which is basically arbitrary) will be returned.

        :param req: Request object containing data to be used to find the public record
        :return:    The public record, or None if no candidate found
        """

        dao = PublicAPC()

        if req.public_id is not None:
            pub = dao.pull(req.public_id)
            if pub is not None:
                return pub

        if req.doi is not None:
            pub = PublicApi.find_public_record_by_identifier("doi", req.doi)
            if pub is not None:
                return pub

        if req.pmid is not None:
            pub = PublicApi.find_public_record_by_identifier("pmid", req.pmid)
            if pub is not None:
                return pub

        if req.pmcid is not None:
            pub = PublicApi.find_public_record_by_identifier("pmcid", req.pmcid)
            if pub is not None:
                return pub

        if req.url is not None:
            pub = PublicApi.find_public_record_by_identifier("url", req.url)
            if pub is not None:
                return pub

        # if we get to here, there is no record for this id
        return None

    @classmethod
    def find_public_record_by_identifier(cls, type, id):
        """
        Find a single public record which corresponds to the given identifier.  If more than one record are present,
        this will return the first one encountered, which is essentially random.

        :param type: the identifier type (e.g. doi, pmid, pmcid, url)
        :param id: the identifier
        :return: a PublicAPC record if one is found otherwise None
        """
        dao = PublicAPC()

        if type == "doi":
            pubs = dao.find_by_doi(id)
            if len(pubs) > 1:
                app.logger.warn(u"Multiple public records found for DOI {x}".format(x=id))
                return None
            if len(pubs) > 0:
                return pubs[0]

        if type == "pmid":
            pubs = dao.find_by_pmid(id)
            if len(pubs) > 1:
                app.logger.warn(u"Multiple public records found for PMID {x}".format(x=id))
                return None
            if len(pubs) > 0:
                return pubs[0]

        if type == "pmcid":
            pubs = dao.find_by_pmcid(id)
            if len(pubs) > 1:
                app.logger.warn(u"Multiple public records found for PMCID {x}".format(x=id))
                return None
            if len(pubs) > 0:
                return pubs[0]

        if type == "url":
            pubs = dao.find_by_url(id)
            if len(pubs) > 1:
                app.logger.warn(u"Multiple public records found for URL {x}".format(x=id))
                return None
            if len(pubs) > 0:
                return pubs[0]

    @classmethod
    def merge_public_apcs(cls, source, target):
        """
        Merge the source record into the target record.  Both records should be PublicAPC instances

        What gets returned from this is savable as the replacement public record - the target record passed
        in is not modified in place

        :param source:  the source PublicAPC record
        :param target:  the target PublicAPC record
        :return:    a new PublicAPC record which can be taken to replace the target
        """
        # first make a copy of the target, which is the thing we'll eventually return
        target = target.copy()

        source_owners = source.list_owners()
        for o in source_owners:
            target.remove_apcs_by_owner(o)

        # if there are no apcs left, this means that the source record is definitive
        if len(target.apc_records) == 0:
            target.overwrite(source)
            return target

        for o in source_owners:
            source_apcs = source.get_apcs_by_owner(o)
            for apc in source_apcs:
                target.add_apc_for_owner(o, apc)

        target = PublicApi.enhance_metadata(source, target)

        return target

    @classmethod
    def separate_records(cls, source, target):
        """
        Separate the source record data from the target record

        Essentially, this just removes any APCs from the target that were owned by the source owner

        This method acts on the target in-place.

        :param source:  The source record to separate from the target
        :param target: The target record
        :return: None.
        """
        # ok, this method turned out to be a lot easier than expected!
        # we're not currently attempting to roll-back any metadata contributions,
        # but if we were, this is the place to do it.
        target.remove_apcs_by_owner(source.owner)

    @classmethod
    def enhance_metadata(cls, source, target):
        """
        Enhance the bibliographic metadata in the target with metadata from the source

        This method acts on the target in-place

        :param source: the source PublicAPC record to obtain new bibliographic data from
        :param target: the target PublicAPC record to enhance
        :return: the target record
        """
        target.merge_records(source)
        return target

class WorkflowApi(object):
    """
    Static class for providing methods for enforcing the data processing workflows
    """

    @classmethod
    def process_requests(cls):
        """
        Go through any new requests (since this method last ran) and process them.  This will apply the creates,
        updates and deletes to the public space

        :return:
        """
        # first, pick up our current state from storage
        workflow_dao = WorkflowState()
        wfs = workflow_dao.pull("requests")

        # if we don't have a current state, make one
        if wfs is None:
            wfs = WorkflowState()
            wfs.id = "requests"

        # get the oldest page of requests and process them
        dao = Request()
        requests = dao.list_all_since(wfs.last_request)     # produces a generator

        for r in requests:
            try:
                # if the request was created at the time of the last request processed, it is possible it arrived
                # before or after the cut-off.  As we don't have any more than second-level granularity in the timing,
                # we also need to check to see whether it was one of the ids processed during that second
                if r.created_date == wfs.last_request and wfs.is_processed(r.id):
                    # if it was created at that time, and it was one of the ones processed, we can skip it
                    continue

                # if the request is from a later time, or was not processed during the last run, then do the usual
                # processing
                if r.action == "update":
                    PublicApi.publish(r)
                elif r.action == "delete":
                    PublicApi.remove(r)

                # now, revisit the timing of this request.  If the time is the same as the last request date, this is a
                # request which came in during that same second, but was not processed at the time because it was at the
                # wrong end of the second.  In that case, we just need to add the id to the list of records from that second
                # which have now been processed
                if r.created_date == wfs.last_request:
                    wfs.add_processed(r.id)
                else:
                    # otherwise, this is a whole new second, and we can forget everything that went before and start afresh.
                    wfs.last_request = r.created_date
                    wfs.already_processed = [r.id]
            except:
                wfs.save(blocking=True)
                raise

        wfs.save(blocking=True)

    @classmethod
    def process_enhancements(cls):
        """
        Go through any new Enhancements (since this method last ran) and process them.

        :return:
        """
        # first, pick up our current state from storage
        workflow_dao = WorkflowState()
        wfs = workflow_dao.pull("enhancements")

        # if we don't have a current state, make one
        if wfs is None:
            wfs = WorkflowState()
            wfs.id = "enhancements"

        # get the oldest page of enhancements and process them
        dao = Enhancement()
        enhancements = dao.list_all_since(wfs.last_request)     # produces a generator

        for e in enhancements:
            try:
                # if the request was created at the time of the last request processed, it is possible it arrived
                # before or after the cut-off.  As we don't have any more than second-level granularity in the timing,
                # we also need to check to see whether it was one of the ids processed during that second
                if e.created_date == wfs.last_request and wfs.is_processed(e.id):
                    # if it was created at that time, and it was one of the ones processed, we can skip it
                    continue

                # if the request is from a later time, or was not processed during the last run, then do the usual
                # processing, which in this case is just to publish the data, and let the merge handle it
                PublicApi.publish(e)

                # now, revisit the timing of this request.  If the time is the same as the last request date, this is a
                # request which came in during that same second, but was not processed at the time because it was at the
                # wrong end of the second.  In that case, we just need to add the id to the list of records from that second
                # which have now been processed
                if e.created_date == wfs.last_request:
                    wfs.add_processed(e.id)
                else:
                    # otherwise, this is a whole new second, and we can forget everything that went before and start afresh.
                    wfs.last_request = e.created_date
                    wfs.already_processed = [e.id]
            except:
                wfs.save(blocking=True)
                raise

        wfs.save(blocking=True)