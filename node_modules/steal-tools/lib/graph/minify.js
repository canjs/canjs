var winston = require("winston");
var minifyJS = require("../build_types/minify_js").sync;
var transformActiveSource = require("../node/transform_active_source");

function minify(node, options) {
	transformActiveSource(node,"minify-true", function(node, source){
		var buildType = node.load.metadata.buildType || "js";

		if(buildType === "js") {
			var result = minifyJS(source, options);

			if (result.error) {
				winston.warn(
					`Error occured while minifying ${node.load.address}
					${result.error.message}
					Line:  ${result.error.line}
					Col: ${result.error.col}
					Pos:  ${result.error.pos}`
				);

				throw(result.error);
			}

			return result;
		}
		// skip css source files, css is minified after the bundle is concatenated
		else {
			return source;
		}
	});
}

module.exports = function(graph, options){
	options = options || {};

	if(Array.isArray(graph, options)) {
		graph.forEach(function(node){
			minify(node, options);
		});
	} else {
		for(var name in graph) {
			var node = graph[name];
			minify(node, options);
		}
	}
	return graph;
};
