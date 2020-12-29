var createBundleGraphStream = require("../graph/make_graph_with_bundles").createBundleGraphStream;
var recycle = require("../graph/recycle");
var multiBuild = require("../stream/build");
var createConcatStream = require("../bundle/concat_stream");
var createWriteStream = require("../bundle/write_bundles").createWriteStream;
var stealWriteStream = require("../stream/steal");
var watch = require("../stream/watch");
var defaults = require("lodash").defaults;

module.exports = function(config, options){
	var moment = require("moment");

	defaults(options, {
		sourceMaps: true,
		minify: false,
		quiet: true
	});

	var moduleName;

	// A function that is called whenever a module is found by the watch stream.
	// Called with the name of the module and used to rebuild.
	function rebuild(moduleNames){
		moduleName = moduleNames[0] || "";
		moduleNames.forEach(function(moduleName){
			graphStream.write(moduleName);
		});
	}

	function log(){
		var rebuiltPart = moduleName ? moduleName : "";
		var time = "[" + moment().format("LTS") + "]";
		console.error(time.red + (moduleName ? ":" : ""), rebuiltPart.green);
	}

	// Create an initial dependency graph for this config.
	var initialGraphStream = createBundleGraphStream(config, options);
	// Create a stream that is used to regenerate a new graph on file changes.
	var graphStream = recycle(config);

	// Create a build stream that does everything; creates a graph, bundles,
	// and writes the bundles to the filesystem.
	var buildStream = initialGraphStream
		.pipe(graphStream)
		.pipe(multiBuild(config, options))
		.pipe(createConcatStream())
		.pipe(createWriteStream())
		.pipe(stealWriteStream());

	// Watch the build stream and call rebuild whenever it changes.
	var watchStream = watch(graphStream);
	watchStream.on("data", rebuild);

	buildStream.on("data", log);
	graphStream.on("error", function(error){
		// If this is a missing file add it to our watch.
		if(error.code === "ENOENT" && error.path) {
			console.error("File not found:", error.path);
			watchStream.write(error.path);
		}
	});
	buildStream.once("data", function(){
		console.error("Watch mode ready.");
	});
	
	return buildStream;
};
