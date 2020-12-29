var chokidar = require("chokidar");
var ReadableStream = require("stream").Readable;
var isWindowsCI = require("is-appveyor");
var globby = require("globby");

var ignored = /node_modules/;

module.exports = function(graphStream){
	var watcher, addresses, allNodes;
	var stream = new ReadableStream({ objectMode: true });
	stream._read = function(){};

	function updateWatch(data){
		allNodes = collectGraphNodes(data.graph);
		addresses = Object.keys(allNodes);

		watcher.add(addresses);
	}

	function changed(event, address){
		if(isWindowsCI && address && ignored.test(address)) {
			return;
		}

		var nodes = allNodes ? allNodes[address] : [];

		var moduleNames = (nodes || []).map(function(node){
			return node.load.name;
		});

		stream.push(moduleNames);
	}

	var watchOptions = { ignoreInitial: true, usePolling: true };
	// Use this to prevent false positives on AppVeyor
	if(isWindowsCI) {
		watchOptions.awaitWriteFinish = true;
	}

	watcher = chokidar.watch(null, watchOptions);
	watcher.on("all", changed);

	graphStream.on("data", updateWatch);

	function onGraphStreamError() {
		globby(["**/*"], {gitignore: true})
		.then(function(paths){
			watcher.add(paths);
			graphStream.emit("watch-added");
		})
		.catch(() => {});
	}

	graphStream.once("error", onGraphStreamError);

	graphStream.once("data", function(){
		graphStream.removeListener("error", onGraphStreamError);
	});

	graphStream.on("end", function(){
		watcher.close();
	});

	return stream;
};

function collectGraphNodes(graph){
	var out = {};

	Object.keys(graph).forEach(function(moduleName){
		function addToLookup(address) {
			var addy = address.replace("file:", "");
			var nodes = out[addy];
			if(!nodes) {
				nodes = out[addy] = [];
			}

			nodes.push(node);
		}

		var node = graph[moduleName];
		if(node.load.address) {
			addToLookup(node.load.address, node);
		}
		if(Array.isArray(node.load.metadata.includedDeps)) {
			node.load.metadata.includedDeps.forEach(function(address){
				addToLookup(address, node);
			});
		}
	});

	return out;
}
