from service.models import Request, PublicAPC
from octopus.core import app

class RequestAPIException(Exception):
    pass

class RequestApi(object):

    @classmethod
    def update(cls, record, account, public_id=None):
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
    def delete(cls, record, account, public_id):
        if record is None:
            raise RequestAPIException("You can't call 'delete' with a NoneType record argument")
        if account is None:
            raise RequestAPIException("You can't call 'delete' with a NoneType account argument")
        if public_id is None:
            raise RequestAPIException("You can't call 'delete' with a NoneType public_id argument")

        req = Request()
        req.record = record
        req.owner = account.id
        req.action = "delete"
        req.public_id = public_id

        req.save()
        return req

class PublicApi(object):

    ####################################################
    ## primary entry points to the Public APC API
    @classmethod
    def publish(cls, req):
        pub = PublicApi.find_public_record(req)

        if pub is not None:
            PublicApi.merge_records(req.make_public_apc(), pub)
            pub.save()
        else:
            pub = req.make_public_apc()
            pub.save()

        return pub

    @classmethod
    def remove(cls, req):
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
            pubs = dao.find_by_doi(req.doi)
            if len(pubs) > 1:
                app.logger.warn(u"Multiple public records found for DOI {x}".format(x=req.doi))
            if len(pubs) > 0:
                return pubs[0]

        if req.pmid is not None:
            pubs = dao.find_by_pmid(req.pmid)
            if len(pubs) > 1:
                app.logger.warn(u"Multiple public records found for PMID {x}".format(x=req.pmid))
            if len(pubs) > 0:
                return pubs[0]

        if req.pmcid is not None:
            pubs = dao.find_by_pmcid(req.pmcid)
            if len(pubs) > 1:
                app.logger.warn(u"Multiple public records found for PMCID {x}".format(x=req.pmcid))
            if len(pubs) > 0:
                return pubs[0]

        if req.url is not None:
            pubs = dao.find_by_url(req.url)
            if len(pubs) > 1:
                app.logger.warn(u"Multiple public records found for URL {x}".format(x=req.url))
            if len(pubs) > 0:
                return pubs[0]

        # if we get to here, there is no record for this id
        return None

    @classmethod
    def merge_records(cls, source, target):
        """
        Merge the source record into the target record.  Both records should be PublicAPC instances

        :param source:
        :param target:
        :return:
        """
        source_owners = source.list_owners()
        for o in source_owners:
            target.remove_apcs_by_owner(o)

        if len(target.apc_records) == 0:
            return source

        for o in source_owners:
            source_apcs = source.get_apcs_by_owner(o)
            for apc in source_apcs:
                target.add_apc_for_owner(o, apc)

        target = PublicApi.enhance_metadata(source, target)

        return target

    @classmethod
    def separate_records(cls, source, target):
        # ok, this method turned out to be a lot easier than expected!
        # we're not currently attempting to roll-back any metadata contributions,
        # but if we were, this is the place to do it.
        target.remove_apcs_by_owner(source.owner)

    @classmethod
    def enhance_metadata(cls, source, target):
        target.merge_records(source)
        return target

# FIXME: I think this will probably go away, as all content will be delivered fully enhanced, or not enhanced at all
class EnhancementsApi(object):

    @classmethod
    def enhance(cls, pub):
        pass