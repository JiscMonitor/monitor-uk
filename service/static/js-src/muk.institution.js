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

                var intro = 'See the amount of APCs, total APC expenditure, or average APC cost for several institutions for a given period. Filter by publisher or journal type. Examples of how to use this report:\
                <ul>\
                    <li>Compare the number of APCs paid by similar institutions</li>\
                    <li>See overall expenditure with a specific publisher for a group of institutions</li>\
                    <li>Compare average APC to see how an institution benefits from offsetting deals</li>\
                </ul>';

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
                var topstrap = edge.category("top-right");
                var topContainers = "";
                if (topstrap.length > 0) {
                    for (var i = 0; i < topstrap.length; i++) {
                        topContainers += '<div class="row"><div class="col-md-12"><div id="' + topstrap[i].id + '"></div></div></div>';
                    }
                }
                topContainers = '<div class="row"><div class="col-md-8 report-intro-text">' + intro + '</div><div class="col-md-4">' + topContainers + '</div></div>';

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

                var filterHeader = '<div class="' + filterHeaderClass + '"><div class="row"><div class="col-md-12"><span class="glyphicon glyphicon-filter"></span>&nbsp;FILTER</div></div></div>';

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
            muk.institution.Story.prototype = edges.newComponent(params);
            return new muk.institution.Story(params);
        },
        Story : function(params) {
            this.countMax = false;
            this.countAvg = false;
            this.totalMin = false;
            this.totalMax = false;
            this.totalAvg = false;
            this.avgMin = false;
            this.avgMax = false;
            this.avgAvg = false;

            this.synchronise = function() {
                this.countMax = false;
                this.countAvg = false;
                this.totalMin = false;
                this.totalMax = false;
                this.totalAvg = false;
                this.avgMin = false;
                this.avgMax = false;
                this.avgAvg = false;

                var results = this.edge.secondaryResults.avg;
                var cardinality = results.aggregation("inst_count");
                var insts = results.buckets("institutions");
                var general = results.aggregation("general_stats");

                if (insts.length > 0) {
                    this.countMax = insts[0].doc_count;
                } else {
                    this.countMax = 0;
                }

                if (cardinality.value > 0) {
                    this.countAvg = results.total() / cardinality.value;
                    this.totalAvg = general.sum / cardinality.value;
                } else {
                    this.countAvg = 0;
                    this.totalAvg = 0;
                }

                for (var i = 0; i < insts.length; i++) {
                    var inst = insts[i];
                    var sum = inst.inst_stats.sum;
                    var avg = inst.inst_stats.avg;

                    if (this.totalMin === false || sum < this.totalMin) {
                        this.totalMin = sum;
                    }

                    if (this.totalMax === false || sum > this.totalMax) {
                        this.totalMax = sum;
                    }

                    if (this.avgMin === false || avg < this.avgMin) {
                        this.avgMin = avg;
                    }

                    if (this.avgMax === false || avg > this.avgMax) {
                        this.avgMax = avg;
                    }
                }

                this.avgAvg = general.avg;
            };

            this.draw = function() {
                if (this.countMax === false ||
                        this.countAvg === false ||
                        this.totalMin === false ||
                        this.totalMax === false ||
                        this.totalAvg === false ||
                        this.avgMin === false ||
                        this.avgMax === false ||
                        this.avgAvg === false) {
                    this.context.html("");
                    return;
                }

                var story = "<p>In this time period, an institution may have up to <strong>{{a}}</strong> APCs, with the average being <strong>{{b}}</strong></p>";
                story += "<p>The least amount spent by any institution was <strong>£{{c}}</strong>, the most was <strong>£{{d}}</strong>, with the average being <strong>£{{e}}</strong></p>";
                story += "<p>The smallest average APC for an institution was <strong>£{{f}}</strong>, the largest average was <strong>£{{g}}</strong>, and the overall average APC cost is <strong>£{{h}}</strong></p>";

                var format = muk.toIntFormat();
                // FIXME: usually we'd use a renderer, but since this is a one-off component, we can be a little lazy for the moment
                story = story.replace(/{{a}}/g, format(this.countMax))
                    .replace(/{{b}}/g, format(this.countAvg))
                    .replace(/{{c}}/g, format(this.totalMin))
                    .replace(/{{d}}/g, format(this.totalMax))
                    .replace(/{{e}}/g, format(this.totalAvg))
                    .replace(/{{f}}/g, format(this.avgMin))
                    .replace(/{{g}}/g, format(this.avgMax))
                    .replace(/{{h}}/g, format(this.avgAvg));

                this.context.html(story);
            };
        },

        averagesQuery : function(edge) {
            // clone the current query, which will be the basis for the averages query
            var query = edge.cloneQuery();

            // remove the institutional constraints, but keep any others
            query.removeMust(es.newTermsFilter({field: "record.jm:apc.organisation_name.exact"}));

            // remove any existing aggregations, we don't need them
            query.clearAggregations();

            // add the new aggregation which will actually get the data
            query.addAggregation(
                es.newTermsAggregation({
                    name: "institutions",
                    field: "record.jm:apc.organisation_name.exact",
                    size: 10000,
                    orderBy: "count",
                    orderDir: "desc",
                    aggs: [
                        es.newStatsAggregation({
                            name : "inst_stats",
                            field: "index.amount_inc_vat"
                        })
                    ]
                })
            );
            query.addAggregation(
                es.newCardinalityAggregation({
                    name: "inst_count",
                    field: "record.jm:apc.organisation_name.exact"
                })
            );
            query.addAggregation(
                es.newStatsAggregation({
                    name: "general_stats",
                    field: "index.amount_inc_vat"
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
            var seriesKey = params.seriesKey;
            var maxSeries = 0;

            var data_series = [];
            if (!ch.edge.result) {
                return data_series;
            }

            // we need to make sure that we only extract data for institutions that are in
            // the filter list
            var instFilters = ch.edge.currentQuery.listMust(es.newTermsFilter({field: "record.jm:apc.organisation_name.exact"}));
            if (instFilters.length == 0) {
                maxSeries = 10;     // the maximum number to show if there are no institution constraints
            }

            var series = {};
            series["key"] = seriesKey;
            series["values"] = [];

            var insts = []; // for tracking institutions in the buckets for use later
            var inst_buckets = ch.edge.result.buckets("institution");
            for (var i = 0; i < inst_buckets.length; i++) {
                // break out of the loop if we've hit our maximum
                if (maxSeries > 0 && i >= maxSeries) {
                    break;
                }

                var ibucket = inst_buckets[i];
                var ikey = ibucket.key;

                // if the institution in the aggregation is not in the filter list ignore it
                // (this can happen for records where there's more than one institution on the APC)
                // if the length of the filter list is 0, then we just display the top X institutions anyway (i.e. none are skipped)
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
                insts.push(ikey);
            }

            // now make sure that any institutions which didn't return results are still in the series, albeit with a 0
            // value
            for (var i = 0; i < instFilters.length; i++) {
                var filt = instFilters[i];
                for (var j = 0; j < filt.values.length; j++) {
                    var val = filt.values[j];
                    if ($.inArray(val, insts) === -1) {
                        series["values"].push({label: val, value: 0});
                    }
                }
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
                        row[col] = formatter(num);
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
                    muk.institution.makeInstitutionReport2(params);
                },
                error : function() {
                    myInstituion = false;
                    muk.institution.makeInstitutionReport2(params);
                }
            });
        },

        makeInstitutionReport2 : function(params) {
            if (!params) { params = {} }
            var selector = edges.getParam(params.selector, "#muk_institution");

            var base_query = es.newQuery({size: 0});
            base_query.addAggregation(
                es.newTermsAggregation({
                    name: "institution",
                    field: "record.jm:apc.organisation_name.exact",
                    size: 1000, // random, large number, most of the time the number of results will be constrained by the filters applied
                    aggs : [
                        es.newStatsAggregation({
                            name : "institution_stats",
                            field: "index.amount_inc_vat"
                        }),
                        es.newTermsAggregation({
                            name: "oa_type",
                            field : "record.dc:source.oa_type.exact",
                            size: 10
                        })
                    ]
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
                template: muk.institution.newInstitutionReportTemplate(),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
                baseQuery : base_query,
                openingQuery : opening_query,
                secondaryQueries : {
                    avg: muk.institution.averagesQuery
                },
                components: [
                    edges.newMultiDateRangeEntry({
                        id : "date_range",
                        display: "REPORT PERIOD:<br>",
                        fields : [
                            {field : "record.rioxxterms:publication_date", display: "Publication Date"},
                            {field : "record.jm:apc.date_applied", display: "APC Application"},
                            {field : "record.jm:apc.date_paid", display: "APC Paid"}
                        ],
                        autoLookupRange: true,
                        category : "top-right",
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
                        field : "record.dc:source.oa_type.exact",
                        display : "Journal type",
                        category: "lhs",
                        valueMap: {
                            "oa" : "Pure OA",
                            "hybrid" : "Hybrid",
                            "unknown" : "Unknown"
                        },
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
                            noDataMessage: "No results match your filter criteria - try changing the date range",
                            legend: false,
                            valueFormat: muk.toIntFormat(),
                            yAxisLabel: "Number of APCs"
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "total_expenditure",
                        display: "Total expenditure",
                        dataFunction: muk.institution.apcExpenditureDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "No results match your filter criteria - try changing the date range",
                            legend: false,
                            valueFormat: muk.toGBPIntFormat(),
                            yTickFormat: muk.toGBPIntFormat(),
                            yAxisLabel: "Total expenditure"
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "mean",
                        display: "Average APC Cost",
                        dataFunction: muk.institution.avgAPCDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "No results match your filter criteria - try changing the date range",
                            legend: false,
                            valueFormat: muk.toGBPIntFormat(),
                            yTickFormat: muk.toGBPIntFormat(),
                            yAxisLabel: "Average APC Cost"
                        })
                    }),
                    muk.institution.newStory({
                        id: "story",
                        category: "story"
                    }), // FIXME: not clear what the story is
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
