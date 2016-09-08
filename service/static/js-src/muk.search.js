$.extend(muk, {
    /** @namespace muk.search */
    search : {

        /**
         * Use this to construct the {@link muk.search.SearchTemplate}
         *
         * @type {Function}
         * @memberof muk.search
         * @returns {muk.search.SearchTemplate}
         */
        newSearchTemplate: function (params) {
            if (!params) { params = {} }
            muk.search.SearchTemplate.prototype = edges.newTemplate(params);
            return new muk.search.SearchTemplate(params);
        },

        /**
         * <p>The Search Template main class.</p>
         *
         * <p>This class is responsible for rendering and maintaining the state of the overall UI template for the
         * search interface.</p>
         *
         * <p>You should construct this using {@link muk.search.newSearchTemplate}</p>
         *
         * @constructor
         * @memberof muk.search
         * @extends edges.Template
         */
        SearchTemplate: function (params) {
            ///////////////////////////////////////////
            // internal state

            // later we'll store the edge instance here
            this.edge = false;

            // namespace for css classes and ids
            this.namespace = "muk-search-template";

            /**
             * Draw the template into the page.  This will draw the template into the page element identified
             * by edge.context
             *
             * @type {Function}
             * @param edge {Edge} The Edge instance requesting the draw
             */
            this.draw = function (edge) {
                this.edge = edge;

                // the classes we're going to need
                var containerClass = edges.css_classes(this.namespace, "container");
                var searchClass = edges.css_classes(this.namespace, "search");
                var facetsClass = edges.css_classes(this.namespace, "facets");
                var countClass = edges.css_classes(this.namespace, "count");
                var sortClass = edges.css_classes(this.namespace, "sort");
                var resultsClass = edges.css_classes(this.namespace, "results");
                var itemsClass = edges.css_classes(this.namespace, "items");
                var pagerClass = edges.css_classes(this.namespace, "pager");
                var facetClass = edges.css_classes(this.namespace, "facet");
                var searchingClass = edges.css_classes(this.namespace, "searching");
                var panelClass = edges.css_classes(this.namespace, "panel");
                var refineClass = edges.css_classes(this.namespace, "refine");

                var frag = '<div class="' + containerClass + '">\
                    <div class="row"><div class="col-md-12"><div class="' + searchClass + '">{{SEARCH}}</div></div></div>\
                    <div class="row"><div class="col-md-12"><div class="' + searchingClass + '">{{SEARCHING}}</div></div></div>\
                    <div class="' + panelClass + '"><div class="row">\
                        <div class="col-md-3"><div class="' + facetsClass + '"><div class="' + refineClass + '">Refine</div>{{FACETS}}</div></div>\
                        <div class="col-md-9">\
                            <div class="row">\
                                <div class="col-md-6"><div class="' + countClass + '">{{RESULTCOUNT}}</div></div>\
                                <div class="col-md-6"><div class="' + sortClass + '">{{SORT}}</div></div>\
                            </div>\
                            <div class="row">\
                                <div class="col-md-12"><div class="' + resultsClass + '">{{RESULTS}}</div></div>\
                            </div>\
                            <div class="row">\
                                <div class="col-md-12"><div class="' + itemsClass + '">{{ITEMSPERPAGE}}</div></div>\
                            </div>\
                            <div class="row">\
                                <div class="col-md-12"><div class="' + pagerClass + '">{{PAGER}}</div></div>\
                            </div>\
                        </div>\
                    </div></div>\
                </div>';

                var searchFrag = "";
                var searches = edge.category("search");
                for (var i = 0; i < searches.length; i++) {
                    searchFrag += '<div id="' + searches[i].id + '"></div>';
                }

                var searchingFrag = "";
                var searchings = edge.category("searching-notification");
                for (var i = 0; i < searchings.length; i++) {
                    searchingFrag += '<div id="' + searchings[i].id + '"></div>';
                }

                var facets = edge.category("facet");
                var facetsFrag = "";
                for (var i = 0; i < facets.length; i++) {
                    facetsFrag += '<div class="' + facetClass + '"><div id="' + facets[i].id + '"></div></div>';
                }

                var countFrag = "";
                var counts = edge.category("count");
                for (var i = 0; i < counts.length; i++) {
                    countFrag += '<div id="' + counts[i].id + '"></div>';
                }

                var sortFrag = "";
                var sorts = edge.category("sort");
                for (var i = 0; i < sorts.length; i++) {
                    sortFrag += '<div id="' + sorts[i].id + '"></div>';
                }

                var resultsFrag = "";
                var results = edge.category("results");
                for (var i = 0; i < results.length; i++) {
                    resultsFrag += '<div id="' + results[i].id + '"></div>';
                }

                var itemsFrag = "";
                var items = edge.category("items");
                for (var i = 0; i < items.length; i++) {
                    itemsFrag += '<div id="' + items[i].id + '"></div>';
                }

                var pagerFrag = "";
                var pagers = edge.category("pager");
                for (var i = 0; i < pagers.length; i++) {
                    pagerFrag += '<div id="' + pagers[i].id + '"></div>';
                }

                frag = frag.replace(/{{SEARCH}}/g, searchFrag)
                            .replace(/{{SEARCHING}}/g, searchingFrag)
                            .replace(/{{FACETS}}/g, facetsFrag)
                            .replace(/{{RESULTCOUNT}}/g, countFrag)
                            .replace(/{{SORT}}/g, sortFrag)
                            .replace(/{{RESULTS}}/g, resultsFrag)
                            .replace(/{{ITEMSPERPAGE}}/g, itemsFrag)
                            .replace(/{{PAGER}}/g, pagerFrag);

                edge.context.html(frag);
            };
        },

        /**
         * Use this to construct the {@link muk.search.APCRenderer}
         *
         * @type {Function}
         * @memberof muk.search
         * @param {Object} [params={}]  parameters for the renderer
         * @param {String} [params.noResultsText="No results to display"]   text to display if there are no results in the result set
         * @returns {muk.search.APCRenderer}
         */
        newAPCRenderer : function(params) {
            if (!params) { params = {} }
            muk.search.APCRenderer.prototype = edges.newRenderer(params);
            return new muk.search.APCRenderer(params);
        },

        /**
         * <p>Custom renderer for rendering the search results list in the form required to present the appropriate
         * APC information</p>
         *
         * <p>You should construct this using {@link muk.search.newAPCRenderer}</p>
         *
         * @constructor
         * @memberof muk.search
         * @param {Object} params  parameters for the renderer
         * @param {String} [params.noResultsText="No results to display"]   text to display if there are no results in the result set
         */
        APCRenderer : function(params) {
            //////////////////////////////////////////////
            // parameters that can be passed in

            // what to display when there are no results
            this.noResultsText = edges.getParam(params.noResultsText, "No results to display");

            //////////////////////////////////////////////
            // variables for internal state

            // namespace for css classes and ids
            this.namespace = "muk-search-apc";

            // Names of the months, in order, for use when formatting dates
            this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            /**
             * <p>Draw the component into the page.  This will draw the component into the page element identified
             * by this.component.context.</p>
             *
             * <p>This function draws the overall frame for the result set, and then delegates each individual record
             * to {@link muk.search.APCRenderer#_renderResult}</p>
             *
             * @type {Function}
             */
            this.draw = function() {
                var frag = this.noResultsText;
                if (this.component.results === false) {
                    frag = "";
                }

                var results = this.component.results;
                if (results && results.length > 0) {
                    // list the css classes we'll require
                    var recordClasses = edges.css_classes(this.namespace, "record", this);

                    // now call the result renderer on each result to build the records
                    frag = "";
                    for (var i = 0; i < results.length; i++) {
                        var rec = this._renderResult(results[i]);
                        frag += '<div class="row"><div class="col-md-12"><div class="' + recordClasses + '">' + rec + '</div></div></div>';
                    }
                }

                // finally stick it all together into the container
                var containerClasses = edges.css_classes(this.namespace, "container", this);
                var container = '<div class="' + containerClasses + '">' + frag + '</div>';
                this.component.context.html(container);

                // now bind the "more"/"less" buttons
                var moreSelector = edges.css_class_selector(this.namespace, "more-link", this);
                edges.on(moreSelector, "click", this, "showMore");

                var lessSelector = edges.css_class_selector(this.namespace, "less-link", this);
                edges.on(lessSelector, "click", this, "showLess");
            };

            /**
             * Create and return the HTML for an individual result
             *
             * @param {Object} res  a result record from the ES results
             * @returns {String} The HTML fragment to be rendered into the page
             * @private
             */
            this._renderResult = function(res) {
                var id = edges.objVal("id", res);

                var titleClass = edges.css_classes(this.namespace, "title", this);
                var costClass = edges.css_classes(this.namespace, "cost", this);
                var biblioClass = edges.css_classes(this.namespace, "biblio", this);
                var labelClass = edges.css_classes(this.namespace, "label", this);
                var valueClass = edges.css_classes(this.namespace, "value", this);
                var moreLinkClass = edges.css_classes(this.namespace, "more-link", this);
                var moreLinkBoxClass = edges.css_classes(this.namespace, "more-link-box", this);
                var lessLinkClass = edges.css_classes(this.namespace, "less-link", this);
                var lessLinkBoxClass = edges.css_classes(this.namespace, "less-link-box", this);
                var moreBoxClass = edges.css_classes(this.namespace, "more-box", this);
                var vatClass = edges.css_classes(this.namespace, "vat", this);
                var inlineLabelClass = edges.css_classes(this.namespace, "inline-label", this);
                var rightClass = edges.css_classes(this.namespace, "right", this);
                var biblioRowClass = edges.css_classes(this.namespace, "bib-row", this);
                var innerMoreClass = edges.css_classes(this.namespace, "inner-more", this);
                var innerMoreLinkClass = edges.css_classes(this.namespace, "inner-more-link", this);
                var innerLessLinkClass = edges.css_classes(this.namespace, "inner-less-link", this);

                var moreBoxId = edges.css_id(this.namespace, "more-" + id, this);
                var moreLinkBoxId = edges.css_id(this.namespace, "more-link-" + id, this);
                var lessLinkBoxId = edges.css_id(this.namespace, "less-link-" + id, this);

                // get the values out of the object
                var title = edges.objVal("record.dc:title", res, "Untitled");
                var cost = edges.objVal("index.amount_inc_vat", res, false);
                var publisher = edges.objVal("record.dcterms:publisher.name", res, "Unknown");
                var journal = edges.objVal("record.dc:source.name", res, "Unknown");
                var apcs = edges.objVal("record.jm:apc", res, []);
                var journal_ids = edges.objVal("record.dc:source.identifier", res, []);
                var projects = edges.objVal("record.rioxxterms:project", res, []);
                var license_ref = edges.objVal("record.ali:license_ref", res, []);

                // make any display changes required to the values
                if (cost !== false) {
                    cost = muk.toGBPIntFormat()(cost);
                } else {
                    cost = "£-"
                }

                var orgList = [];
                var fundList = [];
                for (var i = 0; i < apcs.length; i++) {
                    var org = edges.objVal("organisation_name", apcs[i], false);
                    if (org !== false && $.inArray(org, orgList) === -1) {
                        orgList.push(org);
                    }
                    var funds = edges.objVal("fund", apcs[i], []);
                    for (var j = 0; j < funds.length; j++) {
                        var fname = funds[j].name;
                        if (fname && $.inArray(fname, fundList) === -1) {
                            fundList.push(fname);
                        }
                    }
                }
                var orgs = orgList.join(", ");
                var funds = fundList.join(", ");

                var issnList = [];
                for (var i = 0; i < journal_ids.length; i++) {
                    var jid = journal_ids[i];
                    if (jid.type === "issn") {
                        issnList.push(jid.id);
                    }
                }
                var issnFrag = "";
                var journalWidth = "10";
                if (issnList.length > 0) {
                    issnFrag = '<div class="col-md-8">(<span class="' + inlineLabelClass + '">ISSN:</span>&nbsp;<span class="' + valueClass + '">' + edges.escapeHtml(issnList.join(", ")) + '</span>)</div>';
                    journalWidth = "2";
                }

                var funderList = [];
                for (var i = 0; i < projects.length; i++) {
                    var fname = projects[i].funder_name;
                    if (fname && $.inArray(fname, funderList) === -1) {
                        funderList.push(fname);
                    }
                }
                var funders = funderList.join(", ");

                var licenceList = [];
                for (var i = 0; i < license_ref.length; i++) {
                    var lname = license_ref[i].type;
                    if (lname && $.inArray(lname, licenceList) === -1) {
                        licenceList.push(lname);
                    }
                }
                var licences = licenceList.join(", ");

                // the body of the bibliographic records
                var biblio = '<div class="' + biblioRowClass + '"><div class="row">\
                    <div class="col-md-2"><span class="' + labelClass + '">Publisher</span></div>\
                    <div class="col-md-10"><span class="' + valueClass + '">' + edges.escapeHtml(publisher) + '</span></div>\
                </div></div>\
                <div class="' + biblioRowClass + '"><div class="row">\
                    <div class="col-md-2"><span class="' + labelClass + '">Journal</span></div>\
                    <div class="col-md-' + journalWidth + '"><span class="' + valueClass + '">' + edges.escapeHtml(journal) + '</span></div>\
                    ' + issnFrag + '\
                </div></div>\
                <div class="' + biblioRowClass + '"><div class="row">\
                    <div class="col-md-2"><span class="' + labelClass + '">Organisation</span></div>\
                    <div class="col-md-10"><span class="' + valueClass + '">' + edges.escapeHtml(orgs) + '</span></div>\
                </div></div>\
                <div class="' + biblioRowClass + '"><div class="row">\
                    <div class="col-md-2"><span class="' + labelClass + '">Funder</span></div>\
                    <div class="col-md-2"><span class="' + valueClass + '">' + edges.escapeHtml(funders) + '</span></div>\
                    <div class="col-md-2"><span class="' + labelClass + '">Paid from fund</span></div>\
                    <div class="col-md-2"><span class="' + valueClass + '">' + edges.escapeHtml(funds) + '</span></div>\
                    <div class="col-md-2"><span class="' + labelClass + '">Licence</span></div>\
                    <div class="col-md-2"><span class="' + valueClass + '">' + edges.escapeHtml(licences) + '</span></div>\
                </div></div>';

                // details about the individual apcs
                var apc = "";
                for (var i = 0; i < apcs.length; i++) {
                    var apc_record = apcs[i];
                    var inst = edges.objVal("organisation_name", apc_record, "Unknown Organisation");
                    var total = edges.objVal("amount_inc_vat_gbp", apc_record, false);
                    var date = edges.objVal("date_paid", apc_record);
                    var funds = edges.objVal("fund", apc_record, []);

                    if (total !== false) {
                        total = muk.toGBPIntFormat()(total);
                    } else {
                        total = "Unknown Amount";
                    }

                    var fund_names = [];
                    for (var j = 0; j < funds.length; j++) {
                        var fund = funds[j];
                        var fund_name = edges.objVal("name", fund, "Unknown Fund");
                        fund_names.push(fund_name);
                    }

                    if (date) {
                        var dobj = new Date(date);
                        var day = dobj.getUTCDate();
                        var month = this.months[dobj.getUTCMonth()];
                        var year = dobj.getUTCFullYear();
                        date = day + " " + month + " " + year;
                    } else {
                        date = "Unknown Date";
                    }

                    apc += '<div class="row">\
                        <div class="col-md-12">\
                            <span class="' + valueClass + '">' + edges.escapeHtml(inst) + '</span> \
                            paid \
                            <span class="' + valueClass + '">' + edges.escapeHtml(total) + '</span> \
                            on \
                            <span class="' + valueClass + '">' + edges.escapeHtml(date) + '</span> \
                            from fund(s): \
                            <span class="' + valueClass + '">' + edges.escapeHtml(fund_names.join(", ")) + '</span> \
                        </div>\
                    </div>';
                }


                // the main layout template, and all the extra bells and whistles
                var frag = '<div class="row"> \
                    <div class="col-md-10"><span class="' + titleClass + '">' + edges.escapeHtml(title) + '</span></div>\
                    <div class="col-md-2"><div class="' + rightClass + '"><span class="' + costClass + '">' + edges.escapeHtml(cost) + '</span><br>\
                        <span class="' + vatClass + '">(inc VAT)</span>\
                    </div></div>\
                </div>\
                <div class="' + biblioClass + '"><div class="row"> \
                    <div class="col-md-12">{{BIBLIO}}</div>\
                </div></div>\
                <div class="' + moreBoxClass + '" id="' + moreBoxId + '"><div class="row"> \
                    <div class="col-md-12"><div class="' + innerMoreClass + '">{{APCS}}</div></div>\
                </div></div>\
                <div id="' + moreLinkBoxId + '" class="' + moreLinkBoxClass + '"><div class="row"> \
                    <div class="col-md-12"><div class="' + innerMoreLinkClass + '"><a href="#" class="' + moreLinkClass + '" data-id="' + id + '">More</a></div></div>\
                </div></div>\
                <div id="' + lessLinkBoxId + '" class="' + lessLinkBoxClass + '"><div class="row"> \
                    <div class="col-md-12"><div class="' + innerLessLinkClass + '"><a href="#" class="' + lessLinkClass + '" data-id="' + id + '">Less</a></div></div>\
                </div></div>';

                frag = frag.replace(/{{BIBLIO}}/g, biblio)
                    .replace(/{{APCS}}/g, apc);

                return frag;
            };

            /**
             * Event handler for when an individual result has it's "more" link clicked.  Causes that section
             * of the page to expand.
             *
             * @param {DOM} element   the link element clicked
             */
            this.showMore = function(element) {
                var e = this.component.jq(element);
                var id = e.attr("data-id");

                var moreBoxSelector = edges.css_id_selector(this.namespace, "more-" + id, this);
                var lessLinkBoxSelector = edges.css_id_selector(this.namespace, "less-link-" + id, this);
                var moreLinkBoxSelector = edges.css_id_selector(this.namespace, "more-link-" + id, this);

                this.component.jq(moreLinkBoxSelector).hide();
                this.component.jq(moreBoxSelector).slideDown(200);
                this.component.jq(lessLinkBoxSelector).show();
            };

            /**
             * Event handler for when an individual result has it's "less" link clicked.  Causes that section
             * of the page to contract.
             *
             * @param {DOM} element   the link element clicked
             */
            this.showLess = function(element) {
                var e = this.component.jq(element);
                var id = e.attr("data-id");

                var moreBoxSelector = edges.css_id_selector(this.namespace, "more-" + id, this);
                var moreLinkBoxSelector = edges.css_id_selector(this.namespace, "more-link-" + id, this);
                var lessLinkBoxSelector = edges.css_id_selector(this.namespace, "less-link-" + id, this);

                this.component.jq(lessLinkBoxSelector).hide();
                this.component.jq(moreBoxSelector).slideUp(200);
                this.component.jq(moreLinkBoxSelector).show();
            }
        },

        /**
         * Format a given date range for display and use in data-* elements
         *
         * @memberof muk.search
         * @param {Object} params   parameters for this function
         * @param {String} params.field      field from which the data came (currently unused)
         * @param {String|Date} params.from From date.  If a string, must work with "new Date(string)"
         * @param {String|Date} params.from To date   If a string, must work with "new Date(string)"
         * @returns {Object}  {to: {String|Date}, from: {String|Date}, display: {String}} to and from are as you passed in
         */
        formatDateRange : function(params) {
            var field = params.field;
            var from = params.from;
            var to = params.to;

            var fd = new Date(from);
            var td = new Date(to);

            var months = [
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ];

            var fs = months[fd.getUTCMonth()] + " " + fd.getUTCDate() + ", " + fd.getUTCFullYear();
            var ts = months[td.getUTCMonth()] + " " + td.getUTCDate() + ", " + td.getUTCFullYear();

            return {to: to, from: from, display: "From " + fs + " to " + ts };
        },

        /**
         * <p>Primary entry point to the Search interface for pages wishing to present it.</p>
         *
         * <p>Call this function with the appropriate arguments, and it will render the search interface into the specified page element</p>
         *
         * @type {Function}
         * @memberof muk.search
         * @param {Object} [params={}]   Object containing all the parameters for this search
         * @param {String} [params.selector="#muk_search"]     jquery selector for page element in which to render the search
         */
        makeSearch : function(params) {
            if (!params) { params = {} }
            var selector = edges.getParam(params.selector, "#muk_search");

            var opening_query = es.newQuery();
            opening_query.addSortBy(es.newSort({
                field: "created_date",
                dir : "desc"
            }));

            var e = edges.newEdge({
                selector: selector,
                template: muk.search.newSearchTemplate(),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
                manageUrl : true,
                openingQuery: opening_query,
                components : [
                    edges.newFullSearchController({
                        id: "search-box",
                        category: "search",
                        renderer : edges.bs3.newSearchBoxRenderer({
                            clearButton: false,
                            searchButton: true,
                            searchButtonText: "Search",
                            searchPlaceholder: "Enter a title, journal, publisher, funder, organisation...",
                            freetextSubmitDelay: -1
                        })
                    }),
                    edges.newSelectedFilters({
                        id: "selected-filters",
                        category: "facet",
                        fieldDisplays : {
                            "record.dcterms:publisher.name.exact" : "Publisher",
                            "record.dc:source.name.exact" : "Journal",
                            "index.amount_inc_vat" : "APC Cost",
                            "record.jm:apc.organisation_name.exact" : "Institution",
                            "index.apc_count" : "Multiple APCs",
                            "index.org_count" : "Multiple Organisations",
                            "index.account_count" : "Multiple Contributors",
                            "record.dc:source.oa_type.exact" : "Journal Type",
                            "record.rioxxterms:publication_date" : "Publication Date",
                            "record.jm:apc.date_applied" : "APC Application",
                            "record.jm:apc.date_paid" : "Date Paid"
                        },
                        valueMaps : {
                            "record.dc:source.oa_type.exact" : {
                                "oa" : "Pure OA",
                                "hybrid" : "Hybrid",
                                "unknown" : "Unknown"
                            }
                        },
                        rangeMaps : {
                            "index.apc_count" : [{from : 2, display: "Yes"}],
                            "index.org_count" : [{from : 2, display: "Yes"}],
                            "index.account_count" : [{from : 2, display: "Yes"}]
                        },
                        rangeFunctions : {
                            "record.rioxxterms:publication_date" : muk.search.formatDateRange,
                            "record.jm:apc.date_applied" : muk.search.formatDateRange,
                            "record.jm:apc.date_paid" : muk.search.formatDateRange
                        },
                        renderer : edges.bs3.newCompactSelectedFiltersRenderer({
                            header: "Refined by",
                            openIcon: "glyphicon glyphicon-chevron-down",
                            closeIcon: "glyphicon glyphicon-chevron-up",
                            layout: "right",
                            open: true
                        })
                    }),
                    edges.newORTermSelector({
                        id: "journal",
                        field: "record.dc:source.name.exact",
                        display: "Journal",
                        size: 10000,
                        category: "facet",
                        lifecycle: "update",
                        renderer : edges.bs3.newORTermSelectorRenderer({
                            showCount: true,
                            hideEmpty: true,
                            openIcon: "glyphicon glyphicon-chevron-down",
                            closeIcon: "glyphicon glyphicon-chevron-up",
                            layout: "right",
                            open: true
                        })
                    }),
                    edges.newORTermSelector({
                        id: "organisation",
                        field: "record.jm:apc.organisation_name.exact",
                        display: "Institution",
                        size: 500,
                        category: "facet",
                        lifecycle: "update",
                        renderer : edges.bs3.newORTermSelectorRenderer({
                            showCount: true,
                            hideEmpty: true,
                            openIcon: "glyphicon glyphicon-chevron-down",
                            closeIcon: "glyphicon glyphicon-chevron-up",
                            layout: "right",
                            open: true
                        })
                    }),
                    edges.newNumericRangeEntry({
                        id: "apc_cost",
                        field: "index.amount_inc_vat",
                        display: "APC Cost",
                        category: "facet",
                        increment: 500,
                        renderer : edges.bs3.newNumericRangeEntryRenderer({
                            openIcon: "glyphicon glyphicon-chevron-down",
                            closeIcon: "glyphicon glyphicon-chevron-up",
                            layout: "right",
                            open: true
                        })
                    }),
                    edges.newORTermSelector({
                        id: "oa_type",
                        field: "record.dc:source.oa_type.exact",
                        display: "Journal Type",
                        category: "facet",
                        lifecycle: "update",
                        valueMap : {
                            "oa" : "Pure OA",
                            "hybrid" : "Hybrid",
                            "unknown" : "Unknown"
                        },
                        renderer : edges.bs3.newORTermSelectorRenderer({
                            showCount: true,
                            hideEmpty: false,
                            openIcon: "glyphicon glyphicon-chevron-down",
                            closeIcon: "glyphicon glyphicon-chevron-up",
                            layout: "right",
                            open: true
                        })
                    }),
                    edges.newMultiDateRangeEntry({
                        id : "date_range",
                        category : "facet",
                        display: "Date",
                        fields : [
                            {field : "record.rioxxterms:publication_date", display: "Publication Date"},
                            {field : "record.jm:apc.date_applied", display: "APC Application"},
                            {field : "record.jm:apc.date_paid", display: "APC Paid"}
                        ],
                        autoLookupRange: true,
                        renderer : edges.bs3.newBSMultiDateRangeFacet({
                            openIcon: "glyphicon glyphicon-chevron-down",
                            closeIcon: "glyphicon glyphicon-chevron-up",
                            layout: "right",
                            prefix: "Show records where",
                            ranges : muk.yearRanges({
                                    "academic year" : "09-01",
                                    "fiscal year" : "04-01",
                                    "calendar year" : "01-01"
                                },
                                {"This " : 0, "Last " : 1}
                            ),
                            open: true
                        })
                    }),
                    edges.newFilterSetter({
                        id : "deduplicate",
                        category: "facet",
                        aggregations : [
                            es.newRangeAggregation({
                                name: "apc_count",
                                field: "index.apc_count",
                                ranges: [{from : 2}]
                            }),
                            es.newRangeAggregation({
                                name: "org_count",
                                field: "index.org_count",
                                ranges: [{from : 2}]
                            }),
                            es.newRangeAggregation({
                                name: "account_count",
                                field: "index.account_count",
                                ranges: [{from : 2}]
                            })
                        ],
                        filters : [
                            {
                                id: "multiple_apcs",
                                display: "More than one APC has been paid (by anyone)",
                                must : [
                                    es.newRangeFilter({
                                        field: "index.apc_count",
                                        gte: 2
                                    })
                                ],
                                agg_name: "apc_count",
                                bucket_field: "from",
                                bucket_value: 2
                            },
                            {
                                id : "multiple_orgs",
                                display: "More than one organisation has paid an APC",
                                must : [
                                    es.newRangeFilter({
                                        field: "index.org_count",
                                        gte: 2
                                    })
                                ],
                                agg_name: "org_count",
                                bucket_field: "from",
                                bucket_value: 2
                            },
                            {
                                id : "multiple_accs",
                                display: "More than one user account has reported an APC payment",
                                must : [
                                    es.newRangeFilter({
                                        field: "index.account_count",
                                        gte: 2
                                    })
                                ],
                                agg_name: "account_count",
                                bucket_field: "from",
                                bucket_value: 2
                            }
                        ],
                        renderer : edges.bs3.newFacetFilterSetterRenderer({
                            facetTitle : "Search for duplicates",
                            intro: "Show records where:",
                            openIcon: "glyphicon glyphicon-chevron-down",
                            closeIcon: "glyphicon glyphicon-chevron-up",
                            layout: "right",
                            open: true
                        })
                    }),
                    edges.newPager({
                        id: "result-count",
                        category: "count",
                        renderer : edges.bs3.newResultCountRenderer({
                            prefix: "Results (",
                            suffix: ")"
                        })
                    }),
                    edges.newFullSearchController({
                        id: "sort-box",
                        category: "sort",
                        sortOptions : [
                            {field : "record.dc:title.exact", dir: "asc", display: "Title (A-Z)"},
                            {field : "record.dc:title.exact", dir: "desc", display: "Title (Z-A)"},
                            {field : "index.amount_inc_vat", dir: "asc", display: "APC Cost (Low - High)"},
                            {field : "index.amount_inc_vat", dir: "desc", display: "APC Cost (High - Low)"},
                            {field : "created_date", dir: "desc", display : "Most recent"}
                        ],
                        renderer : edges.bs3.newSortRenderer({
                            prefix: "Sort: ",
                            dirSwitcher: false
                        })
                    }),
                    edges.newPager({
                        id: "results-size",
                        category: "pager",
                        renderer : edges.bs3.newPagerRenderer({
                            showRecordCount: false,
                            showPageNavigation: false,
                            sizePrefix: "Show ",
                            sizeSuffix: "&nbsp;&nbsp;&nbsp;&nbsp;items per page"
                        })
                    }),
                    edges.newPager({
                        id: "page-navigation",
                        category: "pager",
                        renderer : edges.bs3.newNumberedPager({

                        })
                    }),
                    edges.newSearchingNotification({
                        id: "searching-notification",
                        category: "searching-notification"
                    }),
                    edges.newResultsDisplay({
                        id: "results",
                        category: "results",
                        renderer : muk.search.newAPCRenderer({})
                    })
                ]
            });

            muk.activeEdges[selector] = e;
        }
    }
});
