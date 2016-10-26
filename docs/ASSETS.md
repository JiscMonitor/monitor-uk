# JavaScript and CSS Asset Management

JavaScript and CSS assets are available in their raw source form, and can then be compiled to a minified version for delivery in a production service.
 
The following directories are relevant:

* service/static/css - both source and minified css files live in here.  Minified files have ".min." in their names.
* service/js - js which has been compiled, or will not be compiled, lives in here.  Files with ".dev." in them are requirejs loaders for the raw source.  Minified files have ".min." in their names.
* service/js-src - js which will be compiled lives in here.  It can be served as-is for the purposes of development.

## Dependencies

In order to compile the assets, you will need to have node and uglify installed on your system.

* NVM (recommended, not required) https://github.com/creationix/nvm
* Node: https://nodejs.org/en/
* Uglify: http://lisperator.net/uglifyjs/

## Compiling

Before compiling the assets, you will need to set the config the asset compiler.  Open assets.json in the root of the code repository, and modify the
paths in the first section:

```json
"parameters" : {
    "uglify" : "/home/user/node_modules/uglify-js/bin/uglifyjs",
    "r_file" : "magnificent-octopus/octopus/static/vendor/edges/build/r.js",
    "tmp_dir" : "tmp",
    "node" : "/home/user/.nvm/versions/node/v5.0.0/bin/node",
    "cleanup" : false
}
```

You should only need to update the path to uglify and the path to node.

To compile the current js-src, you can run

    bash js.build.sh
    
This in turn is just calling:

    python magificent-octopus/octopus/lib/assets.py -c assets.json

When run this will produce all the compiled versions of the JavaScript and CSS, and place them in the relevant directories.

## Build Configuration

The asset build configuration has the following structure:

```json
{
	"parameters" : {
		"uglify" : "/home/richard/node_modules/uglify-js/bin/uglifyjs",
		"r_file" : "magnificent-octopus/octopus/static/vendor/edges/build/r.js",
		"tmp_dir" : "tmp",
		"node" : "/home/richard/.nvm/versions/node/v5.0.0/bin/node",
		"cleanup" : false
	},
	"base_paths" : {
		"<path_id>" : "<path to directory>"
	},
	"assets" : {
		"<asset_id>" : ["<path_id>", "<relative file path>"]
	},
	"dependencies" : {
		"<asset_id>" : ["<other asset_id>", "<another asset_id>", ...]
	},
	"outputs" : {
		"<output_id>" : {
			"out" : ["<path_id>", "<relative file path for output>"],
			"pipeline" : "js|css",
			"assets" : [
				"<asset_id>",
				"<asset_id>", 
				...
			]
		}
	}
}
```

When the build is triggered, all of the "outputs" are compiled and placed in the location specified by the "out" parameter for that output.

The output will only contain the assets listed in the output's "assets" list, and those outputs will be ordered internally according to how the "dependencies" section 
tells it to be ordered.  This means that you can construct an output file which contains only a portion of the dependencies for a given page or application, in case - for example -
you have a dependency such as jquery which is loaded everywhere by default anyway, and does not need to be bundled for a specific output.


## Development vs Deployment

For the purposes of development, it is convenient for code inspection and debugging to use the uncompiled versions of the assets.

In each of the template files for pages which contain javascript applications, there are two sections, one commented out (at the jinja template
level), and one uncommented.

For example, in the funder report:

```html
{# Development assets
<!-- nvd3 styles -->
<link rel="stylesheet" href="{{url_for('static', filename='vendor/edges/vendor/nvd3-1.8.1/nv.d3.css')}}">

<!-- datepicker styles -->
<link rel="stylesheet" href="{{url_for('static', filename='vendor/edges/vendor/bootstrap-daterangepicker-2.1.22/daterangepicker.css')}}">

<!-- edges styles -->
<link rel="stylesheet" href="{{url_for('static', filename='vendor/edges/css/bs3.BSMultiDateRange.css')}}">
<link rel="stylesheet" href="{{url_for('static', filename='vendor/edges/css/bs3.NSeparateORTermSelectorRenderer.css')}}">
<link rel="stylesheet" href="{{url_for('static', filename='vendor/edges/css/bs3.ORTermSelectorRenderer.css')}}">
<link rel="stylesheet" href="{{url_for('static', filename='vendor/edges/css/bs3.SearchingNotificationRenderer.css')}}">
<link rel="stylesheet" href="{{url_for('static', filename='vendor/edges/css/bs3.TabularResultsRenderer.css')}}">

<!-- MUK specific styles -->
<link rel="stylesheet" href="{{url_for('static', filename='css/muk.funder.css')}}">
#}

{# Deployment assets #}
<link rel="stylesheet" href="{{url_for('static', filename='css/muk.funder.dep.min.css')}}">
<link rel="stylesheet" href="{{url_for('static', filename='css/muk.funder.min.css')}}">
{# end Deployment assets #}
```

and

```html
{# Development assets
<script type="text/javascript" src="/static/vendor/edges/vendor/PapaParse-4.1.2/papaparse.min.js"></script>
<script type="text/javascript" src="/static/vendor/edges/vendor/bootstrap-daterangepicker-2.1.22/moment.min.js"></script>
<script data-main="{{ url_for("static", filename="js/funder.load.dev") }}" src="{{ url_for("static", filename="vendor/edges/build/require.js") }}"></script>
#}

{# Deployment assets #}
<script type="text/javascript" src="{{ url_for("static", filename="js/muk.funder.dep.min.js") }}"></script>
<script type="text/javascript" src="{{ url_for("static", filename="js/muk.funder.min.js") }}"></script>

<script type="application/javascript">
    jQuery(document).ready(function($) {
        muk.funder.makeFunderReport();
    });
</script>
{# end Deployment assets #}
```

When working in development, uncomment the "Development assets" section and comment out the "Deployment assets" section.

You must ensure you keep these sections equivalent, which means adding in new stylesheets or javascript references as they are needed,
updating the compilation configuration appropriately, and building the Deployment assets before release.


## Versioning

In order to bust user browser caches, each asset for production is appended with "?v=<version>", which doesn't have any effect
 on the actual asset loaded, but which will force the user's browser to re-download the asset if the version number changes.
 
You can control the version number by setting the config value VERSION in the service config or your local.cfg

For example:

    VERSION = 1.1.0
