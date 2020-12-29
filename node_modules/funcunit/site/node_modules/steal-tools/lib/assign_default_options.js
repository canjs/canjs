var assign = require("lodash").assign,
	forEach = require("lodash").forEach,
	logging = require("./logger");

module.exports = function(config, options){
	if(options.__defaultsAssigned) return options;

	options = assign({ // Defaults
		minify: false,
		bundleSteal: false,
		uglifyOptions: {},
		cleanCSSOptions: {},
		removeDevelopmentCode: true,
		namedDefines: true
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

	// Setup logging
	logging.setup(options, config);

	// Flag this so that we only run this function once
	options.__defaultsAssigned = true;

	return options;
};
