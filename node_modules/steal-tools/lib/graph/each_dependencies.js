var isString = require("lodash/isString");

/**
 * @method graph.each
 */
module.exports = function(graph, names, callback){
	var deps = {};
	var nodeNames = isString(names) ? [names] : names;

	function visit(name, node) {
		if(!deps[name]) {
			deps[name] = true;

			// Call the callback
			callback(name, node);

			if (node && node.dependencies.length) {
				node.dependencies.forEach(function(name){
					visit(name, graph[name]);
				});
			}
		}
	}

	// It's possible weren't try to map a node that doesn't exist.
	nodeNames.forEach(function(name){
		if(graph[name]) {
			visit(name, graph[name]);
		}
	});
};
