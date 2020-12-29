var findBundle = require("./find_bundle");

module.exports = function normalizeBundle(data) {
	var loader = getLoader(data);
	var bundle = findBundle(loader);

	var normalizePromises = bundle.map(function(moduleName){
		return Promise.resolve(loader.normalize(moduleName));
	});

	return Promise.all(normalizePromises).then(function(bundle){
		loader.bundle = bundle;
		return data;
	});
};

// We could directly receive a loader or this might be a dependencyGraph object
// containing the loader.
function getLoader(data) {
	if(typeof Loader !== "undefined" && (data instanceof global.Loader)) {
		return data;
	} else if(typeof LoaderPolyfill !== "undefined" && (data instanceof global.LoaderPolyfill)) {
		return data;
	} else {
		return data.steal.System;
	}
}
