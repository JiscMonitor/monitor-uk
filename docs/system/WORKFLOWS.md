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

Merging new/updated APC records with an existing public APC record is as follows:

![Merge](https://raw.githubusercontent.com/JiscMonitor/monitor-uk/develop/docs/system/WorkflowMerge.png)

The incoming request contains APCs from one owner (e.g. an institution who delivered the update), and the existing record contains APCs from one or more 
other owners (e.g. other institutions who supplied information about this APC record).  We remove any existing APCs owned by the account doing the update, then replace them with the new APCs 
we've been told about.  Finally some basic bibliographic metadata enhancement takes place.

**Note that this process means that it is not currently possible to replace incorrectly set bibliographic data via the 
institutional API, when the record comprises of APCs from more than one institution.**

## Delete

If an institution chooses to delete their APC record for whatever reason (e.g. it contained erroneous information), 
we remove that record from the public dataset if they were the only contributing institution, otherwise their 
association (via the APC payment references) will be removed from the record, but the record will continue to exist.  

**It is not be possible to back-out any article-level metadata changes provided by the deleting institution in this 
latter case.**

![Delete](https://raw.githubusercontent.com/JiscMonitor/monitor-uk/develop/docs/system/WorkflowDelete.png)

Separating an institution’s details from the existing record simply means removing any APC entries supplied by that institution, 
and leaving the remaining entries from other institutions untouched.


## Enhance

Records in the public dataset are available for enhancement by 3rd party services (in particular, [Lantern](https://lantern.cottagelabs.com), at this stage). 

Enhancement is carried out in several stages.  The first stage is to determin which items require enhancement, and to send their identifiers out to 
Lantern for processing:

![Create Jobs](https://raw.githubusercontent.com/JiscMonitor/monitor-uk/develop/docs/system/LanternJobCreation.png)

Once a job has been created, it is continually monitored until such time as it completes, then an Enhancement is created, which
is later merged with the public record, in a similar way to how information coming in from institutions is handled:

![Monitor Jobs](https://raw.githubusercontent.com/JiscMonitor/monitor-uk/develop/docs/system/MonitorLanternJobs.png)