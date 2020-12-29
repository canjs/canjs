var hashBundle = require("./hash");
var reduce = require("lodash").reduce;

// Goes through each bundle and marks it as dirty if it's md5 hash representation
// has changed. This is used for rebuilding to prevent writing out bundles
// that have not changed.
module.exports = function(bundles, data){
	var bundlesKeyed = data.bundles || {};

	data.bundles = reduce(bundles, function(result, bundle){
		var hash;
		if(bundlesKeyed[bundle.name]) {
			hash = bundlesKeyed[bundle.name].hash;
		}
		bundle.hash = hashBundle(bundle);
		bundle.isDirty = hash !== bundle.hash;

		result[bundle.name] = bundle;
		return result;
	}, {});
};
