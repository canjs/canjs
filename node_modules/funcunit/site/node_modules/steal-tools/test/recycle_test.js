var assert = require("assert"),
	bundle = require("../lib/graph/make_graph_with_bundles"),
	fs = require("fs-extra"),
	logging = require("../lib/logger"),
	mockFs = require("mock-fs"),
	path = require("path"),
	recycle = require("../lib/graph/recycle");

describe("Recycle", function(){
	beforeEach(function() {
		logging.setup({ quiet: true });
	});

	afterEach(mockFs.restore);

	it("Works with a project using live-reload", function(done){
		var config = {
			config: __dirname + "/live_reload/package.json!npm",
			logLevel: 3
		};
		var options = {
			localStealConfig: {
				env: "build-development"
			}
		};

		var depStream = bundle.createBundleGraphStream(config, options);
		var recycleStream = recycle(config, options);

		depStream.pipe(recycleStream);

		// Wait for it to initially finish loading.
		recycleStream.once("data", function(data){
			var node = data.graph.foo;
			var mockOptions = {};
			// Fake string as the source.
			mockOptions[node.load.address.replace("file:", "")] = "module.exports = 'foo'";
			mockFs(mockOptions);

			recycleStream.once("data", function(data){
				var node = data.graph.main;

				assert(/foo/.test(node.load.source), "Source changed");
				done();
			});

			recycleStream.write(node.load.name);
		});
	});

	it("Detects dynamic imports added when no static dependencies have changed", function(done){
		var config = {
			config: path.join(__dirname, "/recycle_dynamic/config.js"),
			main: "something.txt!plug",
			logLevel: 3,
			map: { "@dev": "@empty" }
		};

		var depStream = bundle.createBundleGraphStream(config);
		var recycleStream = recycle(config);

		depStream.pipe(recycleStream);

		// Wait for it to initially finish loading.
		recycleStream.once("data", function(data){
			var node = data.graph["something.txt!plug"];

			// Update the module so that it has a dynamic import. This should
			// be added to the loader's bundle and the graph reloaded.
			var mockOptions = {};
			Object.keys(data.graph).forEach(function(moduleName){
				var load = data.graph[moduleName].load;
				mockOptions[load.address.replace("file:", "")] = load.source;
			});
			mockOptions[node.load.address.replace("file:", "")] =
				'System.import("another");';
			mockOptions[path.resolve(__dirname + "/recycle_dynamic/another.js")]
				= 'var dep = require("./dep");';
			mockOptions[path.resolve(__dirname + "/recycle_dynamic/dep.js")]
				= 'module.exports = "dep";';
			mockFs(mockOptions);

			recycleStream.write(node.load.name);
			recycleStream.once("data", function(data){
				var graph = data.graph;
				assert(graph["another"], "this bundle was added to the graph");
				assert(graph["dep"], "the bundle's dependency was also added");
				done();
			});
		});
	});

	it("Detects dependencies in virtual modules created", function(done){
		var config = {
			config: path.join(__dirname, "virtual_recycle/config.js"),
			main: "main",
			logLevel: 3
		};
		var fileSystem = {};

		var depStream = bundle.createBundleGraphStream(config);
		var recycleStream = recycle(config);

		depStream.pipe(recycleStream);

		function updateFileSystem(graph) {
			Object.keys(graph).forEach(function(name) {
				var node = graph[name];
				if(node.load.address) {
					var pth = path.resolve(node.load.address.replace("file:", ""));
					if(!fileSystem[pth]) {
						fileSystem[pth] = fs.readFileSync(pth, "utf8");
					}
				}
			});
		}

		function updateDep(data) {
			updateFileSystem(data.graph);

			var node = data.graph["other.txt!comp"];
			// Fake string as the source.
			fileSystem[node.load.address.replace("file:", "")] = 
				"require('bit-tabs');\nmodule.exports='hello';";
			fileSystem[path.resolve(__dirname+"/virtual_recycle/tabs.js")] = 
				"exports.tabs = function(){};";
			mockFs(fileSystem);

			recycleStream.write(node.load.name);

			recycleStream.once("data", function(data){
				assert(data.graph["tabs"], "tabs is now in the graph");
				done();
			});

			recycleStream.once("error", function(err){
				done(err);
			});
		}

		function updateConfig(data){
			var node = data.graph["config.js"];
			fileSystem[node.load.address.replace("file:", "")] =
				"System.config({ map: { 'bit-tabs': 'tabs' } });";
			mockFs(fileSystem);

			recycleStream.once("data", updateDep);
			recycleStream.write(node.load.name);
		}

		// Wait for it to initially finish loading.
		recycleStream.once("data", updateConfig);
	});

});

