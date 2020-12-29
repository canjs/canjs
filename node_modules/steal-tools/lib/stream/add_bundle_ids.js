var max = require("lodash/max");
var through = require("through2");
var isArray = require("lodash/isArray");

module.exports = function() {
	return through.obj(function(data, enc, next) {
		try {
			next(null, addBundleIds(data));
		} catch (err) {
			next(err);
		}
	});
};

function getModuleIds(graph) {
	if (isArray(graph)) {
		return graph.forEach(function(node) {
			return node.load.uniqueId;
		});
	} else {
		return Object.keys(graph).map(function(name) {
			return graph[name].load.uniqueId;
		});
	}
}

function addBundleIds(data) {
	var graph = data.graph;

	var maxModuleId = max(getModuleIds(graph));

	data.bundles.forEach(function(bundle, index) {
		bundle.uniqueId = maxModuleId + index + 1;
	});

	return data;
}
