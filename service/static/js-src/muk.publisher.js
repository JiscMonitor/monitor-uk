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

        apcCountDF : function(ch) {
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

                    series["values"].push({label: pkey, value: pbucket.doc_count})
                }

                data_series.push(series);
            }

            return data_series;
        },

        apcExpenditureDF : function(ch) {
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

                    series["values"].push({label: pkey, value: pbucket.publisher_stats.sum})
                }

                data_series.push(series);
            }

            return data_series;
        },

        avgAPCDF : function(ch) {
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

                    series["values"].push({label: pkey, value: pbucket.publisher_stats.avg})
                }

                data_series.push(series);
            }

            return data_series;
        },

        makePublisherReport : function(params) {
            if (!params) { params = {} }
            var selector = edges.getParam(params.selector, "#muk_publisher");

            var base_query = es.newQuery();
            /*
            base_query.addAggregation(
                es.newTermsAggregation({
                    name : "apc_count",
                    field : "record.dcterms:publisher.name.exact",
                    size : 10,
                    aggs : [
                        es.newStatsAggregation({
                            name : "publisher_stats",
                            field: "index.apc_total_amount_gbp"
                        })
                    ]
                })
            );
            */

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
                                    field: "index.apc_total_amount_gbp"     // ex-VAT
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
                // template: edges.bs3.newTabbed(),
                template: muk.publisher.newPublisherReportTemplate(),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
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
                        category: "top",
                        renderer : edges.bs3.newNSeparateORTermSelectorRenderer({
                            n: 3,
                            properties : [
                                {label: "Compare", unselected: "<choose an institution>"},
                                {label : "With", unselected : "<add another>"},
                                {label : "and", unselected : "<add another>"}
                            ]
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
                            showCount: true
                        })
                    }),
                    edges.newRefiningANDTermSelector({
                        id : "oa_type",
                        field : "record.dc:source.oa_type.exact",
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
                            noDataMessage: "Select one or more institutions above"
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "total_expenditure",
                        display: "Total expenditure",
                        dataFunction: muk.publisher.apcExpenditureDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "Select one or more institutions above"
                        })
                    }),
                    edges.newHorizontalMultibar({
                        id: "mean",
                        display: "Average APC Cost",
                        dataFunction: muk.publisher.avgAPCDF,
                        category : "tab",
                        renderer : edges.nvd3.newHorizontalMultibarRenderer({
                            noDataMessage: "Select one or more institutions above"
                        })
                    })
                    /*
                    edges.newHorizontalMultibar({
                        id: "apc_count",
                        display: "Number of APCs",
                        dataFunction: edges.ChartDataFunctions.terms({
                            useAggregations : ["apc_count"],
                            seriesKeys : {
                                "apc_count" : "Number of APCs paid"
                            }
                        }),
                        category : "tab"
                    }),
                    edges.newHorizontalMultibar({
                        id: "total_expenditure",
                        display: "Total expenditure",
                        dataFunction : edges.ChartDataFunctions.termsStats({
                            useAggregations : ["apc_count publisher_stats"],  // the path to the stats in the terms, separated by space
                            seriesFor : ["sum"],
                            seriesKeys : {
                                "apc_count publisher_stats sum" : "Total Expenditure"
                            }
                        }),
                        category : "tab"
                    }),
                    edges.newHorizontalMultibar({
                        id: "mean",
                        display: "Average APC Cost",
                        dataFunction : edges.ChartDataFunctions.termsStats({
                            useAggregations : ["apc_count publisher_stats"],
                            seriesFor : ["avg"],
                            seriesKeys : {
                                "apc_count publisher_stats avg" : "Mean"
                            }
                        }),
                        category : "tab"
                    })
                    */
                ]
            });

            muk.activeEdges[selector] = e;
        }
    }
});