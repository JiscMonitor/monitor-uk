$.extend(muk, {
    funder: {

        newFunderReportTemplate: function (params) {
            if (!params) { params = {} }
            muk.funder.FunderReportTemplate.prototype = edges.newTemplate(params);
            return new muk.funder.FunderReportTemplate(params);
        },
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

                // A uk-wide pie chart
                var pieContents = '\
                <h3>UK Pure OA/Hybrid breakdown</h3>\
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>\
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

                var filterHeader = '<div class="' + filterHeaderClass + '"><div class="row"><div class="col-md-12"><span class="glyphicon glyphicon-filter"></span>&nbsp;&nbsp;FILTER</div></div></div>';

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
                        <div class="col-md-7 ' + storyClass + '">' + storyContainers + '</div>\
                        <div class="col-md-5 ' + pieClass + '" id="' + pieId + '">' + pieContents + '</div>\
                    </div>\
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
            muk.funder.Story.prototype = edges.newComponent(params);
            return new muk.funder.Story(params);
        },
        Story : function(params) {

        },

        stackedBarClean : function(data_series) {
            // Clean up some things in a data series that a stacked chart doesn't handle very well.
            // fixme: this code was written in the dead of night, there may be a more sensible way of doing this (or with real data it might not be required)
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

            var sorted_labels = Array.from(labels).sort();

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

                    // apply the existing value if we have it
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

            // we need to make sure that we only extract data for institutions that are in the filter list
            var instFilters = ch.edge.currentQuery.listMust(es.newTermsFilter({field: "record.jm:apc.organisation_name.exact"}));

            var inst_buckets = ch.edge.result.buckets("institution");
            for (var i = 0; i < inst_buckets.length; i++) {
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

                var oahyb_buckets = ibucket["oahybrid"].buckets;

                for (var k = 0; k < oahyb_buckets.length; k++) {
                    var obucket = oahyb_buckets[k];
                    var okey = obucket.key;

                    var series = {};
                    series["key"] = okey;
                    series["values"] = [];

                    var fund_buckets = obucket["funder"].buckets;
                    for (var l = 0; l < fund_buckets.length; l++) {
                        var fbucket = fund_buckets[l];
                        var fkey = fbucket.key;

                        var value = valueFunction(fbucket);
                        series["values"].push({label: fkey, value: value})
                    }

                    data_series.push(series);
                }
            }
            return data_series;
        },

        apcCountDF : function(ch) {
            var ds = muk.funder.reportDF({chart: ch, valueFunction: function(bucket) { return bucket.doc_count }});
            return muk.funder.stackedBarClean(ds)
        },
        apcExpenditureDF : function(ch) {
            var ds = muk.funder.reportDF({chart: ch, valueFunction: function(bucket) { return bucket.funder_stats.sum }});
            return muk.funder.stackedBarClean(ds)
        },
        avgAPCDF : function(ch) {
            var ds = muk.funder.reportDF({chart: ch, valueFunction: function(bucket) { return bucket.funder_stats.avg }});
            return muk.funder.stackedBarClean(ds)
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

                        row[inst] = num.toFixed(2);
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
            if (!params) { params = {} }
            var selector = edges.getParam(params.selector, "#muk_funder");

            var base_query = es.newQuery();

            // Aggregate by institution, type and funder
            base_query.addAggregation(
                es.newTermsAggregation({
                    name: "institution",
                    field: "record.jm:apc.organisation_name.exact",
                    size: 10,      // actually, the size of this will be tightly controlled by the filters so this is just a random large-ish number
                    aggs: [
                        es.newTermsAggregation({
                            name: "oahybrid",
                            field: "record.rioxxterms:type.exact",
                            size: 0,      // actually, the size of this will be tightly controlled by the filters so this is just a random large-ish number
                            aggs: [
                                es.newTermsAggregation({
                                    name: "funder",
                                    field: "record.rioxxterms:project.funder_name.exact",
                                    size: 0, // again, size will be constrained by the filters
                                    aggs: [
                                        es.newStatsAggregation({
                                            name: "funder_stats",
                                            field: "index.amount_inc_vat"
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            );

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
                //openingQuery : opening_query,
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
                        //field : "record.dc:source.oa_type.exact",             // fixme: is this supposed be the normalised field?
                        field : "record.rioxxterms:type.exact",
                        display : "Journal type",
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
                    edges.newHorizontalMultibar({
                        id: "apc_count",
                        display: "Number of APCs",
                        dataFunction: muk.funder.apcCountDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "No data to display",
                            controls: false,
                            stacked: true,
                            color: ["#66BDBE", "#A6D6D6", "#aec7e8", "#d90d4c", "#6c537e", "#64d54f", "#ecc7c4", "#f1712b"]
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "total_expenditure",
                        display: "Total expenditure",
                        dataFunction: muk.funder.apcExpenditureDF,
                        //dataSeries: spoofData2(),
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "No data to display",
                            controls: false,
                            stacked: true,
                            color: ["#66BDBE", "#A6D6D6", "#aec7e8", "#d90d4c", "#6c537e", "#64d54f", "#ecc7c4", "#f1712b"]
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "mean",
                        display: "Average APC Cost",
                        dataFunction: muk.funder.avgAPCDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "No data to display",
                            showValues: false,
                            controls: true,
                            stacked: true,
                            color: ["#66BDBE", "#A6D6D6", "#aec7e8", "#d90d4c", "#6c537e", "#64d54f", "#ecc7c4", "#f1712b"]
                        })
                    }),
                    muk.funder.newStory({}), // FIXME: not clear what the story is
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
                    field: "record.rioxxterms:type.exact"               //fixme: normalised OA vs Hybrid field
                })
            );

            var e2 = edges.newEdge({
                selector: edges.css_id_selector("muk-funder-report-template", "uk_pie"),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
                baseQuery: oavshybrid_uk_query,
                components: [
                    edges.newPieChart({
                        id: edges.css_id("muk-funder-report-template", "uk_pie_chart"),
                        dataFunction: edges.ChartDataFunctions.terms({
                            useAggregations: ["oavshybrid"]
                        }),
                        renderer: edges.nvd3.newPieChartRenderer({
                            valueFormat: d3.format(',d'),
                            labelsOutside: true,
                            color: ["#66BDBE", "#A6D6D6", "#aec7e8", "#d90d4c", "#6c537e", "#64d54f", "#ecc7c4", "#f1712b"]
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
