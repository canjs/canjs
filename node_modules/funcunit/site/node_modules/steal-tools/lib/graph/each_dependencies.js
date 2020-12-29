
/**
 * @method graph.each
 */
module.exports = function(graph, names, callback){
	var deps = {};
	if(typeof names === "string") {
		names = [names];
	}
	function visit(name, node) {
		if(!deps[name]) {
			deps[name] = true;

			// Call the callback
			callback(name, node);
		}

		if(node && node.dependencies.length) {
			node.dependencies.forEach(function(name){
				visit(name, graph[name]);
			});
		}
	}

	// It's possible weren't try to map a node that doesn't exist.
	names.forEach(function(name){
		if(graph[name]) {
			visit(name, graph[name]);
		}
	});


};
