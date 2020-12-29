var chokidar = require("chokidar");
var ReadableStream = require("stream").Readable;
var isWindowsCI = require("is-appveyor");

var ignored = /node_modules/;

module.exports = function(graphStream){
	var watcher, addresses, allNodes;
	var stream = new ReadableStream({ objectMode: true });
	stream._read = function(){};

	function updateWatch(data){
		allNodes = invert(data.graph);
		addresses = Object.keys(allNodes);

		watcher.add(addresses);
	}

	function changed(event, address){
		if(isWindowsCI && address && ignored.test(address)) {
			return;
		}

		var node = allNodes[address] || "";
		stream.push(node || "");
	}

	var watchOptions = { ignoreInitial: true, usePolling: true };
	// Use this to prevent false positives on AppVeyor
	if(isWindowsCI) {
		watchOptions.awaitWriteFinish = true;
	}

	watcher = chokidar.watch(null, watchOptions);
	watcher.on("all", changed);

	graphStream.on("data", updateWatch);

	return stream;
};

// Given an array of bundles, inverts them into a table of addresses to nodes
function invert(graph){
	var table = {};
	Object.keys(graph).forEach(function(moduleName){
		var node = graph[moduleName];
		if(node.load.address){
			table[node.load.address.replace("file:", "")] = node;
		}

	});
	return table;
}
