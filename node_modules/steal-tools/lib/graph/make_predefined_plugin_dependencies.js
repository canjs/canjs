var excludedModules = {
	"@loader": true,
	"@steal": true
};

/**
 * It's possible for a plugin dependency to be pre-loaded (typically by stealconfig).
 * This adds those to the graph.
 *
 * @param {Object} graph
 */
module.exports = function(graph){
	for(var name in graph){
		var node =  graph[name];
		if(node.isPlugin) {
			node.dependencies.forEach(function(name){
				if(!graph[name]) {
					if(excludedModules[name]) {
						return;
					}

					graph[name] = {
						load: {name: name, source: "", metadata: {buildType: "js"}, address: name},
						isPlugin: true,
						value: {},
						dependencies: [],
						deps: []
					};
				}
			});
		}
	}
};
