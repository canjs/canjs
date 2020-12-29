var clone = require("lodash/clone");
var omitBy = require("lodash/omitBy");
var compact = require("lodash/compact");
var includes = require("lodash/includes");
var defaults = require("lodash/defaults");
var commandOptions = require("./options");

/**
 * Convert the arv into a BuildOptions object
 * @param {Object} argv Command arguments provided by yargs
 * @return {BuildOptions} The build options object
 */
module.exports = function(argv) {
	var options = clone(argv);

	if (options.noMinify) {
		options.minify = false;
	}

	if (options.verbose) {
		options.quiet = false;
	}

	if(options.noTreeShaking) {
		options.treeShaking = false;
	}

	if (options.noEnvify) {
		options.envify = false;
	}

	defaults(options, {
		envify: true,
		minify: options.watch ? false : true,
		quiet: options.watch ? true : false
	});

	var aliases = compact(Object.keys(commandOptions).map(function(o) {
		return commandOptions[o].alias;
	}));

	return omitBy(options, function(value, key) {
		return includes(aliases, key) || includes(key, "-");
	});
};
