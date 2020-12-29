var path = require("path");
var concat = require("../source-map-concat");
var sourceNode = require("../node/source").node;
var removeSourceMapUrl = require("../remove_source_map_url");

module.exports = function(bundle, options){
	var sourceProp = options.sourceProp;
	var excludePlugins = options.excludePlugins;
	
	var output = fileName(bundle);

	var makeCode = function(name) {
		return "define('" + name + "', [], function(){ return {}; });";
	};

	var nodes = bundle.nodes.map(function(node){
		if (node.load.metadata &&
			node.load.metadata.hasOwnProperty('bundle') &&
			node.load.metadata.bundle === false) {

			return { node: node, code: "", map: "" };
		}

		// Allow some nodes to be completely excluded
		if(node.load.excludeFromBuild) {
			return undefined;
		}

		// for plugins, include them only if they define `includeInBuild`
		// or if the module's metadata has `includeInBuild` set to `true`
		if (node.isPlugin &&
			!node.value.includeInBuild &&
			!node.load.metadata.includeInBuild) {

			var code = excludePlugins ? "" : makeCode(node.load.name);
			return { node: node, code: code };
		}

		var source = sourceNode(node, sourceProp);

		return {
			node: node,
			code: removeSourceMapUrl((source.code || "") + ""),
			map: source.map
		};
	}).filter(truthy);

	var concatenated = concat(nodes, {
		mapPath: output + ".map",
		delimiter: "\n",
		process: prependName
	});

	var result = concatenated.toStringWithSourceMap({
		file: path.basename(output)
	});

	bundle.source = result;

	function prependName(node, file) {
		var load = file.node.load;
		var prepend = node.prependModuleName !== false && load.name &&
			load.metadata.prependModuleName !== false;

		if(prepend) {
			node.prepend("/*"+file.node.load.name+"*/\n");
		}
	}
};

function fileName(bundle) {
	var name = bundle.name || bundle.bundles[0] || bundle.nodes[0].load.name;
	return name .replace("bundles/", "").replace(/\..+!/, "") + "." + bundle.buildType;
}

function truthy(x) { return !!x; }
