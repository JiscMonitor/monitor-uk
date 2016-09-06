var edges_base = "vendor/edges_build/";

requirejs.config({
    baseUrl: '/static/',
    paths: {
        jquery: edges_base + 'vendor/jquery-1.11.1/jquery-1.11.1',
        "jquery-ui" : edges_base + "vendor/jquery-ui-1.11.1/jquery-ui",
        select2 : edges_base + "vendor/select2-3.5.1/select2.min",
        d3: edges_base + "vendor/d3-v3/d3.min",
        nvd3: edges_base + "vendor/nvd3-1.8.1/nv.d3",
        moment : edges_base + "vendor/bootstrap-daterangepicker-2.1.22/moment",
        daterangepicker: edges_base + "vendor/bootstrap-daterangepicker-2.1.22/daterangepicker",
        // FIXME: papaparse can't be loaded asynchronously
        // papa : edges_base + "vendor/PapaParse-4.1.2/papaparse",

        es : edges_base + "src/es",
        edges : edges_base + "src/edges",
        "edges-jquery" : edges_base + "src/edges.jquery",
        "edges.csv" : edges_base + "src/edges.csv",

        "edges.charts" : edges_base + "src/components/charts",
        "edges.ranges" : edges_base + "src/components/ranges",
        "edges.search" : edges_base + "src/components/search",
        "edges.selectors" : edges_base + "src/components/selectors",

        "edges.bs3.bsmultidaterange" : edges_base + "src/renderers/bs3.BSMultiDateRange",
        "edges.bs3.nseparateorterm" : edges_base + "src/renderers/bs3.NSeparateORTermSelectorRenderer",
        "edges.bs3.ortermselector" : edges_base + "src/renderers/bs3.ORTermSelectorRenderer",
        "edges.bs3.searchingnotification" : edges_base + "src/renderers/bs3.SearchingNotificationRenderer",
        "edges.bs3.tabularresults" : edges_base + "src/renderers/bs3.TabularResultsRenderer",

        "edges.nvd3" : edges_base + "src/renderers/nvd3.edges",

        "muk" : "js-src/muk",
        "muk.funder" : "js-src/muk.funder"
    }
});

requirejs(["jquery", "d3"], function() {
    requirejs(["jquery-ui", "select2", "nvd3", "es", "edges-jquery", "daterangepicker"], function() {
        requirejs(["edges"], function() {
            requirejs([
                "edges.csv",
                "edges.charts",
                "edges.ranges",
                "edges.search",
                "edges.selectors",

                "edges.bs3.bsmultidaterange",
                "edges.bs3.nseparateorterm",
                "edges.bs3.ortermselector",
                "edges.bs3.searchingnotification",
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

