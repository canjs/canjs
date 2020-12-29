var through = require("through2");
var keys = require("lodash/keys");
var isArray = require("lodash/isArray");

module.exports = function() {
	return through.obj(function(data, enc, next) {
		try {
			next(null, addModuleIds(data));
		} catch (err) {
			next(err);
		}
	});
};

function addModuleIds(data) {
	var graph = data.graph;
	var options = data.options;

	// extend each node's load object with an `uniqueId` property
	// transpile will look for this property to generate the slim module format
	if (isArray(graph)) {
		data.graph.forEach(function(node, index) {
			node.load.uniqueId = index;
		});
	} else {
		keys(graph).forEach(function(name, index) {
			graph[name].load.uniqueId = index;
		});
	}

	// set a normalize hook for transpile so the regular module identifiers are
	// replaced with the short ids set in `node.load.uniqueId`
	options.normalize = function(name, load) {
		var node = load ? graph[load.name] : null;
		return node ? node.load.uniqueId : name;
	};

	return data;
}
