var winston = require('winston'),
	order = require("../graph/order"),
	transpile = require("../graph/transpile"),
	minifyGraph = require("../graph/minify"),
	pluck = require("../graph/pluck"),
	makeBundle = require("../bundle/make_bundle"),
	nameBundle = require("../bundle/name"),
	flattenBundle = require("../bundle/flatten"),
	makeBundlesConfig = require("../bundle/make_bundles_config"),
	splitByBuildType = require("../bundle/split_by_build_type"),
	addStealToBundle = require("../bundle/add_steal"),
	_ = require("lodash"),
	hasES6 = require("../graph/has_es6"),
	clean = require("../graph/clean"),
	addTraceurRuntime = require("../bundle/add_traceur_runtime"),
	makeConfiguration = require("../configuration/make"),
	splitGraphByModuleNames = require("../graph/split"),
	getBundleForOnly = require("../bundle/get_for_only"),
	findBundles = require("../loader/find_bundle"),
	through = require("through2"),
	bundleDepth = require("../bundle/depth"),
	markBundlesDirty = require("../bundle/mark_as_dirty"),
	unbundle = require("../graph/unbundle");


module.exports = function(){

	return through.obj(function(data, enc, done){
		try {
			var buildResult = multiBuild(data);
			done(null, buildResult);
		} catch(err) {
			done(err);
		}
	});

	function multiBuild(data){
		var dependencyGraph = data.graph,
			options = data.options,
			config = data.config,
			// the apps we are building
			mains = Array.isArray(config.main) ? config.main.slice(0) : [data.loader.main],
			configuration = makeConfiguration(data.loader, data.buildLoader, options);

		// Remove @config so it is not transpiled.  It is a global,
		// but we will want it to run ASAP.
		var stealconfig = pluck(dependencyGraph,data.loader.configMain ||"@config");

		// Transpile the source to AMD
		options.sourceMapPath = configuration.bundlesPath;
		transpile(stealconfig, "amd", options, data);

		// Remove steal dev from production builds.
		pluck(dependencyGraph,"@dev");

		// Adds an `order` property to each `Node` so we know which modules.
		// The lower the number the lower on the dependency tree it is.
		// For example, jQuery might have `order: 0`.
		mains.forEach(function(moduleName){
			order(dependencyGraph, moduleName);
		});

		findBundles(data.loader).forEach(function(moduleName){
			order(dependencyGraph, moduleName);
		});

		// Clean development code if the option was passed
		if(options.removeDevelopmentCode) {
			clean(dependencyGraph, options);
		}

		// Transpile each module to amd. Eventually, production builds
		// should be able to work without steal.js.
		winston.info('Transpiling...');
		transpile(dependencyGraph, "amd", options, data);

		// Minify every file in the graph
		if(options.minify) {
			winston.info('Minifying...');
			minifyGraph(dependencyGraph, options);
			minifyGraph(stealconfig, options);
		}

		// Get unbundled graphs, these are graphs of modules that are marked
		// to not be bundled, they will be put into their own bundles later.
		var unbundledGraphs = unbundle(dependencyGraph);

		// Split the graph into two smaller graphs. One will contain the
		// "mains" and their dependencies that need to be loaded right away.
		// The other will will be the bundles that are progressively loaded.
		var splitGraphs = splitGraphByModuleNames(dependencyGraph, mains),
			mainsGraph = splitGraphs["with"],
			bundledGraph = splitGraphs.without;

		winston.info('Calculating main bundle(s)...');
		// Put everything into unique bundle graphs that have no waste.
		var mainBundles = makeBundle(mainsGraph);
		// Combine bundles to reduce the number of total bundles that will need to be loaded
		winston.info('Flattening main bundle(s)...');
		flattenBundle(mainBundles, bundleDepth(config, options, true));
		// Break up bundles by buildType
		var splitMainBundles = splitByBuildType(mainBundles);

		var splitBundles = [];
		if(!_.isEmpty(bundledGraph)) {
			winston.info('Calculating progressively loaded bundle(s)...');
			// Put everything into unique bundle graphs that have no waste.
			var bundles = makeBundle(bundledGraph);
			// Combine bundles to reduce the number of total bundles that will need to be loaded
			winston.info('Flattening progressively loaded bundle(s)...');
			flattenBundle(bundles, bundleDepth(config, options));
			// Break up bundles by buildType
			splitBundles = splitByBuildType(bundles);
		}

		// Every mainBundle needs to have @config and bundle configuration to know
		// where everything is. Lets get those main bundles here while there is less to go through.

		var mainJSBundles = mains.map(function(main){
			return getBundleForOnly(splitMainBundles,main,"js");
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
		var mainJSBundleNames = {};
		mainJSBundles.forEach(function(mainJSBundle){
			mainJSBundleNames[mainJSBundle.name] = true;
		});

		// Add @config and the bundleConfigNode to each main
		mainJSBundles.forEach(function(mainJSBundle){
			[].unshift.apply(mainJSBundle.nodes, stealconfig );
			// Make config JS code so System knows where to look for bundles.
			var configNode = makeBundlesConfig(allBundles, configuration, mainJSBundle, {
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
			var hasES6modules = hasES6(dependencyGraph);
			if( hasES6modules ) {
				addTraceurRuntime(mainJSBundle);
			}
		});

		// Mark bundles that are dirty so that they will be written to the file
		// system.
		markBundlesDirty(allBundles, data);

		return _.extend({}, data, {
			bundles: allBundles,
			configuration: configuration
		});
	}
};
