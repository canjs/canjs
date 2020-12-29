var omit = require("lodash/omit");
var first = require("lodash/first");
var negate = require("lodash/negate");
var concat = require("lodash/concat");
var assign = require("lodash/assign");
var partial = require("lodash/partial");
var includes = require("lodash/includes");
var isJavaScriptBundle = require("../bundle/is_js_bundle");
var makeSlimLoaderNode = require("../node/make_slim_loader_node");
var makeSlimBundleNode = require("../node/make_slim_bundle_node");
var makeSlimConfigNode = require("../node/make_slim_config_node");

module.exports = function(options) {
	var slimmedBundles = [];

	if (isMultiMain(options.mains) && options.splitLoader) {
		throw new Error(
			[
				`Cannot create slim buid; "splitLoader" is not supported in multi main apps`,
				`Please, set "splitLoader" to false and try again`
			].join("\n")
		);
	}

	// filter out nodes flagged to be removed from the build and config nodes
	options.bundles.forEach(function(bundle) {
		bundle.nodes = bundle.nodes.filter(function(node) {
			return (
				!isConfigNode(options.configMain, node) &&
				!isExcludedFromBuild(node)
			);
		});
	});

	var jsBundles = options.bundles.filter(isJavaScriptBundle);
	var nonJsBundles = options.bundles.filter(negate(isJavaScriptBundle));

	var slimConfigNode = makeSlimConfigNode({
		target: options.target,
		graph: options.graph,
		baseUrl: options.baseUrl,
		bundles: options.bundles, // the config needs to receive all the bundles
		slimConfig: options.slimConfig,
		bundlesPath: options.bundlesPath,
		progressiveBundles: options.progressiveBundles
	});

	// if there are shared bundles, the progressive loader needs to
	// check the config in case the "master" bundle to be loaded requires
	// other bundles to be loaded first
	var sharedBundles = jsBundles.filter(function(bundle) {
		return bundle.bundles.length > 1;
	});

	if (options.splitLoader) {
		var loaderBundle = concat(
			makeLoaderBundle([
				slimConfigNode,
				makeSlimLoaderNode({
					nodes: [],
					splitLoader: true,
					progressive: true,
					target: options.target,
					entryPointSharedBundles: [],
					slimConfig: options.slimConfig,
					plugins: !!nonJsBundles.length,
					sharedBundles: !!sharedBundles.length,
					mainModuleId: getMainModuleId(
						options.graph,
						options.mains[0]
					)
				})
			])
		);

		slimmedBundles = concat(
			loaderBundle,
			jsBundles.map(partial(toSlimBundle, options.target)),
			nonJsBundles
		);
	} else {
		var getMainName = function(bundle) {
			return first(bundle.bundles);
		};

		var isEntryPointBundle = function(bundle) {
			return (
				bundle.bundles.length === 1 &&
				includes(options.mains, getMainName(bundle))
			);
		};

		var entryPointBundles = jsBundles.filter(isEntryPointBundle);
		var secondaryBundles = jsBundles.filter(negate(isEntryPointBundle));

		// each entry point bundle includes the loader code
		var slimmedEntryBundles = entryPointBundles.map(function(bundle) {
			var mainName = getMainName(bundle);

			// these need to be loaded before "main" loads
			var entryPointSharedBundles = getSharedBundlesOf(
				jsBundles.filter(function(b) {
					return b.name !== bundle.name;
				}),
				mainName
			);

			var nodes = [
				slimConfigNode,
				makeSlimLoaderNode({
					bundleId: bundle.uniqueId,
					nodes: bundle.nodes.slice(0),
					target: options.target,
					plugins: !!nonJsBundles.length,
					slimConfig: options.slimConfig,
					sharedBundles: !!sharedBundles.length,
					entryPointSharedBundles: entryPointSharedBundles,
					mainModuleId: getMainModuleId(options.graph, mainName),
					progressive:
						needsDynamicLoader(options.slimConfig) ||
						!!secondaryBundles.length
				})
			];

			return assign({}, omit(bundle, ["nodes"]), {
				nodes: nodes
			});
		});

		slimmedBundles = concat(
			slimmedEntryBundles,
			secondaryBundles.map(partial(toSlimBundle, options.target)),
			nonJsBundles
		);
	}

	return slimmedBundles;
};

/**
 * Whether the slim loader should support dynamic loading
 * @param {Object} config
 * @return {boolean}
 */
function needsDynamicLoader(config) {
	return config.needsDynamicLoader === true;
}

/**
 * Whether there are multiple mains to be built
 * @param {Array} mains
 * @return {boolean}
 */
function isMultiMain(mains) {
	return mains.length > 1;
}

/**
 * Return the main module slim id
 * @param {Object} graph
 * @param {string} mainName
 * @return {number} The slim id
 */
function getMainModuleId(graph, mainName) {
	return graph[mainName].load.uniqueId;
}

function getSharedBundlesOf(bundles, mainName) {
	return bundles.filter(function(b) {
		return includes(b.bundles, mainName);
	});
}

function toSlimBundle(target, bundle) {
	return assign({}, omit(bundle, ["nodes"]), {
		nodes: [makeSlimBundleNode(target, bundle)]
	});
}

function makeLoaderBundle(nodes) {
	var getBundleName = require("../bundle/name").getName;

	var bundle = {
		bundles: ["loader"],
		buildType: "js",
		nodes: nodes
	};

	bundle.name = getBundleName(bundle);
	return bundle;
}

/**
 * Whether the node is flagged to be removed from the build
 * @param {Object} node - A node from a bundle
 * @return {boolean} `true` if flagged, `false` otherwise
 */
function isExcludedFromBuild(node) {
	if (node.load.excludeFromBuild) {
		return true;
	}

	if (
		node.load.metadata &&
		node.load.metadata.hasOwnProperty("bundle") &&
		node.load.metadata.bundle === false
	) {
		return true;
	}

	if (
		node.isPlugin &&
		!node.value.includeInBuild &&
		!node.load.metadata.includeInBuild
	) {
		return true;
	}

	return false;
}

/**
 * Whether the node is a config module (like package.json)
 * @param {string} configMain - The configMain module identifier
 * @param {Object} node - A node from a bundle
 * @return {boolean} `true` if a config node, `false` otherwise
 */
function isConfigNode(configMain, node) {
	return includes([configMain, "[system-bundles-config]"], node.load.name);
}
