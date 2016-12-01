$.extend(muk, {
    /** @namespace muk.institution */
    institution: {

        /**
         * Use this to construct the {@link muk.institution.InstitutionReportTemplate}
         *
         * @type {Function}
         * @memberof muk.institution
         * @returns {muk.institution.InstitutionReportTemplate}
         */
        newInstitutionReportTemplate: function (params) {
            if (!params) { params = {} }
            muk.institution.InstitutionReportTemplate.prototype = edges.newTemplate(params);
            return new muk.institution.InstitutionReportTemplate(params);
        },
        /**
         * <p>The Institution Report Template main class.</p>
         *
         * <p>This class is responsible for rendering and maintaining the state of the overall UI template for the
         * institution report.</p>
         *
         * <p>You should construct this using {@link muk.institution.newInstitutionReportTemplate}</p>
         *
         * @constructor
         * @memberof muk.institution
         * @extends edges.Template
         */
        InstitutionReportTemplate: function (params) {
            ////////////////////////////////////////
            // internal state members

            // later we'll store the edge instance here
            this.edge = false;

            // bits that are hidden off-screen
            this.hidden = {};

            // ids of the tabs that are in the layout
            this.tabIds = [];

            // namespace for css classes and ids
            this.namespace = "muk-institution-report-template";

            /**
             * Draw the template into the page.  This will draw the template into the page element identified
             * by edge.context
             *
             * @type {Function}
             * @param edge {Edge} The Edge instance requesting the draw
             */
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
         * Use this to construct the {@link muk.institution.Story}
         *
         * @type {Function}
         * @memberof muk.institution
         * @returns {muk.institution.Story}
         */
        newStory : function (params) {
            if (!params) { params = {} }
            muk.institution.Story.prototype = edges.newComponent(params);
            return new muk.institution.Story(params);
        },

        /**
         * <p>Component class which extracts averaging information from the various ES queries, and presents a human-readable
         * story-like interface to the information</p>
         *
         * <p>You should construct this using {@link muk.institution.newStory}</p>
         *
         * @constructor
         * @memberof muk.institution
         * @extends edges.Component
         */
        Story : function(params) {
            /////////////////////////////////////
            // internal state

            this.countMax = false;
            this.countAvg = false;
            this.totalMin = false;
            this.totalMax = false;
            this.totalAvg = false;
            this.avgMin = false;
            this.avgMax = false;
            this.avgAvg = false;

            /**
             * Synchronise the internal state variables with the latest data from the query lifecycle
             *
             * @type {Function}
             */
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
                //  usually we'd use a renderer, but since this is a one-off component, we can be a little lazy for the moment
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

        /**
         * Function which can generate the secondary query for calculating averages within the date range specified
         * by the report.
         *
         * @type {Function}
         * @memberof muk.institution
         * @param {Edge} edge the edge which is calling this function
         * @returns {es.Query} the ES query object which collects the relevant averaging information
         */
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

        /**
         * <p>Graph Data Function which converts the current query results into a suitable data series to be used by Charts</p>
         *
         * <p>This function is generic, and is used under-the-hood by the specific Chart data functions defined in this module.</p>
         *
         * <p>Its role is to query the "institution" aggregation in the current result set (<strong>params.chart.edge.result</strong>), and for each institution for which
         * there exists a filter in the current query (or, the first 10 institutions, if no filters exist) it will apply
         * the <strong>valueFunction</strong> to the aggregation and its nested stats aggregation.  It will then map the returned value to
         * the name of the institution and add it as a value to the data series.</p>
         *
         * @type {Function}
         * @memberof muk.institution
         * @param {Object} params an object containing the allowed parameters for this function (see below)
         * @param {edges.Chart} params.chart    the chart instance for whom the data is being prepared
         * @param {Function} params.valueFunction  for extracting the suitable data from the "institution" aggregation or any nested aggregations.  It will be applied to each bucket in the "institution" aggregation, and the returned value taken as the series value
         * @param {String} params.seriesKey name of the series being created
         * @returns {Array} The data series, which will be a single element array containing an object of the form {key : <seriesKey>, values : [{label: <value label>, value: <value>}]}
         */
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

        /**
         * Graph Data Function which extracts a data series for the APC count chart.  This will generate a data series
         * with the key "Number of APCs", and the value from the "doc_count" field of the institution aggregation
         *
         * @type {Function}
         * @memberof muk.institution
         * @param {edges.Chart} ch    The chart instance calling this function
         * @returns {Array} The data series, which will be a single element array containing an object of the form {key : <seriesKey>, values : [{label: <value label>, value: <value>}]}
         */
        apcCountDF : function(ch) {
            return muk.institution.reportDF({chart: ch, seriesKey: "Number of APCs", valueFunction: function(bucket) { return bucket.doc_count }});
        },

        /**
         * Graph Data Function which extracts a data series for the APC Total Expenditure chart.  This will generate a data series
         * with the key "Total expenditure", and the value from the "sum" field of the nested "institution_stats" aggregation in the institution aggregation
         *
         * @type {Function}
         * @memberof muk.institution
         * @param {edges.Chart} ch    The chart instance calling this function
         * @returns {Array} The data series, which will be a single element array containing an object of the form {key : <seriesKey>, values : [{label: <value label>, value: <value>}]}
         */
        apcExpenditureDF : function(ch) {
            return muk.institution.reportDF({chart: ch, seriesKey: "Total expenditure", valueFunction: function(bucket) { return bucket.institution_stats.sum }});
        },

        /**
         * Graph Data Function which extracts a data series for the Average APC Cost chart.  This will generate a data series
         * with the key "Average APC Cost", and the value from the "avg" field of the nested "institution_stats" aggregation in the institution aggregation
         *
         * @type {Function}
         * @memberof muk.institution
         * @param {edges.Chart} ch    The chart instance calling this function
         * @returns {Array} The data series, which will be a single element array containing an object of the form {key : <seriesKey>, values : [{label: <value label>, value: <value>}]}
         */
        avgAPCDF : function(ch) {
            return muk.institution.reportDF({chart: ch, seriesKey: "Average APC Cost",  valueFunction: function(bucket) { return bucket.institution_stats.avg }});
        },

        /**
         * <p>Table Data Function which takes the charts for whom to tabularise the data and returns a table grid as a list
         * of key/value objects to be used by edges.TabularResultsRenderer</p>
         *
         * <p>Each output row represents an institution, and the keys are "Institution", "APC Count", "Total expenditure" and "Average APC Cost"</p>
         *
         * <p>Output rows are ordered by Institution name.</p>
         *
         * @type {Function}
         * @memberof muk.institution
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
                    for (var k = 0; k < ds.values.length; k++) {
                        var val = ds.values[k];
                        var inst = val.label;
                        var num = val.value;

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

        /**
         * <p>Primary entry point to the Institution report for pages wishing to present it.</p>
         *
         * <p>Call this function with the appropriate arguments, and it will render the institution report into the specified page element</p>
         *
         * <p>This function will first query the ES index to determine whether the current user's institution is present in the dataset.
         * If it is not, it will set the global variable <strong>myInstitution</strong> to false. It then proceeds to call {@link muk.institution.makeInstitutionReport2}</p>
         *
         * <p>This function expects the global variable <strong>myInstitution</strong> to be set</p>
         *
         * @type {Function}
         * @memberof muk.institution
         * @param {Object} [params={}]   Object containing all the parameters for this report
         * @param {String} [params.selector="#muk_institution"]     jquery selector for page element in which to render the report
         */
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

        /**
         * <p>Second part of the initialisation process for the Institution Report.  Do not call this directly, you should call
         * {@link muk.institution.makeInstitutionReport} instead.</p>
         *
         * <p>This function will construct the appropriate edges.Edge instance for the Institution Report, and record it at
         * {@link muk.activeEdges}</p>
         *
         * <p>This function expects the global variable <strong>myInstitution</strong> to be set.  If it is set to false, the report will
         * default to having no institution constraint, but if it is set to a value, that value will be used to constrain
         * the user's initial view.</p>
         *
         * @type {Function}
         * @memberof muk.institution
         * @param {Object} [params={}]   Object containing all the parameters for this report
         * @param {String} [params.selector="#muk_institution"]     jquery selector for page element in which to render the report
         */
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
                    }),
                    edges.newChartsTable({
                        id: "data_table",
                        display: "Raw Data",
                        category: "data",
                        chartComponents: ["apc_count", "total_expenditure", "mean"],
                        tabularise: muk.institution.tableData,
                        renderer : edges.bs3.newTabularResultsRenderer({
                            fieldDisplay : [
                                {field: "Institution", display: "Institution"}
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