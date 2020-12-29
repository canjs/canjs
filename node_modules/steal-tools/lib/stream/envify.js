var through = require("through2");
var winston = require("winston");
var envifyGraph = require("../graph/envify");

module.exports = function envifyStream() {
	return through.obj(function(data, enc, done) {
		try {
			done(null, inlineNodeEnvironmentVariables(data));
		} catch (err) {
			done(err);
		}
	});
};

// Replaces Node-style environment variables with plain strings.
function inlineNodeEnvironmentVariables(data) {
	var dependencyGraph = data.graph;
	var configuration = data.configuration;
	var options = configuration.options;

	if (options.envify) {
		winston.info("Inlining Node-style environment variables...");
		envifyGraph(dependencyGraph, options);
		envifyGraph(data.configGraph, options);
	}

	return data;
}
