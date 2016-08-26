$.extend(muk, {
    funder: {

        newFunderReportTemplate: function (params) {
            if (!params) { params = {} }
            muk.funder.FunderReportTemplate.prototype = edges.newTemplate(params);
            return new muk.funder.FunderReportTemplate(params);
        },

        chartColours : ["#66bdbe", "#a6d6d6", "#7867a3", "#d90d4c", "#6bcf65"],

        FunderReportTemplate: function (params) {
            // later we'll store the edge instance here
            this.edge = false;

            // bits that are hidden off-screen
            this.hidden = {};

            // ids of the tabs that are in the layout
            this.tabIds = [];

            this.namespace = "muk-funder-report-template";

            this.draw = function (edge) {
                this.edge = edge;

                var intro = 'See the amount of APCs, total APC expenditure, or average APC cost for several funders for a given period. Filter by institution or journal type. Use this report to:\
                <ul>\
                    <li>Compare number of APCs funded by funders</li>\
                    <li>See funding expenditure for a specific institution</li>\
                    <li>Break down how funds are spent by journal type</li>\
                </ul>';

                // main report
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
                
                // inset pie chart
                var pieClass = edges.css_classes(this.namespace, "uk_pie");
                var pieId = edges.css_id(this.namespace, "uk_pie");
                var pieChartClass = edges.css_classes(this.namespace, "uk_pie_chart");
                var pieChartId = edges.css_id(this.namespace, "uk_pie_chart");
                var pieTableClass = edges.css_classes(this.namespace, "uk_pie_table");
                var pieTableId = edges.css_id(this.namespace, "uk_pie_table");

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
                    tabLabels += '<li><a href="#" id="' + linkId + '" data-id="' + tab.id + '">' + tab.display + '</a></li>';
                    tabContents += '<div class="' + tabContainerClass + '" id="' + containerId + '">\
                            <div class="row">\
                                <div class="col-md-12"> \
                                    <div class="' + tabClass + '" id="' + tab.id + '"></div>\
                                </div> \
                            </div>\
                        </div>';
                }
                tabLabels = 'Show:&nbsp;&nbsp;<ul class="nav nav-tabs navbar-right">' + tabLabels + '</ul>';

                // the story entries
                var stories = edge.category("story");
                var storyContainers = "";
                if (stories.length > 0) {
                    for (var i = 0; i < stories.length; i++) {
                        storyContainers += '<div class="row"><div class="col-md-12"><div id="' + stories[i].id + '"></div></div></div>';
                    }
                }

                // A uk-wide pie chart
                var pieContents = '\
                <h3>UK Pure OA/Hybrid breakdown</h3>\
                <div class="' + pieChartClass + '" id="' + pieChartId + '"></div>\
                <div class="' + pieTableClass + '" id="' + pieTableId + '"></div>';

                // the data tables
                var data = edge.category("data");
                var dataContainers = "";
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        dataContainers += '<div class="row"><div class="col-md-12"><div id="' + data[i].id + '"></div></div></div>';
                    }
                }

                var filterHeader = '<div class="' + filterHeaderClass + '"><div class="row"><div class="col-md-12"><span class="glyphicon glyphicon-filter"></span>&nbsp;FILTER</div></div></div>';

                var template = '<div class="' + panelClass + '">\
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
                    <div class="row">\
                        <div class="col-md-7">\
                            <div class="' + storyClass + '">' + storyContainers + '</div>\
                            <hr>\
                            <div class="' + dataClass + '">' + dataContainers + '</div>\
                        </div>\
                        <div class="col-md-5 ' + pieClass + '" id="' + pieId + '">' + pieContents + '</div>\
                    </div>\
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
        
        valueMap : {
            "oa" : "Pure OA",
            "hybrid" : "Hybrid",
            "unknown" : "Unknown"
        },

        storyQuery : function(edge) {
            // clone the current query, which will be the basis for the averages query
            var query = edge.cloneQuery();

            // remove the funder constraints, but keep any others
            query.removeMust(es.newTermsFilter({field: "record.rioxxterms:project.funder_name.exact"}));

            // remove any existing aggregations, we don't need them
            query.clearAggregations();

            // add the new aggregation which will actually get the data
            query.addAggregation(
                es.newStatsAggregation({
                name: "total_stats",
                field: "index.amount_inc_vat"
                })
            );
            
            query.addAggregation(
                es.newCardinalityAggregation({
                    name: "funder_count",
                    field: "record.rioxxterms:project.funder_name.exact"
                })
            );

            // finally set the size and from parameters
            query.size = 0;
            query.from = 0;

            // return the secondary query
            return query;
        },

        newStory : function (params) {
            if (!params) { params = {} }
            muk.funder.Story.prototype = edges.newComponent(params);
            return new muk.funder.Story(params);
        },
        
        Story : function(params) {
            this.avgCount = false;
            this.avgExp = false;
            this.avgAPC = false;

            this.synchronise = function() {
                this.avgCount = false;
                this.avgExp = false;
                this.avgAPC = false;

                var results = this.edge.secondaryResults.uk_mean;
                var stats = results.aggregation("total_stats");
                var pubs = results.aggregation("funder_count");

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
                var story = "<p>On average, a funder pays for <strong>{{x}}</strong> APC payments in this period, with the average total expenditure on them being <strong>£{{y}}</strong> and the average UK APC cost being <strong>£{{z}}</strong></p>";
                story = story.replace(/{{x}}/g, Number(this.avgCount.toFixed(0)).toLocaleString())
                    .replace(/{{y}}/g, Number(this.avgExp.toFixed(0)).toLocaleString())
                    .replace(/{{z}}/g, Number(this.avgAPC.toFixed(0)).toLocaleString());

                this.context.html(story);
            };
        },

        stackedBarClean : function(data_series, splice_for_brevity) {
            // Clean up some things in a data series that a stacked chart doesn't handle very well.

            // discard empty series and find a list of inner labels to sort
            var labels = new Set();
            var i = data_series.length;
            while (i--) {
                var s = data_series[i];
                if (!s.values.length) {
                    data_series.splice(i, 1)
                } else {
                    for (var j = 0; j < s.values.length; j++) {
                        labels.add(s.values[j].label)
                    }
                }
            }

            var sorted_labels = splice_for_brevity ? Array.from(labels).splice(0,10).sort() : Array.from(labels).sort();

            // Construct a new series
            var clean_series = [];
            for (var a = 0; a < data_series.length; a++) {
                var k = data_series[a].key;
                var vs = data_series[a].values;
                var cs = {};
                cs["key"] = k;
                cs["values"] = [];
                for (var b = 0; b < sorted_labels.length; b++) {
                    var l = sorted_labels[b];
                    var current_labels_value = undefined;

                    // apply the existing value if we have it, or push a zero value so it's not missing from the series
                    for (var c = 0; c < vs.length; c++) {
                        if (vs[c].label == l) {
                            current_labels_value = {label: l, value: vs[c].value, series: a, key: k}
                        }
                    }
                    if (current_labels_value === undefined){
                        cs["values"].push({label: l, value: 0, series: a, key: k})
                    } else {
                        cs["values"].push(current_labels_value)
                    }
                }
                clean_series.push(cs)
            }
            return clean_series
        },

        reportDF : function(params) {
            var ch = params.chart;
            var valueFunction = params.valueFunction;

            var data_series = [];
            if (!ch.edge.result) {
                return data_series;
            }

            // we need to make sure that we only extract data for funders that are in the filter list
            var fund_filters = ch.edge.currentQuery.listMust(es.newTermsFilter({field: "record.rioxxterms:project.funder_name.exact"}));

            var oahyb_buckets = ch.edge.result.buckets("oahybrid");

            for (var k = 0; k < oahyb_buckets.length; k++) {
                var obucket = oahyb_buckets[k];
                var okey = obucket.key;

                var series = {};
                series["key"] = muk.funder.valueMap[okey];
                series["values"] = [];

                var fund_buckets = obucket["funder"].buckets;
                for (var l = 0; l < fund_buckets.length; l++) {
                    var fbucket = fund_buckets[l];
                    var fkey = fbucket.key;

                    // if the funder in the aggregation is not in the filter list ignore it
                    // (this can happen for records where there's more than one funder on the APC)
                    var skip = false;
                    for (var j = 0; j < fund_filters.length; j++) {
                        var filt = fund_filters[j];
                        if (!filt.has_term(fkey)) {
                            skip = true;
                            break;
                        }
                    }
                    if (skip) {
                        continue;
                    }

                    var value = valueFunction(fbucket);
                    series["values"].push({label: fkey, value: value})
                }
                data_series.push(series);
            }

            // To avoid crowding the graph initially, if we have no filters applied, abridge the data shown
            if (ch.edge.currentQuery.listMust().length > 0) {
                return muk.funder.stackedBarClean(data_series, false)
            } else {
                return muk.funder.stackedBarClean(data_series, true)
            }
        },

        apcCountDF : function(ch) {
            return muk.funder.reportDF({chart: ch, valueFunction: function(bucket) { return bucket.doc_count }});
        },
        apcExpenditureDF : function(ch) {
            return muk.funder.reportDF({chart: ch, valueFunction: function(bucket) { return bucket.funder_stats.sum }});
        },
        avgAPCDF : function(ch) {
            return muk.funder.reportDF({chart: ch, valueFunction: function(bucket) { return bucket.funder_stats.avg }});
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

        pieDF : function(ch) {
            var buckets = ch.edge.result.data.aggregations['oavshybrid'].buckets;

            var series = {};
            series["key"] = 'oavshybrid';
            series["values"] = [];

            for (var j = 0; j < buckets.length; j++) {
                var doccount = buckets[j].doc_count;
                var key = buckets[j].key;
                series.values.push({label: muk.funder.valueMap[key], value: doccount});
            }

            return [series];
        },

        pieTable : function(charts) {
            var ds = charts[0].dataSeries[0].values;        // pie charts only have one series.

            // Get the total number from the query results, calculate each percentage and add to the series
            var total = charts[0].edge.result.data.hits.total;
            for (var x = 0; x < ds.length; x++) {
                ds[x]["percent"] = (100 * (ds[x].value / total)).toFixed(2)
            }
            return ds;
        },
        
        makeFunderReport : function(params) {
            if (!params) {params = {} }

            // first thing to do is determine if the user's institution is in the dataset
            var check_query = es.newQuery({size :0});
            check_query.addMust(
                es.newTermsFilter({
                    field: "record.jm:apc.organisation_name.exact",
                    values: [myInstituion]
                })
            );

            es.doQuery({
                search_url: octopus.config.public_query_endpoint,
                queryobj: check_query.objectify(),
                success: function (result) {
                    if (result.total() == 0) {
                        myInstituion = false;
                    }
                    muk.funder.makeFunderReport2(params);
                },
                error : function() {
                    myInstituion = false;
                    muk.funder.makeFunderReport2(params);
                }
            });
        },


        makeFunderReport2 : function(params) {
            if (!params) { params = {} }
            var selector = edges.getParam(params.selector, "#muk_funder");

            var base_query = es.newQuery({size: 0});

            // Aggregate by institution, type and funder
            base_query.addAggregation(
                es.newTermsAggregation({
                    name: "oahybrid",
                    field: "record.dc:source.oa_type.exact",
                    size: 0,
                    aggs: [
                        es.newTermsAggregation({
                            name: "funder",
                            field: "record.rioxxterms:project.funder_name.exact",
                            size: 10000,
                            aggs: [
                                es.newStatsAggregation({
                                    name: "funder_stats",
                                    field: "index.amount_inc_vat"
                                })
                            ]
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
                template: muk.funder.newFunderReportTemplate(),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
                baseQuery : base_query,
                openingQuery : opening_query,
                secondaryQueries : {
                    uk_mean : muk.funder.storyQuery
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
                        display: "Institution",
                        lifecycle: "update",
                        size: 10000,
                        category: "lhs",
                        orderBy: "count",
                        orderDir: "desc",
                        renderer : edges.bs3.newORTermSelectorRenderer({
                            open: true,
                            togglable: false,
                            showCount: true,
                            hideEmpty: true
                        })
                    }),
                    edges.newORTermSelector({
                        id: "funder",
                        field: "record.rioxxterms:project.funder_name.exact",
                        display: "Funder",
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
                    edges.newORTermSelector({
                        id : "oa_type",
                        field : "record.dc:source.oa_type.exact",
                        display : "Journal type",
                        lifecycle: "update",
                        category: "lhs",
                        orderBy: "count",
                        orderDir: "desc",
                        valueMap: muk.funder.valueMap,
                        renderer : edges.bs3.newORTermSelectorRenderer({
                            open: true,
                            togglable: false,
                            showCount: true,
                            hideEmpty: true
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "apc_count",
                        display: "Number of APCs",
                        dataFunction: muk.funder.apcCountDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "No data to display",
                            showValues: true,
                            controls: true,
                            stacked: true,
                            color: muk.funder.chartColours,
                            valueFormat: muk.toIntFormat(),
                            yAxisLabel: "Number of APCs"
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "total_expenditure",
                        display: "Total expenditure",
                        dataFunction: muk.funder.apcExpenditureDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "No data to display",
                            showValues: true,
                            controls: true,
                            stacked: true,
                            color: muk.funder.chartColours,
                            valueFormat: muk.toGBPIntFormat(),
                            yTickFormat: muk.toGBPIntFormat(),
                            yAxisLabel: "Total expenditure"
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "mean",
                        display: "Average APC Cost",
                        dataFunction: muk.funder.avgAPCDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "No data to display",
                            showValues: true,
                            controls: true,
                            stacked: true,
                            color: muk.funder.chartColours,
                            valueFormat: muk.toGBPIntFormat(),
                            yTickFormat: muk.toGBPIntFormat(),
                            yAxisLabel: "Average APC Cost"
                        })
                    }),
                    muk.funder.newStory({
                        id: "story",
                        category: "story"}
                    ),
                    edges.newChartsTable({
                        id: "data_table",
                        display: "Raw Data",
                        category: "data",
                        chartComponents: ["apc_count", "total_expenditure", "mean"],
                        tabularise: muk.funder.tableData,
                        renderer : edges.bs3.newTabularResultsRenderer({
                            fieldDisplay : [
                                {field: "Metric", display: ""}
                            ],
                            displayListedOnly: false,
                            download: true,
                            downloadText : "download as csv"
                        })
                    })
                ]
            });

            muk.activeEdges[selector] = e;

            var oavshybrid_uk_query = es.newQuery();
            oavshybrid_uk_query.addAggregation(
                es.newTermsAggregation({
                    name: "oavshybrid",
                    field: "record.dc:source.oa_type.exact"
                })
            );

            var e2 = edges.newEdge({
                selector: edges.css_id_selector("muk-funder-report-template", "uk_pie"),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
                baseQuery: oavshybrid_uk_query,
                components: [
                    edges.newPieChart({
                        id: edges.css_id("muk-funder-report-template", "uk_pie_chart"),
                        dataFunction: muk.funder.pieDF,
                        renderer: edges.nvd3.newPieChartRenderer({
                            valueFormat: d3.format(',d'),
                            labelsOutside: true,
                            color: muk.funder.chartColours
                        })
                    }),
                    edges.newChartsTable({
                        id: edges.css_id("muk-funder-report-template", "uk_pie_table"),
                        display: "Raw Data",
                        chartComponents: [edges.css_id("muk-funder-report-template", "uk_pie_chart")],
                        tabularise: muk.funder.pieTable,
                        renderer : edges.bs3.newTabularResultsRenderer({
                            fieldDisplay : [
                                {field: "label", display: ""},
                                {field: "value", display: "Total"},
                                {field: "percent", display: "%"}
                            ],
                            download: false
                        })
                    })
                ]
            });
            muk.activeEdges["#uk_pie"] = e2;
        }
    }
});
