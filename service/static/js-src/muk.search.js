$.extend(muk, {
    search : {
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
                        })
                    })
                ]
            });

            muk.activeEdges[selector] = e;
        }
    }
});
