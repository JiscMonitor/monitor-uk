$.extend(muk, {
    publisher: {
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
                template: edges.bs3.newTabbed(),
                search_url: octopus.config.public_query_endpoint, // "http://localhost:9200/muk/public/_search",
                baseQuery : base_query,
                components: [
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
                    edges.newMultiDateRangeEntry({
                        id : "date_range",
                        fields : [
                            {field : "record.rioxxterms:publication_date", display: "Publication Date"},
                            {field : "record.jm:apc.date_applied", display: "APC Application"},
                            {field : "record.jm:apc.date_paid", display: "APC Paid"}
                        ],
                        /* We'll revisit the date setting later
                        earliest : {
                            "record.rioxxterms:publication_date" : earliestDate,
                            "record.jm:apc.date_applied" : earliestDate,
                            "record.jm:apc.date_paid" : earliestDate
                        },
                        latest : {
                            "monitor.rioxxterms:publication_date" : latestDate,
                            "monitor.jm:dateApplied" : latestDate,
                            "monitor.jm:apc.date_paid" : latestDate
                        },*/
                        category : "lhs"
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