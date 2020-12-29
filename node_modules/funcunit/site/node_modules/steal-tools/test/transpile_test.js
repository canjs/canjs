var assert = require("assert");
var through = require("through2");

var s = require("../index").streams;

describe("streams.transpile", function(){
	var through = require("through2");

	it("Creates a stream of BuildResult", function(done){
		var system = {
			config: __dirname + "/bundle/stealconfig.js",
			main: "bundle"
		};
		var options = { quiet: true };

		var graphStream = s.graph(system, options);
		var buildStream = graphStream
			.pipe(s.transpile())
			.pipe(s.minify())
			.pipe(s.bundle());

		buildStream.pipe(through.obj(function(data){
			assert(data.graph, "has the graph");
			assert(data.bundles, "has the bundles");
			assert(data.configuration, "has the configuration");

			done();
		}));
	});
});
