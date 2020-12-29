var clean = function(node, options){
	delete node.activeSourceKeys;
	node.activeSource = {
		code: node.load.source
	};
	if(options.removeSourceNodes) {
		delete node.sourceNode;
	}
};

module.exports = function(graph, options) {
	options = options || {};
	if(Array.isArray(graph)) {
		graph.forEach(function(node){
			clean(node, options);
		});
	} else {
		for(var name in graph) {
			var node = graph[name];
			// If JavaScript
			clean(node, options);
		}
	}
};

