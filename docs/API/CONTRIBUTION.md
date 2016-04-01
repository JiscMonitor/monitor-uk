# API Documentation

This document is a working document describing the use of the various APIs available on Monitor UK.  It'll probably
need to be turned into proper documentation at some point.

## Request API

Intended for institutions.  
Requires system role "write_apc" for all operations.
All requests require an api_key
Makes a request to the public system to make a change in line with your data (i.e. it is not really CRUD)

## Create

    POST /api/v1/apc?api_key=<api_key>
    
    {JSON record body}
    
Record must conform to the data model specification (define this somewhere), or you will get a 400

The response body will be of the form

    {
        "status" : "created",
        "request_id" : "id of the request you just made",
        "public_id" : "id of the record when it appears in the public space"
    }

During crate, "public_id" will only be given to you if the record contains a DOI, and then this DOI will be used as
the public identifier.  Note that the record may not be immediately available via the public identifier - this may take several
seconds to several minutes.

If no DOI is provided in the record, there will be no public_id field, and you will need to locate the public identifier
for the record via the authenticated, or public search interfaces, before issuing updates to it.

## Retrieve

    GET /api/v1/apc/<id>?api_key=<api_key>
    
id may be one of:

* DOI, if one was provided
* opaque system identifier for published records (i.e. not the request_id)

You can get these ids out of the JSON response body of the create/update requests.

Note that you cannot retrieve a copy of the change request you made to the record via the Create, Update or Delete endpoints.  You can only
retrieve the most recent publicly available version of a record.

## Update

You can use either PUT or POST for this operation - the effect is the same

You can also POST to the Create endpoint, which is essentially the same.  If you provide a public identifier, you will create
an update request to that record.

    PUT /api/v1/apc/<public_id>?api_key=<api_key>
    
    POST /api/v1/apc/<public_id>?api_key=<api_key>
    POST /api/v1/apc?api_key=<api_key>
    
It is strongly recommended that you simply create new requests for the same record with a POST to /api/v1/apc

If you do wish to do an update to url which contains the public_id, you need to verify first that the record has
been made available under that id (it can take between a few seconds and a few minutes after the initial create).  If 
you attempt to update the record this way before the item has been made public, you will get a 404 and the update
will fail.

Depending on the URL you use, the response you receive may differ.  If you POST to /api/v1/apc, the response will
be identical to that of a Create operation.

If you POST/PUT to /api/v1/apc/<public_id> you will receive something of the form:

    {
        "status" : "updated",
        "request_id" : "id of the request you just made",
        "public_id" : "id of the record when it appears in the public space"
    }

## Delete

    DELETE /api/v1/apc/<public_id>?api_key=<api_key>
    
Calling delete on an item is asking that item to remove any reference to the APCs that were originally provided by your account.

If you do not have any APCs in this record, this request will fail with a 403

If you are the only contributor to this record, this request will remove the record from the public database

If you are one of several contributors, only APCs provided by you will be removed - all other APCs and metadata will remain.  
This operation does not remove other metadata that you provided - metadata is a permanent addition to the record, until
such time as all APCs by all contributors are removed from it