var clean = require("../graph/clean");
var makeConfiguration = require("../configuration/make");
var pluck = require("../graph/pluck");
var through = require("through2");
var transpile = require("../graph/transpile");
var winston = require("winston");

module.exports = function(options) {
	return through.obj(function(data, enc, done){
		try {
			var buildResult = transpileGraph(data, options || {});
			done(null, buildResult);
		} catch(err){
			done(err);
		}
	});
};

function transpileGraph(data, transpileOptions) {
	var dependencyGraph = data.graph,
		options = data.options,
		configuration = makeConfiguration(data.loader, data.buildLoader, options);

	// Remove @config so it is not transpiled.  It is a global,
	// but we will want it to run ASAP.
	var configGraph = pluck(
		dependencyGraph,
		data.loader.configMain || "@config",
		transpileOptions.keepInGraph || []
	);

	// Remove steal dev from production builds.
	pluck(dependencyGraph, "@dev", transpileOptions.keepInGraph || []);

	// Clean development code if the option was passed
	if(options.removeDevelopmentCode) {
		clean(configGraph, options);
		clean(dependencyGraph, options);
	}

	// Transpile each module to amd. Eventually, production builds
	// should be able to work without steal.js.
	options.sourceMapPath = configuration.bundlesPath;

	winston.info("Transpiling...");
	var outputFormat = transpileOptions.outputFormat || "amd";
	transpile(dependencyGraph, outputFormat, options, data);
	transpile(configGraph, outputFormat, options, data);

	data.configGraph = configGraph;
	data.configuration = configuration;

	return data;
}
