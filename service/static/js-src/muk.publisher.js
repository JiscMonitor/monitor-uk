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
                var tabClass = edges.css_classes(this.namespace, "tab");
                var storyClass = edges.css_classes(this.namespace, "stories");
                var dataClass = edges.css_classes(this.namespace, "data");

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
                tabLabels = '<ul class="nav nav-tabs">' + tabLabels + '</ul>';

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

                var template = '<div class="' + panelClass + '"> \
                    <div class="' + topClass + '">' + topContainers + '</div>\
                    <div class="row">\
                        <div class="col-md-3">\
                            <div class="' + filtersClass + '">' + controlContainers + '</div>\
                        </div>\
                        <div class="col-md-9">\
                            <div class="' + tabViewClass + '">\
                                <div class="row"><div class="col-md-12">' + tabLabels + '</div></div>\
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

        makePublisherReport : function(params) {
            if (!params) { params = {} }
            var selector = edges.getParam(params.selector, "#muk_publisher");

            var base_query = es.newQuery();
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

            var e = edges.newEdge({
                selector: selector,
                // template: edges.bs3.newTabbed(),
                template: muk.publisher.newPublisherReportTemplate(),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
                baseQuery : base_query,
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
                    edges.newSelectedFilters({
                        id: "selected-filters",
                        fieldDisplays : {
                            "monitor.jm:apc.name.exact" : "Institution",
                            "monitor.jm:apc.amount_gbp" : "APC"
                        },
                        rangeMaps : {
                            "monitor.jm:apc.amount_gbp": [
                                {to: 500, display: "< 500"},
                                {from: 500, to: 1000, display: "500 -> 1000"},
                                {from: 1000, to: 2500, display: "1000 -> 2500"},
                                {from: 2500, display: "2500+"}
                            ]
                        },
                        category: "top"
                    }),
                    edges.newORTermSelector({
                        id: "institution",
                        field: "record.jm:apc.organisation_name.exact",
                        display: "Limit by Institution",
                        lifecycle: "static",
                        category: "lhs"
                    }),
                    edges.newORTermSelector({
                        id : "publisher",
                        field : "record.dcterms:publisher.name.exact",
                        display : "Choose publishers to display",
                        lifecycle: "static",
                        category: "lhs"
                    }),
                    edges.newRefiningANDTermSelector({
                        id: "journal_type",
                        field: "record.dc:source.oa_type.exact",
                        display: "Journal type",
                        category: "lhs"
                    }),
                    edges.newHorizontalMultibar({
                        id: "apc_count",
                        display: "APC Count",
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
                        display: "Total Expenditure",
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
                        display: "Mean",
                        dataFunction : edges.ChartDataFunctions.termsStats({
                            useAggregations : ["apc_count publisher_stats"],
                            seriesFor : ["avg"],
                            seriesKeys : {
                                "apc_count publisher_stats avg" : "Mean"
                            }
                        }),
                        category : "tab"
                    })
                ]
            });

            muk.activeEdges[selector] = e;
        }
    }
});