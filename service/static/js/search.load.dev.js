var edges_base = "vendor/edges_build/";

requirejs.config({
    baseUrl: '/static/',
    paths: {
        jquery: edges_base + 'vendor/jquery-1.11.1/jquery-1.11.1',
        // "jquery-ui" : "vendor/edges_build/vendor/jquery-ui-1.11.1/jquery-ui",
        // select2 : "vendor/edges_build/vendor/select2-3.5.1/select2.min",
        // d3: "vendor/edges_build/vendor/d3-v3/d3.min",
        // nvd3: "vendor/edges_build/vendor/nvd3-1.8.1/nv.d3",

        es : edges_base + "src/es",
        edges : edges_base + "src/edges",
        "edges-jquery" : edges_base + "src/edges.jquery",

        // "edges.charts" : "src/components/charts",
        // "edges.maps" : "src/components/maps",
        "edges.ranges" : edges_base + "src/components/ranges",
        "edges.search" : edges_base + "src/components/search",
        "edges.selectors" : edges_base + "src/components/selectors",

        "edges.bs3.facetview" : edges_base + "src/templates/bs3.Facetview",
        // "edges.bs3.tabbed" : "src/templates/bs3.Tabbed",

        // "edges.bs3.basicrangeselector" : "src/renderers/bs3.BasicRangeSelectorRenderer",
        "edges.bs3.facetfiltersetter" : edges_base + "src/renderers/bs3.FacetFilterSetterRenderer",
        "edges.bs3.fullsearchcontroller" : edges_base + "src/renderers/bs3.FullSearchControllerRenderer",
        // "edges.bs3.multidaterange" : "src/renderers/bs3.MultiDateRangeRenderer",
        "edges.bs3.numericrangeentry" : edges_base + "src/renderers/bs3.NumericRangeEntryRenderer",
        "edges.bs3.ortermselector" : edges_base + "src/renderers/bs3.ORTermSelectorRenderer",
        "edges.bs3.pager" : edges_base + "src/renderers/bs3.PagerRenderer",
        "edges.bs3.refiningandtermselector" : edges_base + "src/renderers/bs3.RefiningANDTermSelectorRenderer",
        "edges.bs3.resultsdisplay" : edges_base + "src/renderers/bs3.ResultsDisplayRenderer",
        "edges.bs3.searchingnotification" : edges_base + "src/renderers/bs3.SearchingNotificationRenderer",
        "edges.bs3.selectedfilters" : edges_base + "src/renderers/bs3.SelectedFiltersRenderer",
        // "edges.bs3.tabularresults" : "src/renderers/bs3.TabularResultsRenderer",

        //"edges.d3" : "src/renderers/d3.edges",
        //"edges.google" : "src/renderers/google.edges",
        //"edges.highcharts" : "src/renderers/highcharts.edges",
        //"edges.nvd3" : "src/renderers/nvd3.edges",

        "muk" : "js-src/muk",
        "muk.search" : "js-src/muk.search"
    }
});

requirejs(["jquery"], function() {
    requirejs(["es", "edges-jquery"], function() {
        requirejs(["edges"], function() {
            requirejs([
                "edges.ranges",
                "edges.search",
                "edges.selectors",
                "edges.bs3.facetfiltersetter",
                "edges.bs3.facetview",
                "edges.bs3.fullsearchcontroller",
                "edges.bs3.numericrangeentry",
                "edges.bs3.ortermselector",
                "edges.bs3.pager",
                "edges.bs3.refiningandtermselector",
                "edges.bs3.resultsdisplay",
                "edges.bs3.searchingnotification",
                "edges.bs3.selectedfilters"
            ], function() {
                requirejs([
                    "muk",
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

