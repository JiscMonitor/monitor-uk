requirejs.config({
    baseUrl: '/static/',
    paths: {
        jquery: 'vendor/edges_build/vendor/jquery-1.11.1/jquery-1.11.1',
        "jquery-ui" : "vendor/edges_build/vendor/jquery-ui-1.11.1/jquery-ui",
        select2 : "vendor/edges_build/vendor/select2-3.5.1/select2.min",
        d3: "vendor/edges_build/vendor/d3-v3/d3.min",
        nvd3: "vendor/edges_build/vendor/nvd3-1.8.1/nv.d3",
        es : "vendor/edges_build/src/es",
        edges : "vendor/edges_build/src/edges",
        "edges-jquery" : "vendor/edges_build/src/edges.jquery",
        "edges.charts" : "vendor/edges_build/src/components/charts",
        "edges.maps" : "vendor/edges_build/src/components/maps",
        "edges.ranges" : "vendor/edges_build/src/components/ranges",
        "edges.search" : "vendor/edges_build/src/components/search",
        "edges.selectors" : "vendor/edges_build/src/components/selectors",
        "edges.bs3" : "vendor/edges_build/src/renderers/bs3.edges",
        "edges.d3" : "vendor/edges_build/src/renderers/d3.edges",
        "edges.google" : "vendor/edges_build/src/renderers/google.edges",
        "edges.highcharts" : "vendor/edges_build/src/renderers/highcharts.edges",
        "edges.nvd3" : "vendor/edges_build/src/renderers/nvd3.edges",
        "muk_search" : "js/muk_search"
    }
});

requirejs(["jquery"], function() {
    requirejs(["jquery-ui", "select2", "es", "edges-jquery"], function() {
        requirejs(["edges"], function() {
            requirejs(["edges.search", "edges.selectors", "edges.bs3"], function() {
                requirejs(["muk_search"], function() {
                    jQuery(document).ready(function($) {
                        muk_search.makeSearch();
                    });
                })
            })
        })
    })
});

