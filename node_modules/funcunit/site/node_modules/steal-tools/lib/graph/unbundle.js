var pluckOnlyDescendantOf = require("./pluck_only_descendant_of");

/*
 * Unbundle dependencies that are marked as bundle: false
 */
module.exports = function(dependencyGraph){
	var graphs = [];

	var node, unbundledGraph;
	for(var name in dependencyGraph){
		node = dependencyGraph[name];
		if(node && node.load.metadata && node.load.metadata.sideBundle) {
			unbundledGraph = pluckOnlyDescendantOf(dependencyGraph, name);
			markBundleOf(unbundledGraph, name);
			graphs.push(unbundledGraph);
		}
	}

	return graphs;
};

function markBundleOf(graph, bundleName){
	for(var name in graph) {
		graph[name].bundles = [bundleName];
	}
}
