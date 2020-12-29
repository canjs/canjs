/*jshint funcscope:true*/
/*

# lib/build/multi.js

The bundled build works by loading the _main_ module and all of its
dependencies and then all of the `System.bundle` modules
and their dependencies. It makes a dependency graph that looks like:

```js
{
  moduleName: Node({
    load: Load({
      name: moduleName,
      source: SOURCE
    }),
    dependencies: [moduleName],
    bundles: [bundleName],
  })
}
```

Here's an example:

```js
{
  "jquery": {
    load: {
      name: "jquery",
      source: "jQuery = function(){ ... }"
    },
    dependencies: [],
    bundles: ["profile","settings","login", ...]
  },
  "can/util": {
    load: {
      name: "can/util",
      source: "define(['jquery'], function($){ ... })"
    },
    dependencies: ["jquery"],
    bundles: ["profile","login"]
  }
}
```

A `Load` is a ES6 load record.

A `Node` is an object that contains the load and other
useful information. The build tools only write to `Node` to keep `Load` from being changed.

It manipulates this graph and eventually creates "bundle" graphs.  Bundle graphs look like:

     {
       size: 231231,
       nodes: [node1, node2, ...],
       bundles: [bundleName1, bundleName2]
     }

The nodes in those bundles are written to the filesystem.

*/
var pump = require("pump");
var assignDefaultOptions = require("../assign_default_options");
var bundle = require("../stream/bundle");
var createBundleGraphStream = require("../graph/make_graph_with_bundles").createBundleGraphStream;
var createWriteStream = require("../bundle/write_bundles").createWriteStream;
var stealWriteStream = require("../stream/steal");
var continuousBuild = require("./continuous");
var concat = require("../bundle/concat_stream");
var envify = require("../stream/envify");
var minify = require("../stream/minify");
var transpile = require("../stream/transpile");
var treeshake = require("../stream/treeshake");
var writeBundleManifest = require("../stream/write_bundle_manifest");
var buildType = require("../stream/build_type");


module.exports = function(config, options){
	// Use the build-development environment.
	if(!options) options = {};

	// Watch mode, return a continously building stream.
	if(options.watch) {
		options = assignDefaultOptions(config, options);
		return continuousBuild(config, options);

	} else {
		// Minification is on by default for stealTools.build
		options.minify = options.minify == null ? true : options.minify;

		try {
			options = assignDefaultOptions(config, options);
		} catch(err) {
			return Promise.reject(err);
		}

		// Return a Promise that will resolve after bundles have been written;
		return new Promise(function(resolve, reject) {
			var writeStream = pump(
				createBundleGraphStream(config, options),
				buildType("build"),
				treeshake(),
				transpile(),
				envify(),
				minify(),
				bundle(),
				concat(),
				createWriteStream(),
				stealWriteStream(),
				writeBundleManifest(),
				function(err) {
					// reject the promise if any of the streams fail
					if (err) reject(err);
				}
			);

			writeStream.on("data", function(builtResult){
				// run external steal-tool plugins after the build
				if(options){

					var p = Promise.resolve(builtResult);

					if(options.bundleAssets){
						var bundleAssets = require("steal-bundler");
						p = p.then(function(builtResult) {
							return bundleAssets(builtResult, options.bundleAssets);
						});
					}
				}

				p.then(function (builtResult) {
					resolve(builtResult);
				}).catch(function (error) {
					reject(error);
				});
			});
		});
	}
};
