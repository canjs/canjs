var through = require("through2");
var omit = require("lodash/omit");
var clone = require("lodash/clone");
var assign = require("lodash/assign");

module.exports = function(options) {
	return through.obj(function(data, enc, next) {
		try {
			next(null, options.target ? adjustBundlesPath(data, options) : data);
		} catch (err) {
			next(err);
		}
	});
};

/**
 * Appends the target name to the bundles path
 *
 * Each target build should be written in its own subfolder, e.g:
 *
 *	dist/bundles/node
 *	dist/bundles/web
 *	dist/bundles/worker
 *
 * This should only happen when target is explicitly set.
 */
function adjustBundlesPath(data, options) {
	var path = require("path");
	var configuration = clone(data.configuration);

	var bundlesPath = configuration.bundlesPath;
	Object.defineProperty(configuration, "bundlesPath", {
		configurable: true,
		get: function() {
			return path.join(bundlesPath, options.target);
		}
	});

	return assign({}, omit(data, ["configuration"]), {
		configuration: configuration
	});
}
