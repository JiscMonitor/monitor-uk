/** @namespace muk */
$.extend(muk, {

    /** @namespace muk.funder */
    funder: {
        /**
         * Use this to construct the {@link muk.funder.FunderReportTemplate}
         *
         * @type {Function}
         * @memberof muk.funder
         * @returns {muk.funder.FunderReportTemplate}
         */
        newFunderReportTemplate: function (params) {
            if (!params) { params = {} }
            muk.funder.FunderReportTemplate.prototype = edges.newTemplate(params);
            return new muk.funder.FunderReportTemplate(params);
        },
        
        /**
         * <p>The Funder Report Template main class.</p>
         *
         * <p>This class is responsible for rendering and maintaining the state of the overall UI template for the
         * funder report.</p>
         *
         * <p>You should construct this using {@link muk.funder.newFunderReportTemplate}</p>
         *
         * @constructor
         * @memberof muk.funder
         * @extends edges.Template
         */
        FunderReportTemplate: function (params) {
            // later we'll store the edge instance here
            this.edge = false;

            // bits that are hidden off-screen
            this.hidden = {};

            // ids of the tabs that are in the layout
            this.tabIds = [];

            // namespace for css classes and ids
            this.namespace = "muk-funder-report-template";

            /**
             * Draw the template into the page.  This will draw the template into the page element identified
             * by edge.context
             *
             * @type {Function}
             * @param edge {Edge} The Edge instance requesting the draw
             */
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

            /**
             * Hide the element identified by the selector off screen
             *
             * @type {Function}
             * @param {String} selector the jquery selector for the element to move off screen
             */
            this.hideOffScreen = function (selector) {
                if (selector in this.hidden) {
                    return
                }
                var el = this.edge.jq(selector);
                this.hidden[selector] = {"position": el.css("position"), "margin": el.css("margin-left")};
                el.css("position", "absolute").css("margin-left", -9999);
            };

            /**
             * Bring the element identified by the selector on screen
             *
             * @type {Function}
             * @param {String} selector the jquery selector for the element to move off screen
             */
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

            /**
             * Activate the tab with the given Edges component id
             *
             * @type {Function}
             * @param {String} activate the component id for the tabbed component
             */
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

            /**
             * Event handler which is activated when a tab header is clicked, and acts to call
             * {@link muk.institution.InstitutionReportTemplate#activateTab}
             *
             * @type {Function}
             * @param {DOM} element DOM element on which the event occurred (the tab header link)
             */
            this.tabClicked = function (element) {
                var id = $(element).attr("data-id");
                this.activateTab(id);
            };
        },

        /**
         * A series of colours shared between the charts.
         * @type {Array.<string>}
         */
        chartColours : ["#66bdbe", "#a6d6d6", "#7867a3", "#d90d4c", "#6bcf65"],

        /**
         * Mapping from data values to display strings, used by both charts.
         * @type {Object.<string, string>}
         */
        valueMap : {
            "oa" : "Pure OA",
            "hybrid" : "Hybrid",
            "unknown" : "Unknown"
        },

        /**
         * Use this to construct the {@link muk.funder.Story}
         *
         * @type {Function}
         * @memberof muk.funder
         * @returns {muk.funder.Story}
         */
        newStory : function (params) {
            if (!params) { params = {} }
            muk.funder.Story.prototype = edges.newComponent(params);
            return new muk.funder.Story(params);
        },

        /**
         * <p>Component class which extracts averaging information from the various ES queries, and presents a human-readable
         * story-like interface to the information</p>
         *
         * <p>You should construct this using {@link muk.funder.newStory}</p>
         *
         * @constructor
         * @memberof muk.funder
         * @extends edges.Component
         */
        Story : function(params) {
            /////////////////////////////////////
            // internal state
            this.avgCount = false;
            this.avgExp = false;
            this.avgAPC = false;

            /**
             * Synchronise the internal state variables with the latest data from the query lifecycle
             *
             * @type {Function}
             */
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

            /**
             * <p>Draw the component to the screen.  This will draw the HTML to the element identified by the
             * component's context.</p>
             *
             * <p>Note that as this is a simple component for a one-off purpose we do not separate the draw features
             * out to a renderer, we draw directly within this class.</p>
             *
             * @type {Function}
             */
            this.draw = function() {
                if (!this.avgCount || !this.avgExp || !this.avgAPC) {
                    this.context.html("");
                    return;
                }

                // usually we'd use a renderer, but since this is a one-off component, we can be a little lazy for the moment
                var story = "<p>On average, a funder pays for <strong>{{x}}</strong> APC payments in this period, with the average total expenditure on them being <strong>£{{y}}</strong> and the average UK APC cost being <strong>£{{z}}</strong></p>";
                story = story.replace(/{{x}}/g, Number(this.avgCount.toFixed(0)).toLocaleString())
                    .replace(/{{y}}/g, Number(this.avgExp.toFixed(0)).toLocaleString())
                    .replace(/{{z}}/g, Number(this.avgAPC.toFixed(0)).toLocaleString());

                this.context.html(story);
            };
        },

        /**
         * Function which can generate the secondary query for calculating averages within the date range specified
         * by the report.
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {Edge} edge the edge which is calling this function
         * @returns {es.Query} the ES query object which collects the relevant averaging information
         */
        storyQuery : function(edge) {
            // clone the current query, which will be the basis for the averages query
            var query = edge.cloneQuery();

            // remove the funder constraints, but keep any others
            query.removeMust(es.newTermsFilter({field: "record.rioxxterms:project.funder_name.exact"}));

            // remove any existing aggregations, we don't need them
            query.clearAggregations();

            // add the new aggregations which will actually get the data
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

        /**
         * <p>Graph Data Function which converts the current query results into a suitable data series to be used by multibar charts.</p>
         *
         * <p>This function is generic, and is used under-the-hood by the specific Chart data functions defined in this module.</p>
         *
         * <p>Its role is to query the "oahybrid" aggregation (the type of the journal) then the "funder" aggregation in the current result set (<strong>params.chart.edge.result</strong>),
         * and for each type for which there exists a filter in the current query it will apply the <strong>valueFunction</strong> to the aggregation and its nested stats aggregation.
         * It will then map the returned value to the name of the type and add it as a value to the data series.</p>
         *
         * <p>Its result is passed to {@link muk.funder.stackedBarClean}, which will splice the result if there are no funder filters set, to give a
         * top-10 overview rather than all of the data if no funders have been selected for comparison.</p>
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {Object} params an object containing the allowed parameters for this function (see below)
         * @param {edges.Chart} params.chart    the chart instance for whom the data is being prepared
         * @param {Function} params.valueFunction  for extracting the suitable data from the "oahybrid" aggregation or any nested aggregations.  It will be applied to each bucket in the "oahybrid" aggregation, and the returned value taken as the series value
         * @param {String} params.seriesKey name of the series being created
         * @returns {Array} The data series, which will be a single element array containing an object of the form {key : <seriesKey>, values : [{label: <value label>, value: <value>}]}
         */
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

            // To avoid crowding the graph, if we have no funder filters applied, abridge the data shown
            return muk.funder.stackedBarClean(data_series, fund_filters.length === 0);
        },

        /**
         * <p>Perform further cleanup to the report data series, which stacked bar charts in nvd3 need to render without errors.</p>
         *
         * <p>The function discards empty series, sorts the labels, then rebuilds a series while including zero values for those that are missing from the original series.
         * The end result is of the same shape as the incoming series, but there are no missing data points. In order to prevent the chart default view from looking too
         * cluttered, this function also splices the data to only show the top 10 if the parameter splice_for_brevity is true.</p>
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {Array} data_series
         * @param {boolean} splice_for_brevity whether to abridge the data for a default view when no filters selected
         * @returns {Array} The data series, which will be a single element array containing an object of the form {key : <seriesKey>, values : [{label: <value label>, value: <value>}]}
         */
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

        /**
         * Graph Data Function which extracts a data series for the APC count chart.  This will generate a data series
         * with the key "Number of APCs", and the value from the "doc_count" field of the funder aggregation
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {edges.Chart} ch    The chart instance calling this function
         * @returns {Array} The data series, which will be a single element array containing an object of the form {key : <seriesKey>, values : [{label: <value label>, value: <value>}]}
         */
        apcCountDF : function(ch) {
            return muk.funder.reportDF({chart: ch, valueFunction: function(bucket) { return bucket.doc_count }});
        },

        /**
         * Graph Data Function which extracts a data series for the APC Total Expenditure chart.  This will generate a data series
         * with the key "Total expenditure", and the value from the "sum" field of the nested "funder_stats" aggregation in the funder aggregation
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {edges.Chart} ch    The chart instance calling this function
         * @returns {Array} The data series, which will be a single element array containing an object of the form {key : <seriesKey>, values : [{label: <value label>, value: <value>}]}
         */
        apcExpenditureDF : function(ch) {
            return muk.funder.reportDF({chart: ch, valueFunction: function(bucket) { return bucket.funder_stats.sum }});
        },

        /**
         * Graph Data Function which extracts a data series for the Average APC Cost chart.  This will generate a data series
         * with the key "Average APC Cost", and the value from the "avg" field of the nested "funder_stats" aggregation in the funder aggregation
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {edges.Chart} ch    The chart instance calling this function
         * @returns {Array} The data series, which will be a single element array containing an object of the form {key : <seriesKey>, values : [{label: <value label>, value: <value>}]}
         */
        avgAPCDF : function(ch) {
            return muk.funder.reportDF({chart: ch, valueFunction: function(bucket) { return bucket.funder_stats.avg }});
        },

        /**
         * <p>Table Data Function which takes the charts for whom to tabularise the data and returns a table grid as a list
         * of key/value objects to be used by edges.TabularResultsRenderer</p>
         *
         * <p>Each output row represents an funder, and the keys are "Funder", "APC Count", "Total expenditure" and "Average APC Cost"</p>
         *
         * <p>Output rows are ordered by Funder name.</p>
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {Array} charts list of edges.Chart objects from which to extract data series for tabularisation
         * @returns {Array} list of key/value pair objects suitable for tabular display
         */
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
        
        /**
         * Graph Data Function which extracts a data series for the summary pie chart.  This will generate a data series
         * with the key "oavshybrid", and the value from the "doc_count" field of the nested terms aggregation by OA type.
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {edges.Chart} ch    The chart instance calling this function
         * @returns {Array} The data series, which will be a single element array containing an object of the form {key : <seriesKey>, values : [{label: <value label>, value: <value>}]}
         */
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

        /**
         * Table Data Function for the pie chart. Returns a table grid as a list of key/value objects to be used by edges.TabularResultsRenderer
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {Array} charts list of edges.Chart objects from which to extract data series for tabularisation (only 1st will be read)
         * @returns {Array} list of key/value pair objects suitable for tabular display
         */
        pieTable : function(charts) {
            var ds = charts[0].dataSeries[0].values;        // pie charts only have one series.

            // Get the total number from the query results, calculate each percentage and add to the series
            var total = charts[0].edge.result.data.hits.total;
            for (var x = 0; x < ds.length; x++) {
                ds[x]["percent"] = (100 * (ds[x].value / total)).toFixed(2)
            }
            return ds;
        },
        
        /**
         * <p>Primary entry point to the Funder report for pages wishing to present it.</p>
         *
         * <p>Call this function with the appropriate arguments, and it will render the funder report into the specified page element</p>
         *
         * <p>This function will first query the ES index to determine whether the current user's institution is present in the dataset.
         * If it is not, it will set the global variable <strong>myInstitution</strong> to false. It then proceeds to call {@link muk.funder.makeInstitutionReport2}</p>
         *
         * <p>This function expects the global variable <strong>myInstitution</strong> to be set</p>
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {Object} [params={}]   Object containing all the parameters for this report
         * @param {String} [params.selector="#muk_funder"]     jquery selector for page element in which to render the report
         */
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

        /**
         * <p>Second part of the initialisation process for the Funder Report.  Do not call this directly, you should call
         * {@link muk.funder.makeFunderReport} instead.</p>
         *
         * <p>This function will construct the appropriate edges.Edge instance for the Funder Report, and record it at
         * {@link muk.activeEdges}</p>
         * 
         * <p>Both the main report and the inset pie chart are generated by this function, as two separate edges.</p>
         *
         * <p>This function expects the global variable <strong>myInstitution</strong> to be set.  If it is set to false, the report will
         * default to having no institution constraint, but if it is set to a value, that value will be used to constrain
         * the user's initial view.</p>
         *
         * @type {Function}
         * @memberof muk.funder
         * @param {Object} [params={}]   Object containing all the parameters for this report
         * @param {String} [params.selector="#muk_funder"]     jquery selector for page element in which to render the report
         */
        makeFunderReport2 : function(params) {
            if (!params) { params = {} }
            var selector = edges.getParam(params.selector, "#muk_funder");

            var base_query = es.newQuery({size: 0});

            // Aggregate by type and funder
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
                                {field: "Metric", display: "Funder"}
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
