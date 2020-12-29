"use strict";

var findBundles = require("../loader/find_bundle");

var whitelist = new Set(["@dev"]);

module.exports = function(data) {
	var used = new Set();

	var configMain = data.loader.configMain;
	visitUsed(data.graph, configMain, used);

	data.mains.forEach(function(mainName){
		visitUsed(data.graph, mainName, used);
	});

	findBundles(data.loader).forEach(function(bundleName) {
		visitUsed(data.graph, bundleName, used);
	});

	var unused = new Set();
	for(var name in data.graph) {
		if(!used.has(name)) {
			let node = data.graph[name];
			if(node && node.load.metadata.bundle !== false &&
				node.load.metadata.includeInBuild !== true) {
				unused.add(name);
			}
		}
	}

	unused.forEach(function(moduleName){
		if(!whitelist.has(moduleName)) {
			delete data.graph[moduleName];
		}
	});
};

function visitUsed(graph, name, used) {
	var deps = new Set();

	function visit(name, node) {
		if(!deps.has(name)) {
			deps.add(name);

			// Add this to the used set
			used.add(name);

			if (node && node.dependencies.length) {
				node.dependencies.forEach(function(name){
					visit(name, graph[name]);
				});
			}
		}
	}

	visit(name, graph[name]);
}
