var inferredBundle = require("./inferred");
var globbedBundle = require("./globbed");
var stealBundle = require("./steal");
var assign = require("lodash.assign");

module.exports = bundleAssets;

function bundleAssets(buildResult, options){
	options = assign({
		infer: true
	}, options);

	var promises = [];

	// By default we will infer files that need to be bundled
	// from source css.
	if(options.infer) {
		promises.push(inferredBundle(buildResult, options));
	}

	// If the user provides a glob object we'll bundle those as well.
	if(options.glob) {
		promises.push(globbedBundle(buildResult, options));
	}

	// Move steal over as well.
	promises.push(stealBundle(buildResult, options));

	return Promise.all(promises);
}
