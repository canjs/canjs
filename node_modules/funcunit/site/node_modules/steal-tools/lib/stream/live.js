var watch = require("./watch");
var createBundleGraphStream = require("../graph/make_graph_with_bundles").createBundleGraphStream;
var recycle = require("../graph/recycle");
var createServer = require("../create_websocket_server");
var defaults = require("lodash").defaults;
var logging = require("../logger");
var toPromise = require("./to_promise");

module.exports = function(config, options){
	if(!options) options = {};
	defaults(options, { quiet: true });
	logging.setup(options, config);
	options.localStealConfig = {
		env: "build-development"
	};

	// Create an initial dependency graph for this config.
	var initialGraphStream = createBundleGraphStream(config, options);
	// Create a stream that is used to regenerate a new graph on file changes.
	var graphStream = recycle(config, options);
	var graphPromise = toPromise(graphStream);

	// Pipe the graph stream into the recycleStream so it can get the initial
	// graph.
	initialGraphStream.pipe(graphStream);

	// Setup the websocket connection.
	createServer(options).then(function(wss){
		var port = wss.options.server.address().port;

		wss.on("connection", function(ws){
			// Get the initial graph for this main,
			// if it's not already part of the graph.
			ws.once("message", function(moduleName){
				graphPromise.then(function(){
					graphStream.write(moduleName);
				});
			});
		});

		var watchStream = watch(graphStream);
		watchStream.on("data", onChange);

		function onChange(node) {
			var moduleName = node ? node.load.name : "";

			if(moduleName) {
				console.error("Reloading", moduleName.green);

				// Alert all clients of the change
				wss.clients.forEach(function(ws){
					ws.send(moduleName);
				});
			}

			// Update our dependency graph
			graphStream.write(moduleName);
		}

		graphStream.once("data", function(){
			console.error("Live-reload server listening on port", port);
		});

		graphStream.on("error", function(err){
			if(err.moduleName) {
				console.error("Oops! Error reloading", err.moduleName.red);
			} else {
				console.error(err);
			}
		});

		initialGraphStream.write(config.main);
	}, function(){
		process.exit(1);
	});

	return graphStream;
};
