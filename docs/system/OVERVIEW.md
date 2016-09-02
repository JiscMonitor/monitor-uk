# Monitor UK System Overview

The application has a core public data set which forms the canonical information in the aggregation.
It is available via various public view mechanisms, such as a search API, graphical reports, and data exports.
It is constructed by data provided by individual institutions.  Each request from those institutions is stored 
as-is in a separate (non public) register of data operations (creates/updates and deletes), and then merged 
into the current public dataset (which may involve creating, overwriting or modifying existing records).

By taking this approach, we have a single canonical dataset, and a record of the actions taken to arrive at 
that dataset, which may be important in any data quality questions that arise later, by giving an 
administrator the ability to step through each institution’s contributions.

![ArchitectureOverview](https://raw.githubusercontent.com/JiscMonitor/monitor-uk/develop/docs/system/Architecture.png)

The diagram shows how Institutions contribute data via the Institutional CRUD API, and that data makes its way
through the Workflow Engine and into the public dataset, where it becomes accessible via the Public Search API.  This 
public API then drives the Search interface and the Reports interface.

Meanwhile, records in the Public Dataset are monitored by the Enhancements Engine, which calls to 3rd party services
(just Lantern at this moment) and creates Enhancements in the Enhancements Register, which are in-turn picked up by
the Workflow Engine and contributed to the Public Dataset.

* For more information on the data in the system, see the [Data Models Documentation](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/system/DATA_MODELS.md)

* For more information on the workflow processes, see the [Workflow Documentation](https://github.com/JiscMonitor/monitor-uk/blob/develop/docs/system/WORKFLOWS.md)