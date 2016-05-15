$.extend(muk, {
    search : {

        newAPCRenderer : function(params) {
            if (!params) { params = {} }
            muk.search.APCRenderer.prototype = edges.newRenderer(params);
            return new muk.search.APCRenderer(params);
        },
        APCRenderer : function(params) {
            //////////////////////////////////////////////
            // parameters that can be passed in

            // what to display when there are no results
            this.noResultsText = params.noResultsText || "No results to display";

            //////////////////////////////////////////////
            // variables for internal state

            this.namespace = "muk-search-apc";

            this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

                var moreBoxId = edges.css_id(this.namespace, "more-" + id, this);
                var moreLinkBoxId = edges.css_id(this.namespace, "more-link-" + id, this);
                var lessLinkBoxId = edges.css_id(this.namespace, "less-link-" + id, this);

                var title = edges.objVal("record.dc:title", res, "Untitled");
                var cost = edges.objVal("index.apc_total_amount_gbp", res, "-");
                var publisher = edges.objVal("record.dcterms:publisher.name", res, "Unknown");
                var journal = edges.objVal("record.dc:source.name", res, "Unknown");
                var apcs = edges.objVal("record.jm:apc", res, []);

                // the body of the bibliographic records
                var biblio = '<div class="row">\
                    <div class="col-md-2"><span class="' + labelClass + '">Publisher</span></div>\
                    <div class="col-md-10"><span class="' + valueClass + '">' + edges.escapeHtml(publisher) + '</span></div>\
                </div>\
                <div class="row">\
                    <div class="col-md-2"><span class="' + labelClass + '">Journal</span></div>\
                    <div class="col-md-10"><span class="' + valueClass + '">' + edges.escapeHtml(journal) + '</span></div>\
                </div>';

                // details about the individual apcs
                var apc = "";
                for (var i = 0; i < apcs.length; i++) {
                    var apc_record = apcs[i];
                    var inst = edges.objVal("organisation_name", apc_record, "Unknown Organisation");
                    var total = edges.objVal("amount_gbp", apc_record, "Unknown Amount");
                    var date = edges.objVal("date_paid", apc_record);
                    var funds = edges.objVal("fund", apc_record, []);

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
                    }

                    apc += '<div class="row">\
                        <div class="col-md-12">\
                            <span class="' + valueClass + '">' + edges.escapeHtml(inst) + '</span> \
                            paid \
                            <span class="' + valueClass + '">£' + edges.escapeHtml(total) + '</span> \
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
                    <div class="col-md-2"><span class="' + costClass + '">£' + edges.escapeHtml(cost) + '</span></div>\
                </div>\
                <div class="' + biblioClass + '"><div class="row"> \
                    <div class="col-md-12">{{BIBLIO}}</div>\
                </div></div>\
                <div class="' + moreBoxClass + '" id="' + moreBoxId + '"><div class="row"> \
                    <div class="col-md-12">{{APCS}}</div>\
                </div></div>\
                <div id="' + moreLinkBoxId + '" class="' + moreLinkBoxClass + '"><div class="row"> \
                    <div class="col-md-12"><a href="#" class="' + moreLinkClass + '" data-id="' + id + '">More</a></div>\
                </div></div>\
                <div id="' + lessLinkBoxId + '" class="' + lessLinkBoxClass + '"><div class="row"> \
                    <div class="col-md-12"><a href="#" class="' + lessLinkClass + '" data-id="' + id + '">Less</a></div>\
                </div></div>';

                frag = frag.replace(/{{BIBLIO}}/g, biblio)
                    .replace(/{{APCS}}/g, apc);

                return frag;
            };

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

        makeSearch : function(params) {
            if (!params) { params = {} }

            var selector = edges.getParam(params.selector, "#muk_search");

            var e = edges.newEdge({
                selector: selector,
                template: edges.bs3.newFacetview(),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
                manageUrl : true,
                components : [
                    edges.newORTermSelector({
                        id: "publisher",
                        field: "record.dcterms:publisher.name.exact",
                        display: "Publisher",
                        size: 500,
                        category: "facet",
                        lifecycle: "update",
                        renderer : edges.bs3.newORTermSelectorRenderer({
                            showCount: true,
                            hideEmpty: true
                        })
                    }),
                    edges.newORTermSelector({
                        id: "journal",
                        field: "record.dc:source.name.exact",
                        display: "Journal",
                        size: 500,
                        category: "facet",
                        lifecycle: "update",
                        renderer : edges.bs3.newORTermSelectorRenderer({
                            showCount: true,
                            hideEmpty: true
                        })
                    }),
                    edges.newNumericRangeEntry({
                        id: "apc_cost",
                        field: "index.total_amount_gbp",
                        display: "APC Cost [from/to]",
                        category: "facet"
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
                            hideEmpty: true
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
                                display: "Multiple APCs",
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
                                display: "Multiple Organisations",
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
                                display: "Multiple Contributors",
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
                            facetTitle : "Duplicates"
                        })
                    }),
                    edges.newFullSearchController({
                        id: "search-controller",
                        category: "controller",
                        sortOptions : [
                            {field: "index.asciiunpunctitle.exact", display: "Title"}
                        ],
                        fieldOptions : [
                            {field: "index.unpunctitle", display: "Title"}
                        ]
                    }),
                    edges.newSelectedFilters({
                        id: "selected-filters",
                        category: "selected-filters",
                        fieldDisplays : {
                            "record.dcterms:publisher.name.exact" : "Publisher",
                            "record.dc:source.name.exact" : "Journal",
                            "record.jm:apc.organisation_name.exact" : "Institution",
                            "index.apc_count" : "Multiple APCs",
                            "index.org_count" : "Multiple Organisations",
                            "index.account_count" : "Multiple Contributors"
                        },
                        rangeMaps : {
                            "index.apc_count" : [{from : 2, display: "Yes"}],
                            "index.org_count" : [{from : 2, display: "Yes"}],
                            "index.account_count" : [{from : 2, display: "Yes"}]
                        }
                    }),
                    edges.newPager({
                        id: "top-pager",
                        category: "top-pager"
                    }),
                    edges.newPager({
                        id: "bottom-pager",
                        category: "bottom-pager"
                    }),
                    edges.newSearchingNotification({
                        id: "searching-notification",
                        category: "searching-notification"
                    }),
                    edges.newResultsDisplay({
                        id: "results",
                        category: "results",
                        /*
                        renderer : edges.bs3.newResultsDisplayRenderer({
                            fieldDisplayMap: [
                                {field: "id", display: "ID"},
                                {field: "record.dc:title", display: "Title"},
                                {field: "index.total_amount_gbp", display: "£"},
                                {field: "record.dcterms:publisher.name", display: "Publisher"},
                                {field: "record.dc:source.name", display: "Journal"},
                                //{field: "record.index.issn", display: "ISSN"},
                                {field: "record.jm:apc.organisation_name", display: "Organisation"}
                                //{field: "record.jm:apc.fund.name", display: "Funder"}
                                //{field: "record.jm:apc.fund.name", display: "Paid from fund"}
                                //{field: "record.ali:licence_ref.type", display: "License"}
                            ]
                        })*/
                        renderer : muk.search.newAPCRenderer({})
                    })
                ]
            });

            muk.activeEdges[selector] = e;
        }
    }
});
