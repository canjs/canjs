var util = require("util");

/**
 *
 * @param {Object} bundles
 * @param {Object} configuration
 * @param {Object} targetBundle the bundle this config is being built for.
 * @param {Object} options Additional options to select what bundles to include.
 */
module.exports = function(bundles, configuration, targetBundle, options){
	var paths = getBundlesPaths(configuration);
	var excludedBundles = options.excludedBundles || {};

	var bundledBundles = bundles.slice(0);

	var bundlesConfig = {};
	bundledBundles.forEach(function(bundle){
		// Don't write a bundles config for your own bundle.  Otherwise,
		// inifinite recursion will happen.
		if(targetBundle.name !== bundle.name && !excludedBundles[bundle.name]) {
			bundlesConfig[bundle.name] = bundle.nodes.map(function(node){
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
	// TODO: we should probably give a warning to make sure you include this in your production html's configuration.
	return "if(!System.bundlesPath) {\n" + paths + "}\n";
}
