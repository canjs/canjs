var minifyGraph = require("../graph/minify");
var through = require("through2");
var winston = require("winston");

module.exports = function(){
	return through.obj(function(data, enc, done){
		try {
			var result = minify(data);
			done(null, result);
		} catch(err){
			done(err);
		}
	});
};

function minify(data){
	var dependencyGraph = data.graph;
	var configuration = data.configuration;
	var options = configuration.options;

	// Minify every file in the graph
	if(options.minify) {
		winston.info("Minifying...");
		minifyGraph(dependencyGraph, options);
		minifyGraph(data.stealconfig, options);
	}

	return data;
}
