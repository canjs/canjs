var glob = require("glob").sync;

module.exports = findBundles;

/**
 * @module {Function} findBundles
 * @description Find all of the bundles belonging to a loader.
 * @param {Loader} loader
 * @return {Array.<moduleName>}
 */
function findBundles(loader) {
	if(Array.isArray(loader.bundle)) {
		return loader.bundle;
	} else if(typeof loader.bundle !== "string") {
		return [];
	}

	// Support for globs,
	// System.bundle = "components/**/*";
	var pattern = loader.bundle;
	var bundle = glob(pattern, {
		cwd: path(loader.baseURL)
	}).map(minusJS);

	return bundle;
}

// Remove the file: protocol portion of the baseURL because glob doesn't
// work with it.
function path(baseURL) {
	return baseURL.replace("file:", "");
}

// Remove the .js extension to make these proper module names.
function minusJS(name) {
	var idx = name.indexOf(".js");
	return idx === -1 ? name : name.substr(0, idx);
}
