var eachGraph = require("./each_dependencies");

/**
 * Pluck out descendants, who are only descendants, of a specific root node.
 */
module.exports = function(dependencyGraph, name){
	var ancestorName = name;

	// First collect a list of descendants
	var descendants = {};
	eachGraph(dependencyGraph, name, function(name){
		descendants[name] = true;
	});

	// For each node in the graph, make sure the non-descendants
	// don't have dependencies of any descendants.
	var node;
	for(name in dependencyGraph) {
		if(!descendants[name]) {
			node = dependencyGraph[name];
			node.dependencies.forEach(function(depName){
				if(depName !== ancestorName && (depName in descendants)) {
					removeDescendants(depName);
				}
			});
		}
	}

	function removeDescendants(name){
		delete descendants[name];
		eachGraph(dependencyGraph, name, function(depName){
			delete descendants[depName];
		});
	}

	var newGraph = {};
	for(name in descendants) {
		newGraph[name] = dependencyGraph[name];
		delete dependencyGraph[name];
	}
	return newGraph;
};
