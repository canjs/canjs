var assert = require("assert"),
	comparify = require("comparify"),
	dependencyGraph = require("../lib/graph/make_graph"),
	logging = require("../lib/logger"),
	mapDeps = require("../lib/graph/map_dependencies"),
	orderGraph = require("../lib/graph/order"),
	path = require("path");

describe('dependency graph', function(){
	beforeEach(function() {
		logging.setup({ quiet: true });
	});

	it('should work', function(done){

		dependencyGraph({
			config: path.join(__dirname, "stealconfig.js"),
			startId: "basics",
			logLevel: 3
		}).then(function(data){
			var result = comparify(data.graph, {
				"stealconfig.js": {
					load: {}
				},
				'@dev': {
					load: {
						metadata: {
							// ignore: true
						}
					}
				},
				'basics/basics': {
					deps: ['basics/module/module'],
					dependencies: ['basics/module/module']
				},
				'basics/module/module': {
					deps: ["basics/es6module"],
					dependencies:["basics/es6module"]
				},
				"basics/es6module": {
					deps: ['basics/amdmodule'],
					dependencies:["basics/amdmodule"]
				}
			}, true);


			done();


		}, done);
    });

	it("Should allow extra config options to be passed in", function(done){

		dependencyGraph({
			config: __dirname + "/stealconfig.js",
			startId: "basics",
			extra: "stuff",
			logLevel: 3
		}).then(function(data){
			var steal = data.steal;
			var extra = steal.config("extra");

			assert.equal(extra, "stuff", "Extra config options added");
		}).then(done);

	});

	describe("Utility functions", function(){
		it("Map should work", function(done){
			dependencyGraph({
				config: __dirname + "/stealconfig.js",
				startId: "basics",
				logLevel: 3
			}).then(function(data){
				var graph = data.graph;

				var modules = mapDeps(graph, 'basics/basics', function(name){
					return name;
				});

				comparify(modules, [
					"basics/basics", "basics/module/module",
					"basics/es6module", "basics/amdmodule"
				], true);

			}).then(done);

		});

		describe("Order", function(){
			it("works when a module is dependent on @empty", function(){
				var graph = {
					main: {
						dependencies: ["@empty", "dep"]
					},
					dep: {
						dependencies: []
					}
				};
				orderGraph(graph, "main");
				assert.equal(graph.dep.order, 0, "Dep is first");
				assert.equal(graph.main.order, 1, "Main is second");
			});
		});
	});
});

