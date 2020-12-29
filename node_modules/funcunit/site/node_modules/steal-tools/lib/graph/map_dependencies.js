
/**
 * @method graph.map
 */
module.exports = function(graph, name, callback){
	var deps = {};
	var out = [];

	function visit(name, node) {
		if(!deps[name]) {
			deps[name] = true;

			var result = callback(name, node);
			out.push(result);
		}

		if(node.dependencies.length) {
			node.dependencies.forEach(function(name){
				visit(name, graph[name]);
			});
		}
	}

	// It's possible weren't try to map a node that doesn't exist.
	if(graph[name]) {
		visit(name, graph[name]);
	}

	return out;
};
