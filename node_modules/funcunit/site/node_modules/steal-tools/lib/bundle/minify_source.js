var minifyCSS = require("../buildTypes/minifyCSS");

module.exports = function(bundle, options) {
	options = options || {};

	if (options.minify && bundle.buildType === "css") {
		bundle.source = minifyCSS(bundle.source, options);
	}

	return bundle;
};
