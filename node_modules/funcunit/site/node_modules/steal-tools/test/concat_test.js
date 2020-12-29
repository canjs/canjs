var s = require("../index").streams;
var graph = s.graph;
var transpile = s.transpile;
var minify = s.minify;
var bundle = s.bundle;
var concat = s.concat;

var asap = require("pdenodeify");
var assert = require("assert");
var rmdir = asap(require("rimraf"));
var through = require("through2");

describe("streams.concat", function(){
	it("Concats nodes in a bundle", function(done){
		var system = {
			config: __dirname + "/bundle/stealconfig.js",
			main: "bundle"
		};
		var options = { minify: false, quiet: true };

		var graphStream = graph(system, options);
		var buildStream = graphStream.pipe(transpile())
			.pipe(minify()).pipe(bundle());
		var concatStream = buildStream.pipe(concat());

		concatStream.pipe(through.obj(function(data){
			var bundles = data.bundles;

			assert(bundles.length, "There were bundles");
			bundles.forEach(function(bundle){
				assert(bundles[0].source, "the bundle has source");
			});
			done();
		}));
	});
});
