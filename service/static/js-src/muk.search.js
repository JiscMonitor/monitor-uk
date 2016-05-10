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
                    id: "organisation",
                    field: "record.jm:apc.organisation_name.exact",
                    display: "Institution",
                    size: 500,
                    category: "facet",
                    lifecycle: "update",
                    renderer : edges.bs3.newORTermSelectorRenderer({
                        showCount: true
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
                        "record.jm:apc.organisation_name.exact" : "Institution"
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
                            {field: "record.dc:title", display: "Title"}
                        ]
                    })
                })
            ]
        });

        muk.activeEdges[selector] = e;
    }
    }
});
