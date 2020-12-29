var s = require("../index").streams;
var testHelpers = require("./helpers");

var asap = require("pdenodeify");
var assert = require("assert");
var rmdir = asap(require("rimraf"));
var through = require("through2");

var find = testHelpers.find;
var open = testHelpers.open;

describe("streams.write", function(){
	it("Creates a stream that writes out bundles to a destination bundles folder", function(done){
		rmdir(__dirname + "/bundle/dist").then(function(){
			var system = {
				config: __dirname + "/bundle/stealconfig.js",
				main: "bundle"
			};
			var options = { quiet: true };

			var buildStream = s.graph(system, options)
				.pipe(s.transpile())
				.pipe(s.minify())
				.pipe(s.bundle())
				.pipe(s.concat())
				.pipe(s.write());

			buildStream.pipe(through.obj(function(data){
				open("test/bundle/bundle.html#a",function(browser, close){
					find(browser,"appA", function(appA){
						assert(true, "got A");
						assert.equal(appA.name, "a", "got the module");
						assert.equal(appA.ab.name, "a_b", "a got ab");
						assert.equal(appA.clean, undefined, "removed dev code");
						close();
					}, close);
				}, done);
			}));
		});
	});
});
