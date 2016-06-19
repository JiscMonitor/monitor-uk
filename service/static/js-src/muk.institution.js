$.extend(muk, {
    institution: {

        newInstitutionReportTemplate: function (params) {
            if (!params) { params = {} }
            muk.institution.InstitutionReportTemplate.prototype = edges.newTemplate(params);
            return new muk.institution.InstitutionReportTemplate(params);
        },
        InstitutionReportTemplate: function (params) {
            // later we'll store the edge instance here
            this.edge = false;

            // bits that are hidden off-screen
            this.hidden = {};

            // ids of the tabs that are in the layout
            this.tabIds = [];

            this.namespace = "muk-institution-report-template";

            this.draw = function (edge) {
                this.edge = edge;

                var panelClass = edges.css_classes(this.namespace, "panel");
                var topClass = edges.css_classes(this.namespace, "top");
                var filtersClass = edges.css_classes(this.namespace, "filters");
                var filterClass = edges.css_classes(this.namespace, "filter");
                var tabViewClass = edges.css_classes(this.namespace, "tabview");
                var tabContainerClass = edges.css_classes(this.namespace, "tab-container");
                var tabLabelBarClass = edges.css_classes(this.namespace, "tab-bar");
                var tabClass = edges.css_classes(this.namespace, "tab");
                var storyClass = edges.css_classes(this.namespace, "stories");
                var dataClass = edges.css_classes(this.namespace, "data");
                var filterHeaderClass = edges.css_classes(this.namespace, "filter-header");

                // the top strap controls
                var topstrap = edge.category("top");
                var topContainers = "";
                if (topstrap.length > 0) {
                    for (var i = 0; i < topstrap.length; i++) {
                        topContainers += '<div class="row"><div class="col-md-12"><div id="' + topstrap[i].id + '"></div></div></div>';
                    }
                }

                // the left-hand-side controls
                var lhs = edge.category("lhs");
                var controlContainers = "";
                for (var i = 0; i < lhs.length; i++) {
                    controlContainers += '<div class="' + filterClass + '" id="' + lhs[i].id + '"></div>';
                }

                // the navigation tabs themselves
                var tabs = edge.category("tab");

                var tabLabels = "";
                var tabContents = "";

                for (var i = 0; i < tabs.length; i++) {
                    var tab = tabs[i];
                    var containerId = edges.css_id(this.namespace, "tab-" + tab.id);
                    var linkId = edges.css_id(this.namespace, "link-" + tab.id);

                    this.tabIds.push(tab.id);
                    tabLabels += '<li><a href="#" id="' + linkId + '" data-id="' + tab.id + '"><strong>' + tab.display + '</strong></a></li>';
                    tabContents += '<div class="' + tabContainerClass + '" id="' + containerId + '">\
                            <div class="row">\
                                <div class="col-md-12"> \
                                    <div class="' + tabClass + '" id="' + tab.id + '"></div>\
                                </div> \
                            </div>\
                        </div>';
                }
                tabLabels = '<ul class="nav nav-tabs navbar-right">' + tabLabels + '</ul>';

                // the story entries
                var stories = edge.category("story");
                var storyContainers = "";
                if (stories.length > 0) {
                    for (var i = 0; i < stories.length; i++) {
                        storyContainers += '<div class="row"><div class="col-md-12"><div id="' + stories[i].id + '"></div></div></div>';
                    }
                }

                // the data tables
                var data = edge.category("data");
                var dataContainers = "";
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        dataContainers += '<div class="row"><div class="col-md-12"><div id="' + data[i].id + '"></div></div></div>';
                    }
                }

                var filterHeader = '<div class="' + filterHeaderClass + '"><div class="row"><div class="col-md-12"><span class="glyphicon glyphicon-filter"></span>&nbsp;&nbsp;FILTER</div></div></div>';

                var template = '<div class="' + panelClass + '"> \
                    <div class="' + topClass + '">' + topContainers + '</div>\
                    <div class="row">\
                        <div class="col-md-3">\
                            <div class="' + filtersClass + '">' + filterHeader + controlContainers + '</div>\
                        </div>\
                        <div class="col-md-9">\
                            <div class="' + tabViewClass + '">\
                                <div class="' + tabLabelBarClass + '"><div class="row"><div class="col-md-12">' + tabLabels + '</div></div></div>\
                                ' + tabContents + '\
                            </div>\
                        </div>\
                    </div>\
                    <div class="' + storyClass + '">' + storyContainers + '</div>\
                    <div class="' + dataClass + '">' + dataContainers + '</div>\
                </div>';

                edge.context.html(template);

                // hide the graphs while while they are rendered
                // (note we use this approach, as setting display:none produces weird effects
                // in space-conscious displays like graphs
                for (var i = 0; i < this.tabIds.length; i++) {
                    var tabSelector = edges.css_id_selector(this.namespace, "tab-" + this.tabIds[i]);
                    this.hideOffScreen(tabSelector);
                }

                // set up the initial tab to view
                var startWith = this.tabIds[0];
                this.activateTab(startWith);

                // now bind the click handler to the tabs
                for (var i = 0; i < this.tabIds.length; i++) {
                    var linkSelector = edges.css_id_selector(this.namespace, "link-" + this.tabIds[i]);
                    edges.on(linkSelector, "click", this, "tabClicked");
                }
            };

            this.hideOffScreen = function (selector) {
                if (selector in this.hidden) {
                    return
                }
                var el = this.edge.jq(selector);
                this.hidden[selector] = {"position": el.css("position"), "margin": el.css("margin-left")};
                el.css("position", "absolute").css("margin-left", -9999);
            };

            this.bringIn = function (selector) {
                if (!this.hidden[selector]) {
                    return;
                }
                var pos = this.hidden[selector].position;
                var mar = this.hidden[selector].margin;
                var el = this.edge.jq(selector);
                el.css("position", pos).css("margin-left", mar);
                delete this.hidden[selector];
            };

            this.activateTab = function (activate) {
                var tabs = this.edge.category("tab");
                for (var i = 0; i < tabs.length; i++) {
                    var tab = tabs[i];
                    var tabSelector = edges.css_id_selector(this.namespace, "tab-" + tab.id);
                    var linkSelector = edges.css_id_selector(this.namespace, "link-" + tab.id);
                    if (tab.id === activate) {
                        this.bringIn(tabSelector);
                        this.edge.jq(linkSelector).parent().addClass("active");
                    } else {
                        this.hideOffScreen(tabSelector);
                        this.edge.jq(linkSelector).parent().removeClass("active");
                    }
                }
            };

            this.tabClicked = function (element) {
                var id = $(element).attr("data-id");
                this.activateTab(id);
            };
        },

        newStory : function (params) {
            if (!params) { params = {} }
            muk.institution.Story.prototype = edges.newComponent(params);
            return new muk.institution.Story(params);
        },
        Story : function(params) {

        },

        reportDF : function(params) {
            var ch = params.chart;
            var valueFunction = params.valueFunction;
            var seriesKey = params.seriesKey;

            var data_series = [];
            if (!ch.edge.result) {
                return data_series;
            }

            // we need to make sure that we only extract data for institutions and publishers that are in
            // the filter list
            var instFilters = ch.edge.currentQuery.listMust(es.newTermsFilter({field: "record.jm:apc.organisation_name.exact"}));
            var pubFilters = ch.edge.currentQuery.listMust(es.newTermsFilter({field: "record.dcterms:publisher.name.exact"}));

            // if there are no current institution filters, we don't want to show anything
            if (instFilters.length === 0) {
                return data_series;
            }

            var series = {};
            series["key"] = seriesKey;
            series["values"] = [];

            var inst_buckets = ch.edge.result.buckets("institution");
            for (var i = 0; i < inst_buckets.length; i++) {
                var ibucket = inst_buckets[i];
                var ikey = ibucket.key;

                // if the institution in the aggregation is not in the filter list ignore it
                // (this can happen for records where there's more than one institution on the APC)
                var skip = false;
                for (var j = 0; j < instFilters.length; j++) {
                    var filt = instFilters[j];
                    if (!filt.has_term(ikey)) {
                        skip = true;
                        break;
                    }
                }
                if (skip) {
                    continue;
                }

                var value = valueFunction(ibucket);
                series["values"].push({label: ikey, value: value});
            }

            data_series.push(series);
            return data_series;
        },

        apcCountDF : function(ch) {
            return muk.institution.reportDF({chart: ch, seriesKey: "Number of APCs", valueFunction: function(bucket) { return bucket.doc_count }});
        },
        apcExpenditureDF : function(ch) {
            return muk.institution.reportDF({chart: ch, seriesKey: "Total expenditure", valueFunction: function(bucket) { return bucket.institution_stats.sum }});
        },
        avgAPCDF : function(ch) {
            return muk.institution.reportDF({chart: ch, seriesKey: "Average APC Cost",  valueFunction: function(bucket) { return bucket.institution_stats.avg }});
        },

        tableData : function(charts) {
            var seriesNames = {
                "apc_count" : "APC Count",
                "total_expenditure" : "Total expenditure",
                "mean" : "Average APC cost"
            };

            var rows = {};
            for (var i = 0; i < charts.length; i++) {
                var chart = charts[i];
                if (!chart.dataSeries) {
                    continue;
                }
                var dataSeries = chart.dataSeries;
                for (var j = 0; j < dataSeries.length; j++) {
                    var ds = dataSeries[j];
                    for (var k = 0; k < ds.values.length; k++) {
                        var val = ds.values[k];
                        var inst = val.label;
                        var num = val.value;

                        // var rowId = inst + " - " + seriesNames[chart.id];
                        var row = {};
                        if (inst in rows) {
                            row = rows[inst];
                        }

                        var col = seriesNames[chart.id];
                        row[col] = num.toFixed(2);
                        rows[inst] = row;
                    }
                }
            }

            var rowNames = Object.keys(rows);
            rowNames.sort();

            var table = [];
            for (var i = 0; i < rowNames.length; i++) {
                var obj = rows[rowNames[i]];
                obj["Institution"] = rowNames[i];
                table.push(obj);
            }

            return table;
        },

        makeInstitutionReport : function(params) {
            if (!params) { params = {} }
            var selector = edges.getParam(params.selector, "#muk_institution");

            var base_query = es.newQuery();
            base_query.addAggregation(
                es.newTermsAggregation({
                    name: "institution",
                    field: "record.jm:apc.organisation_name.exact",
                    size: 10,      // actually, the size of this will be tightly controlled by the filters so this is just a random large-ish number
                    aggs : [
                        es.newStatsAggregation({
                            name : "institution_stats",
                            field: "index.amount_inc_vat"
                        })
                    ]
                })
            );

            /*
            var preflight = es.newQuery({size: 0});
            preflight.addAggregation(
                es.newStatsAggregation({
                    name: "total_stats",
                    field: "index.amount_inc_vat"
                })
            );
            preflight.addAggregation(
                es.newCardinalityAggregation({
                    name: "publisher_count",
                    field: "record.dcterms:publisher.name.exact"
                })
            );
            */

            // FIXME: actually we need to first find out if the institution is listed, and only then load the
            // relevant opening query
            var opening_query = es.newQuery();
            if (myInstituion && myInstituion != "") {
                opening_query.addMust(
                    es.newTermsFilter({
                        field: "record.jm:apc.organisation_name.exact",
                        values: [myInstituion]
                    })
                )
            }

            var e = edges.newEdge({
                selector: selector,
                template: muk.institution.newInstitutionReportTemplate(),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
                //preflightQueries : {
                //    uk_mean : preflight
                //},
                baseQuery : base_query,
                openingQuery : opening_query,
                components: [
                    edges.newMultiDateRangeEntry({
                        id : "date_range",
                        display: "Report Period:",
                        fields : [
                            {field : "record.rioxxterms:publication_date", display: "Publication Date"},
                            {field : "record.jm:apc.date_applied", display: "APC Application"},
                            {field : "record.jm:apc.date_paid", display: "APC Paid"}
                        ],
                        autoLookupRange: true,
                        category : "top"
                    }),
                    edges.newORTermSelector({
                        id: "institution",
                        field: "record.jm:apc.organisation_name.exact",
                        display: "Compare Institutions",
                        lifecycle: "static",
                        size: 10000,
                        category: "lhs",
                        renderer : edges.bs3.newORTermSelectorRenderer({
                            open: true,
                            togglable: false,
                            showCount: false,
                            hideEmpty: true
                        })
                    }),
                    edges.newRefiningANDTermSelector({
                        id : "publisher",
                        field : "record.dcterms:publisher.name.exact",
                        display : "Publisher",
                        size: 10000,
                        category: "lhs",
                        orderBy: "term",
                        orderDir: "asc",
                        renderer : edges.bs3.newRefiningANDTermSelectorRenderer({
                            hideInactive: true,
                            open: true,
                            togglable: false,
                            controls: false
                        })
                    }),
                    edges.newRefiningANDTermSelector({
                        id : "oa_type",
                        //field : "record.dc:source.oa_type.exact",             // fixme: is this supposed be the normalised field?
                        field : "record.rioxxterms:type.exact",
                        display : "Journal type",
                        category: "lhs",
                        renderer : edges.bs3.newRefiningANDTermSelectorRenderer({
                            open: true,
                            togglable: false,
                            controls: false
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "apc_count",
                        display: "Number of APCs",
                        dataFunction: muk.institution.apcCountDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "Select one or more institutions on the left",
                            legend: false
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "total_expenditure",
                        display: "Total expenditure",
                        dataFunction: muk.institution.apcExpenditureDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "Select one or more institutions on the left",
                            legend: false
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "mean",
                        display: "Average APC Cost",
                        dataFunction: muk.institution.avgAPCDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "Select one or more institutions on the left",
                            legend: false
                        })
                    }),
                    muk.institution.newStory({}), // FIXME: not clear what the story is
                    edges.newChartsTable({
                        id: "data_table",
                        display: "Raw Data",
                        category: "data",
                        chartComponents: ["apc_count", "total_expenditure", "mean"],
                        tabularise: muk.institution.tableData,
                        renderer : edges.bs3.newTabularResultsRenderer({
                            fieldDisplay : [
                                {field: "Institution", display: ""}
                            ],
                            displayListedOnly: false,
                            download: true,
                            downloadText : "download as csv"
                        })
                    })
                ]
            });

            muk.activeEdges[selector] = e;
        }
    }
});