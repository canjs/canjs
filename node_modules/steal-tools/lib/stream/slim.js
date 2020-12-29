var omit = require("lodash/omit");
var through = require("through2");
var assign = require("lodash/assign");
var slimGraph = require("../graph/slim_graph");

/**
 * @param {Object} options - An options object
 */
module.exports = function(options) {
	var opts = options != null ? options : {};

	return through.obj(function(data, enc, next) {
		try {
			next(null, doSlimGrap(data, opts));
		} catch (err) {
			next(err);
		}
	});
};

/**
 * Turns the bundles into their slim version (mutates stream data)
 * @param {Object} data - The slim stream data object
 * @param {Object} options - An options object
 * @return {Object} The mutated data
 */
function doSlimGrap(data, options) {
	var bundles = data.bundles.slice(0);

	var slimmedBundles = slimGraph({
		graph: data.graph,
		mains: data.mains,
		bundles: bundles,
		target: options.target,
		baseUrl: data.loader.baseURL,
		slimConfig: data.loader.slimConfig,
		splitLoader: data.options.splitLoader,
		bundlesPath: data.configuration.bundlesPath,
		configMain: data.loader.configMain || "package.json!npm",
		progressiveBundles: getProgressiveBundles(data.loader, data.graph)
	});

	return assign(
		{},
		omit(data, ["bundles"]),
		{ bundles: slimmedBundles }
	);
}


/**
 * An array of module names/ids to be progressively loaded
 * @param {Object} loader - The loader instance
 * @param {Object} graph - The dependency graph
 * @return {Array.<number, string>} List of module names and ids
 */
function getProgressiveBundles(loader, graph) {
	var config = loader.__loaderConfig || {};
	var configBundle = config.bundle || [];

	return loader.bundle.map(function(name, index) {
		return {
			id: graph[name].load.uniqueId,

			// use the raw module identifiers so the user won't have to use
			// the full normalized names when importing a module dynamically
			name: configBundle[index] || name
		};
	});
}
