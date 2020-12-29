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
var assignDefaultOptions = require("../assign_default_options");
var bundle = require("../stream/bundle");
var createBundleGraphStream = require("../graph/make_graph_with_bundles").createBundleGraphStream;
var createWriteStream = require("../bundle/write_bundles").createWriteStream;
var continuousBuild = require("./continuous");
var concat = require("../bundle/concat_stream");
var minify = require("../stream/minify");
var transpile = require("../stream/transpile");


module.exports = function(config, options){
	// Use the build-development environment.
	if(!options) options = {};

	// Watch mode, return a continously building stream.
	if(options.watch) {
		options = assignDefaultOptions(config, options);
		return continuousBuild(config, options);

	} else {
		// Minification is optional, but on by default
		options.minify = options.minify !== false;
		options = assignDefaultOptions(config, options);

		// Get a stream containing the bundle graph
		var graphStream = createBundleGraphStream(config, options);
		// Pipe the bundle graph into the multiBuild steps
		var transpileStream = graphStream.pipe(transpile());
		var minifyStream = transpileStream.pipe(minify());
		var buildStream = minifyStream.pipe(bundle());
		//var buildStream = graphStream.pipe(multiBuild());
		// Pipe the buildStream into concatenation
		var concatStream = buildStream.pipe(concat());

		// Return a Promise that will resolve after bundles have been written;
		return new Promise(function(resolve, reject){
			// Pipe the build result into a write stream.
			var writeStream = concatStream.pipe(createWriteStream());

			writeStream.on("data", function(data){
				this.end();

				// If bundleAssets is truthy run the bundler after the build.
				if(options && options.bundleAssets) {
					require("steal-bundler")(data, options.bundleAssets)
						.then(function(){
							resolve(data);
						}, function(err){
							reject(err);	 
						});
					return;
				}

				resolve(data);
			});

			[ graphStream,
			  transpileStream,
			  minifyStream,
			  buildStream,
			  writeStream
			].forEach(function(stream){
				stream.on("error", reject);
			});
		});
	}

};
