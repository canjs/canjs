var _ = require("lodash");
var through = require("through2");
var bundleFilename = require("./filename");
var concatSource = require("../bundle/concat_source");
var normalizeSource = require("./normalize_source");

module.exports = function(){
	return through.obj(function(data, enc, next) {
		try {
			var p = concat(data);
			p.then(function(result){
				next(null, result);
			});
		} catch(err) {
			next(err);
		}
	});
};

function concat(data) {
	var bundles = data.bundles;
	var configuration = data.configuration;
	var bundlesPath = configuration.bundlesPath;

	var bundlesDir = _.endsWith(bundlesPath, "/") ?
		bundlesPath : bundlesPath + "/";

	var promises = [];

	bundles.forEach(function(bundle){
		var bundlePath = bundle.bundlePath =
			bundlesDir + "" + bundleFilename(bundle);

		// If the bundle is explicity marked as clean, just resolve.
		if(bundle.isDirty === false) {
			return;
		}

		// Adjusts URLs
		normalizeSource(bundle, bundlePath);

		// Combines the source
		promises.push(concatSource(bundle, { format: "amd" }));
	});

	return Promise.all(promises).then(() => data);
}
