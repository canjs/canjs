var addStealToBundle = require("../bundle/add_steal");
var addTraceurRuntime = require("../bundle/add_traceur_runtime");
var assign = require("lodash").assign;
var bundleDepth = require("../bundle/depth");
var findBundles = require("../loader/find_bundle");
var flattenBundle = require("../bundle/flatten");
var getBundleForOnly = require("../bundle/get_for_only");
var hasES6 = require("../graph/has_es6");
var isEmpty = require("lodash").isEmpty;
var makeBundle = require("../bundle/make_bundle");
var makeBundlesConfig = require("../bundle/make_bundles_config");
var makeBundleNameMap = require("../bundle/make_bundle_name_map");
var markBundlesDirty = require("../bundle/mark_as_dirty");
var nameBundle = require("../bundle/name");
var order = require("../graph/order");
var splitByBuildType = require("../bundle/split_by_build_type");
var splitGraphByModuleNames = require("../graph/split");
var through = require("through2");
var unbundle = require("../graph/unbundle");
var winston = require("winston");

module.exports = function(){
	return through.obj(function(data, enc, done){
		try {
			var result = bundle(data);
			done(null, result);
		} catch(err) {
			done(err);
		}
	});
};

function bundle(data){
	var dependencyGraph = data.graph,
		options = data.options,
		config = data.config,
		// the apps we are building
		mains = data.mains,
		configuration = data.configuration,
		configGraph = data.configGraph;

	// Adds an `order` property to each `Node` so we know which modules.
	// The lower the number the lower on the dependency tree it is.
	// For example, jQuery might have `order: 0`.
	mains.forEach(function(moduleName){
		order(dependencyGraph, moduleName);
	});

	findBundles(data.loader).forEach(function(moduleName){
		order(dependencyGraph, moduleName);
	});

	// Get unbundled graphs, these are graphs of modules that are marked
	// to not be bundled, they will be put into their own bundles later.
	var unbundledGraphs = unbundle(dependencyGraph);

	// Split the graph into two smaller graphs. One will contain the
	// "mains" and their dependencies that need to be loaded right away.
	// The other will will be the bundles that are progressively loaded.
	var splitGraphs = splitGraphByModuleNames(dependencyGraph, mains),
		mainsGraph = splitGraphs["with"],
		bundledGraph = splitGraphs.without;

	winston.info("Calculating main bundle(s)...");
	// Put everything into unique bundle graphs that have no waste.
	var mainBundles = makeBundle(mainsGraph);
	// Combine bundles to reduce the number of total bundles that will need to be loaded
	winston.info("Flattening main bundle(s)...");
	flattenBundle(mainBundles, bundleDepth(config, options, true));
	// Break up bundles by buildType
	var splitMainBundles = splitByBuildType(mainBundles);

	var splitBundles = [];
	if(!isEmpty(bundledGraph)) {
		winston.info("Calculating progressively loaded bundle(s)...");
		// Put everything into unique bundle graphs that have no waste.
		var bundles = makeBundle(bundledGraph);
		// Combine bundles to reduce the number of total bundles that will need to be loaded
		winston.info("Flattening progressively loaded bundle(s)...");
		flattenBundle(bundles, bundleDepth(config, options));
		// Break up bundles by buildType
		splitBundles = splitByBuildType(bundles);
	}

	// Every mainBundle needs to have @config and bundle configuration to know
	// where everything is. Lets get those main bundles here while there is less to go through.

	var mainJSBundles = mains.map(function(main){
		return getBundleForOnly(splitMainBundles, main, "js");
	});

	// Create unbundled bundles, for modules marked as sideBundle: true
	var unbundledBundles = unbundledGraphs.reduce(function(bundles, graph){
		bundles.push.apply(bundles, makeBundle(graph));
		return bundles;
	}, []);
	unbundledBundles = splitByBuildType(unbundledBundles);

	// Combine all bundles
	var allBundles = splitMainBundles.concat(splitBundles);
	allBundles = allBundles.concat.apply(allBundles, unbundledBundles);

	// Name each bundle so we know what to call the bundle.
	nameBundle(allBundles);

	// Create a lookup object of the main bundle names so that they are
	// excluded from the Bundles config
	var mainJSBundleNames = makeBundleNameMap(mainJSBundles);

	// Add @config and the bundleConfigNode to each main
	mainJSBundles.forEach(function(mainJSBundle){
		[].unshift.apply(mainJSBundle.nodes, configGraph);
		// Make config JS code so System knows where to look for bundles.
		var configNode = makeBundlesConfig(allBundles, configuration,
										   mainJSBundle, {
			excludedBundles: mainJSBundleNames
		});
		mainJSBundle.nodes.unshift(configNode);

		if(options.bundleSteal) {
			addStealToBundle({
				bundle: mainJSBundle,
				main: mainJSBundle.bundles[0],
				configuration: configuration,
				bundlePromisePolyfill: options.bundlePromisePolyfill
			});
		}
		// Traceur code requires a runtime.
		if(hasES6(dependencyGraph)) {
			addTraceurRuntime(mainJSBundle);
		}
	});

	// Mark bundles that are dirty so that they will be written to the file
	// system.
	markBundlesDirty(allBundles, data);

	return assign({}, data, {
		bundles: allBundles
	});
}
