var bundleFilename = require("./filename");
var concatSource = require("../bundle/concat_source");
var normalizeSource = require("./normalize_source");
var through = require("through2");

module.exports = function(){
	return through.obj(function(data, enc, next){
		var bundles = data.bundles;
		var configuration = data.configuration;
		var bundlesDir = configuration.bundlesPath + "/";

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
			concatSource(bundle);
		});

		next(null, data);
	});
};
