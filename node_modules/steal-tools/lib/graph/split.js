var _ = require("lodash");


var splitIntoWithOrWithout = function(node, moduleNames, withModuleNames, withoutModuleNames){
	// TODO: this can be done faster probably.
	var bundledModuleNames = _.intersection(node.bundles, moduleNames);
	
	if( bundledModuleNames.length ){
		node.bundles = bundledModuleNames;
		withModuleNames[node.load.name] = node;
	} else {
		node.bundles = _.difference(node.bundles, moduleNames);
		withoutModuleNames[node.load.name] = node;
	}
};


module.exports = function(graph, moduleNames){
	
	var graphWithModuleNames = {},
		graphWithoutModuleNames = {};
	
	for(var moduleName in graph){
		splitIntoWithOrWithout(graph[moduleName], moduleNames, graphWithModuleNames, graphWithoutModuleNames);
	}
	return {
		"with": graphWithModuleNames,
		"without": graphWithoutModuleNames
	};
};
