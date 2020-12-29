var includes = require("lodash/includes");

// removes a module and all of its dependencies from the graph.
module.exports = function(graph, name, _except) {
	var modules = [];
	var visited = {};
	var except = _except == null ? [] : _except;

	function visit(name) {
		if (!visited[name] && !includes(except, name)) {
			visited[name] = true;
			var node = graph[name];

			delete graph[name];

			if (node) {
				node.dependencies.forEach(visit);
				modules.push(node);
			}
		}
	}

	visit(name);
	return modules;
};

