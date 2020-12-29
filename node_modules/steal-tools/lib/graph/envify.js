var envify = require("loose-envify/replace");
var transformActiveSource = require("../node/transform_active_source");

module.exports = function(graph, options) {
	options = options || {};
	var env = Object.assign({
		NODE_ENV: "production"
	}, process.env);

	if (Array.isArray(graph)) {
		graph.forEach(envifyNode);
	} else {
		Object.keys(graph).forEach(function eachKey(name) {
			envifyNode(graph[name], env);
		});
	}
	return graph;
};

function envifyNode(node, env) {
	transformActiveSource(node, "envify-true", function transformNode(
		node,
		source
	) {
		var isJsNode = (node.load.metadata.buildType || "js") === "js";

		// only replace Node-style environment variables from JS code
		if (isJsNode) {
			source.code = envify(source.code, [env]);
		}

		return source;
	});
}
