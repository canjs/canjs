var path = require("path");
var fs = require("fs-extra");
var through = require("through2");
var denodeify = require("pdenodeify");
var concat = require("lodash/concat");
var includes = require("lodash/includes");
var isString = require("lodash/isString");
var isJavaScriptBundle = require("../bundle/is_js_bundle");

var outputFile = denodeify(fs.outputFile);

module.exports = function() {
	return through.obj(function(data, enc, next) {
		var promise = canWriteManifest(data.options) ?
			writeBundleManifest(data) :
			Promise.resolve(data);

		promise
			.then(function(result) {
				next(null, result);
			})
			.catch(next);
	});
};

/**
 * Whether the option to generate the manifest was set
 * @param {Object} options - The build options object
 */
function canWriteManifest(options) {
	return options.bundleManifest === true || isString(options.bundleManifest);
}

function writeBundleManifest(data) {
	var manifest = {};

	var entryPointBundles = concat(
		data.mains,
		data.loader.bundle
	);

	entryPointBundles.forEach(function(bundleName) {
		manifest[bundleName] = getSharedBundlesOf(
			bundleName,
			data.loader.baseURL,
			data.bundles,
			data.mains
		);
	});

	// defaults to `dist/bundles.json`
	var dest = isString(data.options.bundleManifest) ?
		data.options.bundleManifest :
		path.join(data.configuration.dest, "bundles.json");

	// write the manifest file
	return outputFile(
		dest,
		JSON.stringify(manifest, null, "\t")
	).then(function() {
		return data;
	});
}

/**
 * A very simplified version of HTTP2 stream priorities
 * Bundles with the lowest weight should be loaded first
 *
 * @param {Object} bundle - A bundle object
 * @return {Number} 1 for css bundles, 2 for main JS bundles, 3 for shared bundles
 */
function getWeightOf(bundle) {
	var isCss = bundle.buildType === "css";
	var isMainBundle = bundle.bundles.length === 1;

	if (isCss) {
		return 1;
	} else if (isMainBundle) {
		return 2;
	} else {
		return 3;
	}
}

/**
 * Returns an object of shared bundles data
 * @param {string} name - A bundle name
 * @param {string} baseUrl - The loader's baseURL
 * @param {Array} bundles - The bundles array created by the build process
 * @param {Array} mains - The main entry point modules
 * @return {Object} Each key is a shared bundle relative path and the value
 *                  contains the `weight` and `type` of the bundle
 */
function getSharedBundlesOf(name, baseUrl, bundles, mains) {
	var shared = {};
	var normalize = require("normalize-path");
	// this will ensure that we only add the main bundle if there is a single
	// main; not a multi-main project.
	var singleMain = mains.length === 1 && mains[0];

	bundles.forEach(function(bundle) {
		if (includes(bundle.bundles, name) ||
			includes(bundle.bundles, singleMain)) {
			var relative = normalize(
				path.relative(
					baseUrl.replace("file:", ""),
					bundle.bundlePath
				)
			);

			shared[relative] = {
				weight: getWeightOf(bundle),
				type: isJavaScriptBundle(bundle) ? "script" : "style"
			};
		}
	});

	return shared;
}
