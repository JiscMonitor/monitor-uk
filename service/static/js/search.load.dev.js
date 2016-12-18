var edges_base = "vendor/edges/";

requirejs.config({
    baseUrl: '/static/',
    paths: {
        jquery: edges_base + 'vendor/jquery-1.11.1/jquery-1.11.1',
        moment : edges_base + "vendor/bootstrap-daterangepicker-2.1.22/moment",
        daterangepicker: edges_base + "vendor/bootstrap-daterangepicker-2.1.22/daterangepicker",

        es : edges_base + "src/es5x",
        edges : edges_base + "src/edges",
        "edges-jquery" : edges_base + "src/edges.jquery",

        "edges.ranges" : edges_base + "src/components/ranges",
        "edges.search" : edges_base + "src/components/search",
        "edges.selectors" : edges_base + "src/components/selectors",

        "edges.bs3.bsmultidaterangefacet" : edges_base + "src/renderers/bs3.BSMultiDateRangeFacet",
        "edges.bs3.compactselectedfilters" : edges_base + "src/renderers/bs3.CompactSelectedFiltersRenderer",
        "edges.bs3.facetfiltersetter" : edges_base + "src/renderers/bs3.FacetFilterSetterRenderer",
        "edges.bs3.numberedpager" : edges_base + "src/renderers/bs3.NumberedPager",
        "edges.bs3.numericrangeentry" : edges_base + "src/renderers/bs3.NumericRangeEntryRenderer",
        "edges.bs3.ortermselector" : edges_base + "src/renderers/bs3.ORTermSelectorRenderer",
        "edges.bs3.pager" : edges_base + "src/renderers/bs3.PagerRenderer",
        "edges.bs3.resultcountrenderer" : edges_base + "src/renderers/bs3.ResultCountRenderer",
        "edges.bs3.searchbox" :  edges_base + "src/renderers/bs3.SearchBoxRenderer",
        "edges.bs3.searchingnotification" : edges_base + "src/renderers/bs3.SearchingNotificationRenderer",
        "edges.bs3.sort" : edges_base + "src/renderers/bs3.SortRenderer",

        "muk" : "js-src/muk",
        "muk.search" : "js-src/muk.search"
    }
});

requirejs(["jquery"], function() {
    requirejs(["es", "edges-jquery", "daterangepicker"], function() {
        requirejs(["edges"], function() {
            requirejs([
                "edges.ranges",
                "edges.search",
                "edges.selectors",
                "edges.bs3.bsmultidaterangefacet",
                "edges.bs3.compactselectedfilters",
                "edges.bs3.facetfiltersetter",
                "edges.bs3.numberedpager",
                "edges.bs3.numericrangeentry",
                "edges.bs3.ortermselector",
                "edges.bs3.pager",
                "edges.bs3.resultcountrenderer",
                "edges.bs3.searchbox",
                "edges.bs3.searchingnotification",
                "edges.bs3.sort",
                "muk"
            ], function() {
                requirejs([
                    "muk.search"
                ], function() {
                    jQuery(document).ready(function($) {
                        muk.search.makeSearch();
                    });
                })
            })
        })
    })
});

