var util = require("util");
var defaults = require("lodash/defaults");

/**
 * @param {Object} bundles
 * @param {Object} configuration
 * @param {Object} targetBundle the bundle this config is being built for.
 * @param {Object} options Additional options to select what bundles to include.
 */
module.exports = function(bundles, configuration, targetBundle, options) {
	var paths = getBundlesPaths(configuration);

	if (!options) options = {};
	defaults(options, {
		// return the bundle name to be used in the System.bundles object.
		// provide a custom function if you need to change the bundle name
		// used during runtime. E.g: development bundles need this when a
		// custom `dest` is provided; unlike production environments `bundlesPath`
		// does not work.
		getBundleName(bundle) {
			return bundle.name;
		}
	});

	var excludedBundles = options.excludedBundles || {};
	var bundledBundles = bundles.slice(0);

	// whether the bundle name matches the target bundle name
	function isTargetBundle(bundle) {
		return bundle.name === targetBundle.name;
	}

	var bundlesConfig = {};
	bundledBundles.forEach(function(bundle) {
		// do not add the target bundle as an entry to System.bundles, this
		// causes an infinite recursion when the bundle tries to load itself
		if(!isTargetBundle(bundle) && !excludedBundles[bundle.name]) {
			var name = options.getBundleName(bundle);
			bundlesConfig[name] = bundle.nodes.map(function(node){
				return node.load.name;
			});
		}
	});

	return {
		load: {
			name: "[system-bundles-config]",
			metadata: {
				bundlesConfig: bundlesConfig
			}
		},
		minifiedSource: paths + "System.bundles = "+JSON.stringify(bundlesConfig)+";"
	};
};

// Get the System.paths needed to map bundles, if a different bundlesPath is provided.
function getBundlesPaths(configuration){
	// If a bundlesPath is not provided, the paths are not needed because they are
	// already set up in steal.js
	if(!configuration.loader.bundlesPath) {
		return "";
	}
	var bundlesPath = configuration.bundlesPathURL;

	// Get the dist directory and set the paths output
	var paths = util.format('\tSystem.paths["bundles/*.css"] ="%s/*css";\n' +
													'\tSystem.paths["bundles/*"] = "%s/*.js";\n',
													bundlesPath, bundlesPath);
	return "if(!System.bundlesPath) {\n" + paths + "}\n";
}
