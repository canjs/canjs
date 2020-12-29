// # lib/bundle/write_bundles.js
// Given an array of bundles and the baseURL
// Writes them out to the file system.
var bundleFilename = require("./filename"),
	fs = require("fs"),
	mkdirp = require("fs-extra").mkdirp,
	dirname = require("path").dirname,
	addSourceMapUrl = require("../bundle/add_source_map_url"),
	through = require("through2"),
	winston = require("winston"),
	minifySource = require("./minify_source");

var writeBundles = module.exports = function(bundles, configuration) {
	// Create the bundle directory
	var bundleDirDef = configuration.mkBundlesPathDir();

	// A deferred containing a deferred that resolves when all
	// deferreds have been built.
	var builtBundleDeferreds = [];

	bundles.forEach(function(bundle) {
		builtBundleDeferreds.push(new Promise(function(resolve, reject) {
			var bundlePath = bundle.bundlePath;

			// If the bundle is explicity marked as clean, just resolve.
			if(bundle.isDirty === false) {
				return resolve(bundle);
			}

			// minify concatenated source
			minifySource(bundle, configuration.options);

			var code = bundle.source.code, map;
			if(configuration.options.sourceMaps) {
				addSourceMapUrl(bundle);
				code = bundle.source.code;
				map = bundle.source.map;
			}

			// Log the bundles
			winston.info("BUNDLE: %s", bundleFilename(bundle));
			winston.debug(Buffer.byteLength(code, "utf8") + " bytes");

			bundle.nodes.forEach(function(node) {
				winston.info("+ %s", node.load.name);
			});

			// Once a folder has been created, write out the bundle source
			bundleDirDef.then(function() {
				mkdirp(dirname(bundlePath), function(err) {
					if (err) {
						reject(err);
					}
					else {
						fs.writeFile(bundlePath, code, function(err) {
							if(err) {
								reject(err);
							} else {
								if(!map) {
									resolve(bundle);
									return;
								}
								// Write out the source map
								fs.writeFile(bundlePath+".map", map, function(err) {
									if(err) return reject(err);
									resolve(bundle);
								});
							}
						});
					}
				});

			}).catch(function(err) {
				reject(err);
			});
		}));
	});

	return Promise.all(builtBundleDeferreds);
};

writeBundles.createWriteStream = function(){
	function write(buildResult, enc, done) {
		var configuration = buildResult.configuration;
		var bundles = buildResult.bundles;

		writeBundles(bundles, configuration).then(function(){
			done(null, buildResult);
		}, done);
	}

	return through.obj(write);
};
