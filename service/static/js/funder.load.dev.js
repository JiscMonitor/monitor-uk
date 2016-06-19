var edges_base = "vendor/edges_build/";

requirejs.config({
    baseUrl: '/static/',
    paths: {
        jquery: edges_base + 'vendor/jquery-1.11.1/jquery-1.11.1',
        "jquery-ui" : edges_base + "vendor/jquery-ui-1.11.1/jquery-ui",
        select2 : edges_base + "vendor/select2-3.5.1/select2.min",
        d3: edges_base + "vendor/d3-v3/d3.min",
        nvd3: edges_base + "vendor/nvd3-1.8.1/nv.d3",
        // FIXME: papaparse can't be loaded asynchronously
        // papa : edges_base + "vendor/PapaParse-4.1.2/papaparse",

        es : edges_base + "src/es",
        edges : edges_base + "src/edges",
        "edges-jquery" : edges_base + "src/edges.jquery",
        "edges.csv" : edges_base + "src/edges.csv",

        "edges.charts" : edges_base + "src/components/charts",
        // "edges.maps" : edges_base + "src/components/maps",
        "edges.ranges" : edges_base + "src/components/ranges",
        "edges.search" : edges_base + "src/components/search",
        "edges.selectors" : edges_base + "src/components/selectors",

        // "edges.bs3.facetview" : edges_base + "src/templates/bs3.Facetview",
        "edges.bs3.tabbed" : edges_base + "src/templates/bs3.Tabbed",

        // "edges.bs3.basicrangeselector" : edges_base + "src/renderers/bs3.BasicRangeSelectorRenderer",
        // "edges.bs3.facetfiltersetter" : edges_base + "src/renderers/bs3.FacetFilterSetterRenderer",
        // "edges.bs3.fullsearchcontroller" : edges_base + "src/renderers/bs3.FullSearchControllerRenderer",
        "edges.bs3.multidaterange" : edges_base + "src/renderers/bs3.MultiDateRangeRenderer",
        "edges.bs3.nseparateorterm" : edges_base + "src/renderers/bs3.NSeparateORTermSelectorRenderer",
        // "edges.bs3.numericrangeentry" : edges_base + "src/renderers/bs3.NumericRangeEntryRenderer",
        "edges.bs3.ortermselector" : edges_base + "src/renderers/bs3.ORTermSelectorRenderer",
        // "edges.bs3.pager" : edges_base + "src/renderers/bs3.PagerRenderer",
        "edges.bs3.refiningandtermselector" : edges_base + "src/renderers/bs3.RefiningANDTermSelectorRenderer",
        // "edges.bs3.resultsdisplay" : edges_base + "src/renderers/bs3.ResultsDisplayRenderer",
        "edges.bs3.searchingnotification" : edges_base + "src/renderers/bs3.SearchingNotificationRenderer",
        "edges.bs3.selectedfilters" : edges_base + "src/renderers/bs3.SelectedFiltersRenderer",
        "edges.bs3.tabularresults" : edges_base + "src/renderers/bs3.TabularResultsRenderer",

        //"edges.d3" : edges_base + "src/renderers/d3.edges",
        //"edges.google" : edges_base + "src/renderers/google.edges",
        //"edges.highcharts" : edges_base + "src/renderers/highcharts.edges",
        "edges.nvd3" : edges_base + "src/renderers/nvd3.edges",

        "muk" : "js-src/muk",
        "muk.funder" : "js-src/muk.funder"
    }
});

requirejs(["jquery", "d3"], function() {
    requirejs(["jquery-ui", "select2", "nvd3", "es", "edges-jquery"], function() {
        requirejs(["edges"], function() {
            requirejs([
                "edges.csv",
                "edges.charts",
                "edges.ranges",
                "edges.search",
                "edges.selectors",
                //"edges.bs3.facetfiltersetter",
                //"edges.bs3.facetview",
                "edges.bs3.tabbed",
                //"edges.bs3.fullsearchcontroller",
                "edges.bs3.multidaterange",
                "edges.bs3.nseparateorterm",
                //"edges.bs3.numericrangeentry",
                "edges.bs3.ortermselector",
                //"edges.bs3.pager",
                "edges.bs3.refiningandtermselector",
                //"edges.bs3.resultsdisplay",
                "edges.bs3.searchingnotification",
                "edges.bs3.selectedfilters",
                "edges.bs3.tabularresults",
                "edges.nvd3",
                "muk"
            ], function() {
                requirejs([
                    "muk.funder"
                ], function() {
                    jQuery(document).ready(function($) {
                        muk.funder.makeFunderReport();
                    });
                })
            })
        })
    })
});

