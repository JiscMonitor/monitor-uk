# Monitor UK System Overview

Monitor UK is an aggregation of article publication records, to which are attached one or more APC payments
by individual institutions.  Data is stored in the system as JSON documents, see the [data models](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/system/DATA_MODELS.md) documentation
for information about their structure.

The application has a core public data set which forms the canonical information in the aggregation.
It is available via various public view mechanisms, such as a search API, graphical reports, and data exports.
It is constructed by data provided by individual institutions.  Each request from those institutions is stored 
as-is in a separate (non public) register of data operations (creates/updates and deletes), and then merged 
into the current public dataset (which may involve creating, overwriting or modifying existing records).

By taking this approach, we have a single canonical dataset, and a record of the actions taken to arrive at 
that dataset, which may be important in any data quality questions that arise later, by giving an 
administrator the ability to step through each institution’s contributions.

![ArchitectureOverview](https://raw.githubusercontent.com/JiscMonitor/monitor-uk/feature/es5x/docs/system/Architecture.png)

The diagram shows how organisations contribute data via the Contribution API, and that data makes its way
through the Workflow Engine and into the public dataset, where it becomes accessible via the Public Search API.  This 
public API then drives the Search interface and the Reports interface.

Meanwhile, records in the Public Dataset are monitored by the Enhancements Engine, which calls to 3rd party services
(just Lantern at this moment) and creates Enhancements in the Enhancements Register, which are in-turn picked up by
the Workflow Engine and contributed to the Public Dataset.

The components involved are as follows:

* [Contribution API](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/API/CONTRIBUTION.md) - This is the CRUD API through which institutions and Monitor Local will deliver APC records to the system.
* Request Register - this is a list (stored in Elasticsearch) of all requests to create, update or delete content via the Contribution API.  
All requests to the Contribution API create entries in the Request Register, which wait to be processed and actioned on the Public Dataset
* Workflow Engine - this is a process which picks up new entries in the Request Register and the Enhancements Register and applies them to the Public Dataset.  For Requests, this may be creating, updating
or deleting content from the Public Dataset.  For Enhancements this will be just adding new content to existing records in the Public Dataset
* Public Dataset - this is the curated set of APC records (stored in Elasticsearch) which represent the current state of the world according to Monitor UK.  It is created by the Workflow Engine processing Requests and Enhancements
* Public Search API - this is a search API which supports the full Elasticsearch query syntax, allowing for advanced search and reporting applications to be built on top of it
* [Institutional Search API](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/API/SEARCH.md) - This is a search API which provides a simplified query interface for use by 3rd parties (e.g. institutions), which supports a near-complete Elasticsearch query string interface
and allows institutions to limit results also to records that they provided themselves, the intention being that they can build management interfaces into their own systems if desired.
* Enhancements Engine - This examines the state of the Public Dataset on an ongoing basis, and determines if any record requires enhancement from a 3rd party service (in this case, the only such service
is Lantern).  If a record is suitable for enhancement, then requests to the 3rd party service are made, and any data which comes back is inserted into the Enhancements Register.
* Enhancements Register - this is a list (stored in Elasticsearch) of all enhancements to records in the Public Dataset
* Search UI - the search interface, as available via the web UI
* Reports UI - the reporting interface, as available via the web UI
* Account UI - area of the site for end-users and administrators to manage their user accounts
* Admin UI - area of the site that provides administrative features (such as user account and permissions management for administrators)

The different core technologies behind the functionality are shown in the below overlay:

![Technology](https://raw.githubusercontent.com/JiscMonitor/monitor-uk/develop/docs/system/Technology.png)

* For more information on the data in the system, see the [Data Models Documentation](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/system/DATA_MODELS.md)

* For more information on the workflow processes and the enhancemnets engine, see the [Workflow Documentation](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/system/WORKFLOWS.md)

* Code documentation can be found by checking out the repository and pointing your browser at the following locations

    file:///path/to/monitoruk/docs/js/index.html
    
    file:///path/to/monitoruk/docs/py/index.html
    
* For information on the API, see

    * [Contribution API](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/API/CONTRIBUTION.md)
    * [Search API](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/API/SEARCH.md)
    
* For information on running the system tests, see [Test Information](https://github.com/JiscMonitor/monitor-uk/blob/develop/service/tests/README.md)