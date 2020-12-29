var path = require("path");
var find = require("lodash/find");
var prettier = require("prettier");
var first = require("lodash/first");
var assign = require("lodash/assign");
var isJsBundle = require("../bundle/is_js_bundle");
var getBundleFileName = require("../bundle/filename");

/**
 * Returns the name of the global based on the build target
 * @param {string} target - The target build name
 * @return {string} defaults to "window" if target is falsy.
 */
function getGlobal(target) {
	return { web: "window", node: "global", worker: "self" }[target];
}

module.exports = function makeSlimConfigNode(options) {
	var bundles = options.bundles;

	// maps slim module ids (numbers) to slim bundle ids
	var slimBundlesConfig = {};

	// maps raw module ids to slim module ids
	var slimMapConfig = assign({}, options.slimConfig.map);

	// maps slim bundle ids to the bundle file address
	var slimPathsConfig = {};

	// maps bundles ids (build type other than js) to the module id of
	// the plugin needed to load the bundle correctly.
	var slimPluginsConfig = {};

	// maps bundle ids to a list of shared bundles that need to be loaded
	// before. E.g: bundle-a might need to loaded bundle-a-b and bundle-a-c
	// before it can be executed. This object will map the numeric id of
	// bundle-a to an array containing the numeric ids of bundle-a-b and
	// bundle-a-c.
	var slimSharedBundlesConfig = {};

	// Returns the bundle's path
	//
	// For nodejs, the name of the bundle is returned since `require` will
	// locate the bundle relative to the main module folder.
	//
	// For the web, a relative path to the loader baseUrl is returned, so the
	// loader can use script tags to load the bundles during runtime.
	//
	// @param {string} target - The name of the build target (node, web)
	// @param {Object} bundle - The bundle object
	// @return {string} the relative path
	function getRelativeBundlePath(target, bundle) {
		var baseUrl = options.baseUrl.replace("file:", "");

		return target !== "web" ?
			getBundleFileName(bundle) :
			path.join(
				path.relative(baseUrl, options.bundlesPath),
				getBundleFileName(bundle)
			);
	}

	// Given a fully normalized bundle name (like those in bundle.bundles)
	// it finds the single bundle (non-shared bundles) that contains it
	var findBundleByName = (function() {
		var singleBundles = bundles.filter(function(b) {
			return b.bundles.length === 1 && isJsBundle(b);
		});

		return function findBundle(name) {
			return find(singleBundles, function (b) {
				return first(b.bundles) === name;
			});
		};
	})();

	bundles.forEach(function(bundle) {
		var isSharedBundle = bundle.bundles.length > 1;

		if (isSharedBundle) {
			// steal-tools generates bundles of "most shared" modules, like:
			// bundle :: { name: "bundle-a-b", bundles: ["bundle-a", "bundle-b"] ... }
			// That means "bundle-a-b" includes modules that are required by
			// bundle-a or bundle-b. Hence, bundle-a-b has to be loaded before
			// any of its "master" bundles.

			// This loop mutates `slimSharedBundlesConfig` to create a map of
			// "master" bundle ids (like bundle-a or bundle-b) to the shared
			// bundle id (bundle-a-b), this way the slim loader can load them
			// in the right order.
			bundle.bundles.forEach(function(masterName) {
				var masterBundle = findBundleByName(masterName);
				var entry = slimSharedBundlesConfig[masterBundle.uniqueId];

				if (typeof entry === "undefined") {
					entry = [];
					slimSharedBundlesConfig[masterBundle.uniqueId] = entry;
				}

				if (bundle.name !== masterName) {
					entry.push(bundle.uniqueId);
				}
			});
		}

		slimPathsConfig[bundle.uniqueId] = getRelativeBundlePath(
			options.target,
			bundle
		);

		if (bundle.pluginName) {
			var pluginNode = options.graph[bundle.pluginName];

			if (pluginNode && pluginNode.load.uniqueId) {
				slimPluginsConfig[bundle.uniqueId] = pluginNode.load.uniqueId;
			}
		}

		bundle.nodes.forEach(function(node) {
			if (node.load.uniqueId) {
				slimBundlesConfig[node.load.uniqueId] = bundle.uniqueId;
			}
		});
	});

	// [{ id : number, name : string }]
	options.progressiveBundles.forEach(function(bundle) {
		slimMapConfig[bundle.name] = bundle.id;
	});

	var extensions = options.slimConfig.extensions;
	var idsToResolve = options.slimConfig.identifiersToResolve;

	var configSource = `
		(function(global) {
			global.steal = global.steal || {};

			global.steal.map = ${JSON.stringify(slimMapConfig)};
			global.steal.paths = ${JSON.stringify(slimPathsConfig)};
			global.steal.bundles = ${JSON.stringify(slimBundlesConfig)};
			global.steal.plugins = ${JSON.stringify(slimPluginsConfig)};
			global.steal.sharedBundles = ${JSON.stringify(slimSharedBundlesConfig)};
			${extensions.length ?
				`global.steal.extensions = ${JSON.stringify(extensions)};` : ""};
			${idsToResolve.length ?
				`global.steal.identifiersToResolve = ${JSON.stringify(idsToResolve)};` : ""}

		}(${getGlobal(options.target)}));
	`;

	return {
		load: {
			name: "[slim-loader-config]",
			metadata: { format: "global" },
			source: prettier.format(configSource, { useTabs: true })
		},
		dependencies: [],
		deps: []
	};
};
