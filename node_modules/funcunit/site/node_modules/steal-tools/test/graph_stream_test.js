var s = require("../index").streams;

var asap = require("pdenodeify");
var assert = require("assert");
var rmdir = asap(require("rimraf"));
var through = require("through2");

describe("streams.graph", function(){
	it("Creates a stream containing the dependency graph", function(done){
		var system = {
			config: __dirname + "/bundle/stealconfig.js",
			main: "bundle"
		};
		var options = { quiet: true };

		var graphStream = s.graph(system, options);

		graphStream.pipe(through.obj(function(data){
			assert(data.graph, "has the graph");
			assert(data.steal, "has steal");
			assert(data.loader, "has the loader");
			assert(data.buildLoader, "has the buildLoader");
			assert(data.config, "has the config object");
			assert(data.options, "has the options object");

			done();
		}));
	});

	it("Works with code using es6", function(done){
		var system = {
			config: __dirname + "/es_graph/package.json!npm"
		};
		var options = { quiet: true };

		var graphStream = s.graph(system, options);

		graphStream.pipe(through.obj(function(data){
			var graph = data.graph;
			assert(graph.main, "Got the main");
			assert(!graph.dep, "There is no dep");
			assert(!graph.other, "There is no other");
			assert(graph.foo, "foo is part of the graph");
			assert(graph.bar, "bar is part of the graph");
			done();
		}));
	});
});
