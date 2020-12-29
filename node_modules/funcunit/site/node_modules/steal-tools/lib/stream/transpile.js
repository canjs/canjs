var clean = require("../graph/clean");
var makeConfiguration = require("../configuration/make");
var pluck = require("../graph/pluck");
var through = require("through2");
var transpile = require("../graph/transpile");
var winston = require("winston");

module.exports = function(){
	return through.obj(function(data, enc, done){
		try {
			var buildResult = transpileGraph(data);
			done(null, buildResult);
		} catch(err){
			done(err);
		}
	});
};

function transpileGraph(data){
	var dependencyGraph = data.graph,
		options = data.options,
		configuration = makeConfiguration(data.loader, data.buildLoader, options);

	// Remove @config so it is not transpiled.  It is a global,
	// but we will want it to run ASAP.
	var stealconfig = pluck(dependencyGraph,
							data.loader.configMain || "@config");

	// Transpile the source to AMD
	options.sourceMapPath = configuration.bundlesPath;
	transpile(stealconfig, "amd", options, data);

	// Remove steal dev from production builds.
	pluck(dependencyGraph,"@dev");

	// Clean development code if the option was passed
	if(options.removeDevelopmentCode) {
		clean(dependencyGraph, options);
	}

	// Transpile each module to amd. Eventually, production builds
	// should be able to work without steal.js.
	winston.info("Transpiling...");
	transpile(dependencyGraph, "amd", options, data);

	data.stealconfig = stealconfig;
	data.configuration = configuration;

	return data;
}
