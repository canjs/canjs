var through = require("through2");
var isJavaScriptBundle = require("../bundle/is_js_bundle");

module.exports = function() {
	return through.obj(function(data, enc, next) {
		addPluginName(data)
			.then(function(data) {
				next(null, data);
			})
			.catch(next);
	});
};

/**
 * Adds `pluginName` property to non JS bundles
 */
function addPluginName(data) {
	var loader = data.loader;
	var bundles = data.bundles;

	var promises = bundles.map(function(bundle) {
		if (!isJavaScriptBundle(bundle)) {
			return loader.normalize(bundle.name).then(function(name) {
				bundle.pluginName = name.substring(name.indexOf("!") + 1);
			});
		}
	});

	return Promise.all(promises).then(function() {
		return data;
	});
}
