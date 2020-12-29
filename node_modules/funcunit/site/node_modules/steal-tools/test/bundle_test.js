var assert = require("assert"),
	bundle = require("../lib/graph/make_graph_with_bundles"),
	logging = require("../lib/logger"),
	comparify = require("comparify");

describe("bundle", function(){
	beforeEach(function(){
		logging.setup({ quiet: true });
	});

	it("should work", function(done){

		bundle({
			config: __dirname+"/bundle/stealconfig.js",
			main: "bundle",
			logLevel: 3
		}).then(function(data){
			var graphCompare = require('./bundle/bundle_graph');
			comparify(data.graph, graphCompare, true);
			done();

		}).catch(function(e){
			done(e)
		});
	});

	it("works with globs", function(done){
		bundle({
			config: __dirname+"/bundle/stealconfig.js",
			main: "bundle",
			logLevel: 3,
			bundle: "app_*"
		}).then(function(data){
			var graphCompare = require('./bundle/bundle_graph');
			comparify(data.graph, graphCompare, true);
			done();

		}).catch(function(e){
			done(e)
		});
	});

	it("localSteal run in 'build' platform", function(done){
		var system = {
			config: __dirname + "/live_reload/package.json!npm"
		};
		var options = {
			quiet: true
		};
		bundle(system, options).then(function(data){
			assert.equal('build', data.loader.getPlatform());
			done();
		}).catch(function(e){
			done(e)
		});
	});

});
