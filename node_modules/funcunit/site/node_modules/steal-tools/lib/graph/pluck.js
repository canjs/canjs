var winston = require('winston');

// removes a module and all of its dependencies from the graph.
module.exports = function(graph, name){
	var modules = [];
	var visited = {};

	function visit( name ) {
		if(!visited[name]) {

			visited[name] = true;
			var node = graph[name];

			delete graph[name];
			if(!node) {
				if(name && name[0] !== "@") {
					winston.warn("Can't find dependency",name,"in graph.");
				}
				return;
			}
			node.dependencies.forEach(function( moduleName ) {
				visit(moduleName);
			});
			modules.push(node);
		}
	}
	visit(name);
	return modules;
};
