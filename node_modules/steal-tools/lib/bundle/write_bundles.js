var bundleFilename = require("./filename");
var dirname = require("path").dirname;
var addSourceMapUrl = require("../bundle/add_source_map_url");
var through = require("through2");
var winston = require("winston");
var minifySource = require("./minify_source");

var denodeify = require("pdenodeify");
var writeFile = denodeify(require("fs").writeFile);
var mkdirp = denodeify(require("fs-extra").mkdirp);

/**
 * Writes bundles out to the file system.
 * @param {Array} bundles - The bundles to be written out
 * @param {Object} configuration - The build configuration object
 * @return {Promise.<bundle[]>} A promise that resolves when bundles finished writing
 */
var writeBundles = module.exports = function(bundles, configuration) {
	// Create the bundle directory
	var bundleDirDef = configuration.mkBundlesPathDir();

	var processBundle = function(bundle) {
		var bundlePath = bundle.bundlePath;

		// If the bundle is explicity marked as clean, just resolve.
		if (bundle.isDirty === false) {
			return Promise.resolve(bundle);
		}

		var sourceCode;
		var sourceMap;

		// minify concatenated source
		return minifySource(bundle, configuration.options)
			.then(function(minified) {
				bundle.source = minified;

				sourceCode = bundle.source.code;
				if (configuration.options.sourceMaps) {
					addSourceMapUrl(bundle);
					sourceCode = bundle.source.code;
					sourceMap = bundle.source.map;
				}

				// Log the bundles
				winston.info("BUNDLE: %s", bundleFilename(bundle));
				winston.debug(Buffer.byteLength(sourceCode, "utf8") + " bytes");

				bundle.nodes.forEach(function(node) {
					winston.info("+ %s", node.load.name);
				});

				return bundleDirDef;
			})
			// Once a folder has been created, write out the bundle source
			.then(function() {
				return mkdirp(dirname(bundlePath));
			})
			.then(function() {
				return writeFile(bundlePath, sourceCode);
			})
			.then(function() {
				if (sourceMap) {
					return writeFile(bundlePath+".map", sourceMap);
				}
			})
			.then(function() {
				return bundle;
			});
	};

	return Promise.all(bundles.map(processBundle));
};

/**
 * Transform stream that writes the bundles to the filesystem
 * @param {Object} [options] - An object of options
 * @return {stream.Transform}
 */
writeBundles.createWriteStream = function() {
	function write(buildResult, enc, done) {
		var configuration = buildResult.configuration;
		var bundles = buildResult.bundles;

		writeBundles(bundles, configuration)
			.then(function() {
				done(null, buildResult);
			})
			.catch(done);
	}

	return through.obj(write);
};
