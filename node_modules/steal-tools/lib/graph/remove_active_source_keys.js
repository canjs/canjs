var clean = require("../node/remove_active_source_keys");

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
