var omit = require("lodash/omit");
var through = require("through2");
var assign = require("lodash/assign");
var includes = require("lodash/includes");

module.exports = function() {
	return through.obj(function(data, enc, done) {
		try {
			done(null, filterGraph(data));
		} catch (err) {
			done(err);
		}
	});
};

function isStealConditional(name) {
	return includes(name, "steal-conditional/conditional");
}

function filterGraph(data) {
	var graph = data.graph;

	var configMain = data.loader.configMain;
	var configNode = graph[configMain];
	var blackList = [];

	configNode.dependencies.forEach(function visit(name) {
		if (!isStealConditional(name) && !includes(blackList, name)) {
			blackList.push(name);

			if (graph[name]) {
				(graph[name].dependencies || []).forEach(visit);
			}
		}
	});

	return assign({}, omit(data, "graph"), { graph: omit(graph, blackList) });
}
