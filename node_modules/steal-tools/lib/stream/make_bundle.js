var path = require("path");
var through = require("through2");
var keys = require("lodash/keys");
var assign = require("lodash/assign");
var isArray = require("lodash/isArray");
var includes = require("lodash/includes");
var hasES6 = require("../graph/has_es6");
var unbundle = require("../graph/unbundle");
var flattenBundle = require("../bundle/flatten");
var makeBundle = require("../bundle/make_bundle");
var isJavaScriptBundle = require("../bundle/is_js_bundle");
var splitByBuildType = require("../bundle/split_by_build_type");
var addTraceurRuntime = require("../bundle/add_traceur_runtime");
var makeBundlesConfig = require("../bundle/make_bundles_config");
var addPrelodedNpmPackagesToBundle = require("../bundle/add_npm_packages_node");

var BUNDLE_DEPTH = 1;

module.exports = function() {
	return through.obj(function(data, enc, done) {
		try {
			var result = bundle(data);
			done(null, result);
		} catch (err) {
			done(err);
		}
	});
};

function bundle(data) {
	var options = data.options;
	var configuration = data.configuration;
	var npmContext = data.loader.npmContext;
	var graph = includePluginsInBuild(data.graph);
	var configGraph = includePluginsInBuild(data.configGraph);

	unbundle(graph);

	var mainBundle = makeBundle(graph);
	flattenBundle(mainBundle, BUNDLE_DEPTH);
	var splitMainBundles = nameBundles(splitByBuildType(mainBundle));

	splitMainBundles.filter(isJavaScriptBundle).forEach(function(bundle) {
		var unshift = [].unshift;

		unshift.apply(bundle.nodes, configGraph);

		// adds node that calls `steal.addNpmPackages` when bundle is loaded;
		// this prevents the requests to fetch each npm dependency `package.json`
		if (npmContext && needsNpmPackagesNode(options.filter)) {
			addPrelodedNpmPackagesToBundle(bundle, npmContext, data.options);
		}

		// Make config JS code so System knows where to look for bundles.
		bundle.nodes.unshift(
			makeBundlesConfig(splitMainBundles, configuration, bundle, {
				getBundleName(bundle) {
					return path.join(options.dest || "", bundle.name);
				}
			})
		);

		// Traceur code requires a runtime.
		if (hasES6(graph)) {
			addTraceurRuntime(bundle);
		}
	});

	return assign({}, data, {
		bundles: splitMainBundles
	});
}

function needsNpmPackagesNode(filter) {
	filter = filter || [];

	// not needed when @config is part of the bundle
	return (
		includes(filter, "node_modules/**/*") &&
		!includes(filter, "package.json")
	);
}

function nameBundles(bundles) {
	return bundles.map(function(bundle) {
		var type = bundle.buildType;

		// this is needed so css bundles are written out with the
		// right file extension
		var suffix = type === "js" ? "" : "." + type + "!";

		return assign({}, bundle, {
			name: "dev-bundle" + suffix
		});
	});
}

function includePluginsInBuild(graph) {
	return isArray(graph) ? handleArrayGraph(graph) : handleObjectGraph(graph);

	function handleArrayGraph(graph) {
		var cloned = graph.slice(0);

		cloned
			.filter(function(node) {
				return node.isPlugin;
			})
			.forEach(function(node) {
				var metadata = node.load.metadata;

				if (metadata) metadata.includeInBuild = true;
			});

		return cloned;
	}

	function handleObjectGraph(graph) {
		var cloned = assign({}, graph);

		function isPlugin(name) {
			return cloned[name].isPlugin;
		}

		function includeInBuild(name) {
			var node = cloned[name];
			var metadata = node.load.metadata;

			if (metadata) metadata.includeInBuild = true;
		}

		keys(cloned).filter(isPlugin).forEach(includeInBuild);
		return cloned;
	}
}
