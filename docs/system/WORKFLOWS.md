# Data Workflows and Processing

The following processing workflows will be carried out on the data as it arrives in the system (for the first 
time or as an update) or is removed from the system.

## Create/Update

We make the assumption that a “new” record may not actually be new, and that a duplicate may exist.  Note 
that "Update and Create" are therefore the same operation in this system.  There are a number of identifiers
which may be considered "primary", which may be provided either in the URL space of the API, or as part of
the provided APC record:

* The public identifier as assigned by MUK to a published record
* The DOI
* The PubMed ID (PMID)
* The EuropePMC ID (PMCID)

![Create/Update](https://raw.githubusercontent.com/JiscMonitor/monitor-uk/develop/docs/system/WorkflowCreate.png)

The asynchronous step to obtain compliance information involve the identifiers in the public 
item to a set to be sent to the [Lantern](http://lantern.cottagelabs.com) compliance system (FIXME: exact nature of interaction tbd).  
These will be batch processed at appropriate intervals, and the resulting data re-incorporated into the public record.  
Each time a modification is made to a public record, the OA compliance status will be checked again.

Merging the new/updated record with an existing public record is as follws:

![Merge](https://raw.githubusercontent.com/JiscMonitor/monitor-uk/develop/docs/system/WorkflowMerge.png)

The updated record contains APCs from one institution (who delivered the update), and the existing record contains APCs from one or more 
institutions.  We remove any existing APCs from the institution doing the update, then replace them with the new APCs 
we’ve been told about.  Finally some basic bibliographic metadata enhancement takes place.

**Note that this process means that it is not possible to replace incorrectly set bibliographic data via the 
institutional API.**

## Delete

If an institution chooses to delete their APC record for whatever reason (e.g. it contained erroneous information), 
we remove that record from the public dataset if they were the only contributing institution, otherwise their 
association (via the APC payment references) will be removed from the record, but the record will continue to exist.  

**It is not be possible to back-out any article-level metadata changes provided by the deleting institution in this 
latter case.**

![Delete](https://raw.githubusercontent.com/JiscMonitor/monitor-uk/develop/docs/system/WorkflowDelete.png)

Separating an institution’s details from the existing record simply means removing any APC entries supplied by that institution, 
and leaving the remaining entries from other institutions untouched.
