var colors = require("colors");
var through = require("through2");
var keys = require("lodash/keys");
var omit = require("lodash/omit");
var assign = require("lodash/assign");
var clone = require("lodash/cloneDeep");
var defaultTo = require("lodash/defaultTo");
var isPluginExcludedFromBuild = require("../node/is_plugin_excluded");
var winston = require("winston");

module.exports = function() {
	return through.obj(function(data, enc, next) {
		try {
			next(null, addAtLoaderShim(data));
		} catch (err) {
			next(err);
		}
	});
};

/**
 * Adds a node to the graph with an "@loader" shim
 * The "@loader" shim contains the loader configuration properties
 * @param {Object} data - The slim stream data object
 * @return {Object} The mutated stream object
 */
function addAtLoaderShim(data) {
	if (includesAtLoader(omit(data.graph, data.loader.configMain))) {
		winston.warn(
			colors.yellow(
				`the @loader module is not fully supported in optimized builds`
			)
		);

		var config = clone(
			omit(data.loader.__loaderConfig, ["paths", "stealPath"])
		);

		// make sure the "window-production" config overrides previous values
		assign(config, defaultTo(config.envs, {})["window-production"]);

		data.graph["@loader"] = makeShimNode(data.loader.main, config);
	}

	return data;
}

/**
 * Looks for "@loader" in the dependency graph
 * @param {Object} graph - The dependency graph
 * @return {boolean} true if found, false otherwise
 */
function includesAtLoader(graph) {
	var found = false;

	var isAtLoader = function(name) {
		return name === "@loader";
	};

	keys(graph).forEach(function(name) {
		var node = graph[name];

		if (isPluginExcludedFromBuild(node)) {
			return;
		}

		if (isAtLoader(name)) {
			return (found = true);
		}

		defaultTo(node.dependencies, []).forEach(function(depName) {
			if (isAtLoader(depName)) {
				return (found = true);
			}
		});
	});

	return found;
}

/**
 * Returns an @loader node with the source code returning the config object
 * @param {string} main - The main module name
 * @param {Object} config - The config object exposed by "@loader"
 * @return {Object} The faux "@loader" graph node
 */
function makeShimNode(main, config) {
	return {
		bundles: [main],
		dependencies: [],
		deps: [],
		load: {
			address: "",
			metadata: {
				deps: [],
				format: "amd",
				dependencies: []
			},
			name: "@loader",
			source: `
				define("@loader", function() {
					return ${JSON.stringify(config)};
				});
			`
		}
	};
}
