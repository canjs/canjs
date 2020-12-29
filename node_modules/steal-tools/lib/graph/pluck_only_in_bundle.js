

module.exports = function(graph, moduleName){
	var nodes = [];
	for(var name in graph){
		var node = graph[name];
		if(node.bundles.length === 1 && node.bundles[0] === moduleName) {
			nodes.push(node);
			delete graph[name];
		}
	}
	return nodes;
};
