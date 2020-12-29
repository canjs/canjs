var minifiers = {
	css: require("../build_types/minify_css"),
	js: require("../build_types/minify_js").async
};

module.exports = function(bundle, options) {
	var opts = options || {};
	var minify = minifiers[bundle.buildType];

	// Minification is optional, but on by default
	var shouldMinify = (opts.minify !== false) && !!minify;

	return shouldMinify ?
		minify(bundle.source, opts) :
		Promise.resolve(bundle.source);
};
