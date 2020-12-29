var colors = require("colors");
var through = require("through2");
var keys = require("lodash/keys");
var omit = require("lodash/omit");
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
 * Adds a node to the graph with an "@steal" shim
 * @param {Object} data - The slim stream data object
 * @return {Object} The mutated stream object
 */
function addAtLoaderShim(data) {
	var graph = omit(data.graph, data.loader.configMain);

	if (includesAtSteal(graph)) {
		winston.warn(
			colors.yellow(
				`the @steal module is not fully supported in optimized builds`
			)
		);
		data.graph["@steal"] = makeShimNode(data.loader.main);
	}

	return data;
}

/**
 * Looks for "@steal" in the dependency graph
 * @param {Object} graph - The dependency graph
 * @return {boolean} true if found, false otherwise
 */
function includesAtSteal(graph) {
	var found = false;

	var isAtSteal = function(name) {
		return name === "@steal";
	};

	keys(graph).forEach(function(name) {
		var node = graph[name];

		if (isPluginExcludedFromBuild(node)) {
			return;
		}

		if (isAtSteal(name)) {
			return (found = true);
		}

		defaultTo(node.dependencies, []).forEach(function(depName) {
			if (isAtSteal(depName)) {
				return (found = true);
			}
		});
	});

	return found;
}

/**
 * Returns an @steal shim graph node
 * @param {string} main - The main module name
 * @return {Object} The faux "@steal" graph node
 */
function makeShimNode(main) {
	return {
		bundles: [main],
		dependencies: ["@loader"],
		deps: ["@loader"],
		load: {
			address: "",
			metadata: {
				format: "amd",
				deps: ["@loader"],
				dependencies: ["@loader"]
			},
			name: "@steal",
			source: `
				define("@steal", ["@loader"], function(atLoader) {
					var steal = {};

					steal.loader = atLoader;
					steal.done = function() {
						return Promise.resolve();
					};

					return steal;
				});
			`
		}
	};
}
