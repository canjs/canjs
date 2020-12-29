var pump = require("pump");
var assign = require("lodash/assign");
var minify = require("../stream/minify");
var transpile = require("../stream/transpile");
var concat = require("../bundle/concat_stream");
var makeBundle = require("../stream/make_bundle");
var filterBundleGraph = require("../stream/filter_bundle_graph");

var assignDefaultOptions = require("../assign_default_options");
var createWriteStream = require("../bundle/write_bundles").createWriteStream;
var createBundleGraphStream = require("../graph/make_graph_with_bundles")
	.createBundleGraphStream;

module.exports = function(cfg, options) {
	// Use the build-development environment.
	if (!options) options = {};

	var isDestProvided = !!options.dest;

	// minification is disabled by default
	options.minify = options.minify == null ? false : options.minify;

	// tree shaking is disabled.
	var config = Object.assign({ treeShaking: false }, cfg);

	try {
		options = assignDefaultOptions(config, options);
	} catch(err) {
		return Promise.reject(err);
	}

	// if `dest` was not provided in the options object, override the default
	// value so the development bundle is written out in the root folder
	assign(options, {
		defaultBundlesPathName: "",
		dest: isDestProvided ? options.dest : "",
		buildStealConfig: {
			env: "bundle-build"
		},
		// Never really want to remove development strings when using
		// deps/dev bundles
		removeDevelopmentCode: false
	});

	return new Promise(function(resolve, reject) {
		var writeStream = pump(
			createBundleGraphStream(config, options),
			filterBundleGraph(),
			transpile(),
			minify(),
			makeBundle(),
			concat(),
			createWriteStream(),
			function(err) {
				if (err) reject(err);
			}
		);

		writeStream.on("data", function(data){
			this.end();
			resolve(data);
		});
	});
};
