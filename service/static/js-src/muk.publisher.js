$.extend(muk, {
    publisher: {

        newPublisherReportTemplate: function (params) {
            if (!params) { params = {} }
            muk.publisher.PublisherReportTemplate.prototype = edges.newTemplate(params);
            return new muk.publisher.PublisherReportTemplate(params);
        },
        PublisherReportTemplate: function (params) {
            // later we'll store the edge instance here
            this.edge = false;

            // bits that are hidden off-screen
            this.hidden = {};

            // ids of the tabs that are in the layout
            this.tabIds = [];

            this.namespace = "muk-publisher-report-template";

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
                var loadingClass = edges.css_classes(this.namespace, "loading");

                // the loading bar
                var loading = edge.category("loading");
                var loadContainers = "";
                if (loading.length > 0) {
                    for (var i = 0; i < loading.length; i++) {
                        loadContainers += '<div class="row"><div class="col-md-12"><div id="' + loading[i].id + '"></div></div></div>';
                    }
                }

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
                    <div class="' + loadingClass + '">' + loadContainers + '</div>\
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
            muk.publisher.Story.prototype = edges.newComponent(params);
            return new muk.publisher.Story(params);
        },
        Story : function(params) {
            this.avgCount = false;
            this.avgExp = false;
            this.avgAPC = false;

            this.synchronise = function() {
                this.avgCount = false;
                this.avgExp = false;
                this.avgAPC = false;

                var results = this.edge.preflightResults.uk_mean;
                var stats = results.aggregation("total_stats");
                var pubs = results.aggregation("publisher_count");

                this.avgCount = stats.count / pubs.value;
                this.avgExp = stats.sum / pubs.value;
                this.avgAPC = stats.avg;
            };

            this.draw = function() {
                if (!this.avgCount || !this.avgExp || !this.avgAPC) {
                    this.context.html("");
                    return;
                }

                // FIXME: usually we'd use a renderer, but since this is a one-off component, we can be a little lazy for the moment
                var story = "<p>On average, a publisher receives <strong>{{x}}</strong> APC payments in this period, with the average total expenditure on them being <strong>£{{y}}</strong> and the average UK APC cost being <strong>£{{z}}</strong></p>";
                story = story.replace(/{{x}}/g, Number(this.avgCount.toFixed(0)).toLocaleString())
                    .replace(/{{y}}/g, Number(this.avgExp.toFixed(0)).toLocaleString())
                    .replace(/{{z}}/g, Number(this.avgAPC.toFixed(0)).toLocaleString());

                this.context.html(story);
            };
        },

        averagesQuery : function(edge) {
            // clone the current query, which will be the basis for the averages query
            var query = edge.cloneQuery();

            // remove the institutional constraints
            query.removeMust(es.newTermsFilter({field: "record.jm:apc.organisation_name.exact"}));

            // find out how many publishers we need to get back in the aggregation
            var aggSize = 10;

            // now look to see if there are any publisher filters set
            var pubFilters = query.listMust(es.newTermsFilter({field: "record.dcterms:publisher.name.exact"}));
            if (pubFilters.length === 0) {
                // if there are no publisher filters, we must set some one the list of publishers that we are interested in
                var ibuckets = edge.result.buckets("institution");
                if (ibuckets.length > 0) {
                    var terms = [];
                    var pbuckets = ibuckets[0].publisher.buckets;
                    for (var i = 0; i < pbuckets.length; i++) {
                        var pbucket = pbuckets[i];
                        var pub = pbucket.key;
                        terms.push(pub);
                    }
                    query.addMust(es.newTermsFilter({field: "record.dcterms:publisher.name.exact", values: terms}));
                }
            } else {
                aggSize = pubFilters[0].term_count();
            }

            // remove any existing aggregations, we don't need them
            query.clearAggregations();

            // add the new aggregation which will actually get the data
            query.addAggregation(
                es.newTermsAggregation({
                    name: "publishers",
                    field: "record.dcterms:publisher.name.exact",
                    size: aggSize,
                    aggs : [
                        es.newStatsAggregation({
                            name : "publisher_stats",
                            field: "index.amount_inc_vat"
                        }),
                        es.newCardinalityAggregation({
                            name: "institutions",
                            field: "record.jm:apc.organisation_name.exact"
                        })
                    ]
                })
            );

            // finally set the size and from parameters
            query.size = 0;
            query.from = 0;

            // return the secondary query
            return query;
        },

        reportDF : function(params) {
            var ch = params.chart;
            var valueFunction = params.valueFunction;
            var avgFunction = params.avgFunction;

            var data_series = [];
            if (!ch.edge.result) {
                return data_series;
            }

            // we need to make sure that we only extract data for institutions and publishers that are in
            // the filter list
            var instFilters = ch.edge.currentQuery.listMust(es.newTermsFilter({field: "record.jm:apc.organisation_name.exact"}));
            var pubFilters = ch.edge.currentQuery.listMust(es.newTermsFilter({field: "record.dcterms:publisher.name.exact"}));

            // get the UK average out for each of the publishers
            var avgSeries = {};
            avgSeries["key"] = "UK Average";
            avgSeries["values"] = [];

            var avgPubFilters = ch.edge.realisedSecondaryQueries.avg.listMust(es.newTermsFilter({field: "record.dcterms:publisher.name.exact"}));
            for (var i = 0; i < avgPubFilters.length; i++) {
                var filt = avgPubFilters[i];
                var pubs = filt.values;
                for (var j = 0; j < pubs.length; j++) {
                    var pub = pubs[j];
                    var buckets = ch.edge.secondaryResults.avg.buckets("publishers");
                    for (var k = 0; k < buckets.length; k++) {
                        var bucket = buckets[k];
                        if (bucket.key === pub) {
                            var value = avgFunction(bucket);
                            avgSeries.values.push({label: pub, value: value});
                            break;
                        }
                    }
                }
            }
            data_series.push(avgSeries);

            // if there are no current institution filters, we don't want to show any more
            if (instFilters.length === 0) {
                return data_series;
            }

            var reportOn = [];
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

                var series = {};
                series["key"] = ikey;
                series["values"] = [];

                var pub_buckets = ibucket["publisher"].buckets;
                for (var j = 0; j < pub_buckets.length; j++) {
                    var pbucket = pub_buckets[j];
                    var pkey = pbucket.key;

                    // only report on publishers that are in the first institution's aggregation
                    if (i === 0) {
                        reportOn.push(pkey);
                    } else if ($.inArray(pkey, reportOn) === -1) {
                        continue;
                    }

                    // since publisher isn't a repeated field, this shouldn't happen, but best to be definitive
                    skip = false;
                    for (var k = 0; k < pubFilters.length; k++) {
                        var filt = pubFilters[k];
                        if (!filt.has_term(pkey)) {
                            skip = true;
                            break;
                        }
                    }
                    if (skip) {
                        continue;
                    }

                    var value = valueFunction(pbucket);
                    series["values"].push({label: pkey, value: value})
                }

                data_series.push(series);
            }

            return data_series;
        },

        apcCountDF : function(ch) {
            return muk.publisher.reportDF({chart: ch,
                valueFunction: function(bucket) { return bucket.doc_count },
                avgFunction : function(bucket) {return bucket.doc_count / bucket.institutions.value }
            });
        },
        apcExpenditureDF : function(ch) {
            return muk.publisher.reportDF({chart: ch,
                valueFunction: function(bucket) { return bucket.publisher_stats.sum },
                avgFunction: function(bucket) { return bucket.publisher_stats.sum / bucket.institutions.value }
            });
        },
        avgAPCDF : function(ch) {
            return muk.publisher.reportDF({chart: ch,
                valueFunction: function(bucket) { return bucket.publisher_stats.avg },
                avgFunction: function(bucket) { return bucket.publisher_stats.avg }
            });
        },

        tableData : function(charts) {
            var seriesNames = {
                "apc_count" : "APC Count",
                "total_expenditure" : "Total expenditure",
                "mean" : "Average APC cost"
            };

            var formatter = muk.toIntFormat();

            var rows = {};
            for (var i = 0; i < charts.length; i++) {
                var chart = charts[i];
                if (!chart.dataSeries) {
                    continue;
                }
                var dataSeries = chart.dataSeries;
                for (var j = 0; j < dataSeries.length; j++) {
                    var ds = dataSeries[j];
                    var inst = ds.key;
                    for (var k = 0; k < ds.values.length; k++) {
                        var val = ds.values[k];
                        var pub = val.label;
                        var num = val.value;

                        var rowId = pub + " - " + seriesNames[chart.id];
                        var row = {};
                        if (rowId in rows) {
                            row = rows[rowId];
                        }

                        row[inst] = formatter(num);
                        rows[rowId] = row;
                    }
                }
            }

            var rowNames = Object.keys(rows);
            rowNames.sort();

            var table = [];
            for (var i = 0; i < rowNames.length; i++) {
                var obj = rows[rowNames[i]];
                obj["Metric"] = rowNames[i];
                table.push(obj);
            }

            return table;
        },

        makePublisherReport : function(params) {
            if (!params) {params = {} }

            // first thing to do is determine if the user's institution is in the dataset
            var check_query = es.newQuery();
            check_query.addMust(
                es.newTermsFilter({
                    field: "record.jm:apc.organisation_name.exact",
                    values: [myInstituion]
                })
            );
            check_query.size = 0;
            es.doQuery({
                search_url: octopus.config.public_query_endpoint,
                queryobj: check_query.objectify(),
                success: function (result) {
                    if (result.total() == 0) {
                        myInstituion = false;
                    }
                    muk.publisher.makePublisherReport2(params);
                },
                error : function() {
                    myInstituion = false;
                    muk.publisher.makePublisherReport2(params);
                }
            });
        },

        makePublisherReport2 : function(params) {
            if (!params) {params = {} }
            var selector = edges.getParam(params.selector, "#muk_publisher");

            var base_query = es.newQuery({size: 0});
            base_query.addAggregation(
                es.newTermsAggregation({
                    name: "institution",
                    field: "record.jm:apc.organisation_name.exact",
                    size: 10,      // actually, the size of this will be tightly controlled by the filters so this is just a random large-ish number
                    aggs : [
                        es.newTermsAggregation({
                            name : "publisher",
                            field : "record.dcterms:publisher.name.exact",
                            size : 10, // again, size will be constrained by the filters
                            aggs : [
                                es.newStatsAggregation({
                                    name : "publisher_stats",
                                    field: "index.amount_inc_vat"
                                })
                            ]
                        })
                    ]
                })
            );

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
                template: muk.publisher.newPublisherReportTemplate(),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
                preflightQueries : {
                    uk_mean : preflight
                },
                secondaryQueries : {
                    avg: muk.publisher.averagesQuery
                },
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
                        category : "top",
                        renderer : edges.bs3.newBSMultiDateRange({
                            ranges : muk.yearRanges({
                                    "academic year" : "09-01",
                                    "fiscal year" : "04-01",
                                    "calendar year" : "01-01"
                                },
                                {"This " : 0, "Last " : 1}
                            )
                        })
                    }),
                    edges.newORTermSelector({
                        id: "institution",
                        field: "record.jm:apc.organisation_name.exact",
                        display: "Compare Institutions",
                        lifecycle: "static",
                        size: 10000,
                        category: "top",
                        renderer : edges.bs3.newNSeparateORTermSelectorRenderer({
                            n: 3,
                            properties : [
                                {label: "Compare", unselected: "<choose an institution>"},
                                {label : "with", unselected : "<add another>"},
                                {label : "and", unselected : "<add another>"}
                            ],
                            select2: true
                        })
                    }),
                    edges.newORTermSelector({
                        id : "publisher",
                        field : "record.dcterms:publisher.name.exact",
                        display : "Publisher",
                        lifecycle: "update",
                        size: 10000,
                        category: "lhs",
                        renderer : edges.bs3.newORTermSelectorRenderer({
                            open: true,
                            togglable: false,
                            showCount: true,
                            hideEmpty: true
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
                        dataFunction: muk.publisher.apcCountDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "Select one or more institutions above",
                            color: ["#addaff", "#f44336","#ffeb3b","#addaaf"],
                            valueFormat: muk.toIntFormat(),
                            yAxisLabel: "Number of APCs"
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "total_expenditure",
                        display: "Total expenditure",
                        dataFunction: muk.publisher.apcExpenditureDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "Select one or more institutions above",
                            color: ["#addaff", "#f44336","#ffeb3b","#addaaf"],
                            valueFormat: muk.toGBPIntFormat(),
                            yTickFormat: muk.toGBPIntFormat(),
                            yAxisLabel: "Total expenditure"
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "mean",
                        display: "Average APC Cost",
                        dataFunction: muk.publisher.avgAPCDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "Select one or more institutions above",
                            color: ["#addaff", "#f44336","#ffeb3b","#addaaf"],
                            valueFormat: muk.toGBPIntFormat(),
                            yTickFormat: muk.toGBPIntFormat(),
                            yAxisLabel: "Average APC Cost"
                        })
                    }),
                    muk.publisher.newStory({
                        id: "story",
                        category: "story"
                    }), // FIXME: not clear what the story is
                    edges.newChartsTable({
                        id: "data_table",
                        display: "Raw Data",
                        category: "data",
                        chartComponents: ["apc_count", "total_expenditure", "mean"],
                        tabularise: muk.publisher.tableData,
                        renderer : edges.bs3.newTabularResultsRenderer({
                            fieldDisplay : [
                                {field: "Metric", display: ""},
                                {field: "UK Average", display: "UK Average"}
                            ],
                            displayListedOnly: false,
                            download: true,
                            downloadText : "download as csv"
                        })
                    }),
                    edges.newSearchingNotification({
                        id: "loading-bar",
                        category: "loading"
                    })
                ]
            });

            muk.activeEdges[selector] = e;
        }
    }
});
