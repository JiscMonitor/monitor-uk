module.exports = function(grunt) {

    grunt.initConfig({
        uglify : {
            minify : {
                options: {

                    /* OPTIONS FOR DEV-ENV
                     * beautify: true - enables code auto-format
                     * compress: false - disables code compression
                     * mangle - false - disables the replacement of function and variable names */

                    beautify: true,
                    compress: false,
                    mangle: false,
                    preserveComments: 'all'
                },
                files : {
                    'service/static/js/muk.funder.min.js' : 'service/static/js-src/muk.funder.js',
                    'service/static/js/muk.institution.min.js' : 'service/static/js-src/muk.institution.js',
                    'service/static/js/muk.min.js' : 'service/static/js-src/muk.js',
                    'service/static/js/muk.publisher.min.js' : 'service/static/js-src/muk.publisher.js',
                    'service/static/js/muk.search.min.js' : 'service/static/js-src/muk.search.js'
                }
            }
        },
        cssmin : {
            minify : {
                files : {
                    'service/static/css/bootstrap-jisc.min.css' : 'service/static/css-src/bootstrap-jisc.css',
                    'service/static/css/muk.APCRenderer.min.css' : 'service/static/css-src/muk.APCRenderer.css',
                    'service/static/css/muk.funder.min.css' : 'service/static/css-src/muk.funder.css',
                    'service/static/css/muk.institution.min.css' : 'service/static/css-src/muk.institution.css',
                    'service/static/css/muk.publisher.min.css' : 'service/static/css-src/muk.publisher.css',
                    'service/static/css/muk.search.min.css' : 'service/static/css-src/muk.search.css',
                    'service/static/css/service.min.css' : 'service/static/css-src/service.css',
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['cssmin','uglify']);

};