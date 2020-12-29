var inferredBundle = require("./inferred");
var globbedBundle = require("./globbed");

module.exports = bundleAssets;

function bundleAssets(buildResult, options){
	options = Object.assign({
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

	return Promise.all(promises).then(function () {
		return buildResult;
	});
}
