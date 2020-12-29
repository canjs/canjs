

module.exports = function(graph, names){
	if(typeof names === "string") {
		names = [names];
	}
	var modules = [];
	var visited = {};

	function visit( name ) {
		if(!visited[name]) {

			visited[name] = true;
			var node = graph[name];
			if(node) {
				node.dependencies.forEach(function( moduleName ) {
					visit(moduleName);
				});
			}
			modules.push(node);
		}
	}
	names.forEach(visit);
	return modules;
};
