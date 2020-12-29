var isString = require("lodash/isString");

/**
 * @method graph.eachDependants
 */
module.exports = function(graph, names, callback){
	var deps = {};
	var nodeNames = isString(names) ? [names] : names;

	function visit(name, node) {
		if(!deps[name]) {
			deps[name] = true;

			if(node && node.dependencies.length) {
				if(includes(node.dependencies, nodeNames)) {
					callback(name, node);
				}
			}
		}
	}

	for(var name in graph) {
		visit(name, graph[name]);
	}
};

function includes(arr1, arr2) {
	for(var i = 0; i < arr2.length; i++) {
		if(arr1.indexOf(arr2[i]) !== -1) {
			return true;
		}
	}
	return false;
}
