var assign = require("lodash/assign"),
	forEach = require("lodash/forEach"),
	logging = require("./logger");

module.exports = function(config, options){
	if(options.__defaultsAssigned) {
		return options;
	}

	options = assign({ // Defaults
		envify: true,
		minify: false,
		bundleSteal: false,
		uglifyOptions: {},
		cleanCSSOptions: {
			rebase: false,
			inline: ["none"]
		},
		removeDevelopmentCode: true,
		namedDefines: true,
		bundlePromisePolyfill: false,
		maxBundleRequests: options.maxBundleRequests || options.bundleDepth,
		maxMainRequests: options.maxMainRequests || options.mainDepth
	}, options);

	if(options.sourceMaps) {
		assign(config, {
			lessOptions: assign({}, options.lessOptions, {
				sourceMap: {}
			})
		});
	}

	if(options.ignore) {
		config.meta = config.meta || {};
		forEach(options.ignore, function(value){
			config.meta[value] = {
				"bundle": false
			};
		});
	}

	if(config.bundlesPath) {
		throw new Error("bundlesPath has been removed. Use dest instead: http://stealjs.com/docs/steal-tools.BuildOptions.html");
	}

	// Tree-shaking
	if(options.treeShaking === false) {
		config.treeShaking = false;
	}

	// package.json!npm is now the default
	if(!config.config && !config.configMain) {
		config.configMain = "package.json!npm";
	}

	// Setup logging
	logging.setup(options, config);

	// Flag this so that we only run this function once
	options.__defaultsAssigned = true;

	return options;
};
