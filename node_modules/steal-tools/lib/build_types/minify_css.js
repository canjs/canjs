var CleanCSS = require("clean-css");
var assign = require("lodash/assign");

module.exports = function(source, options) {
	var opts = assign({}, options && options.cleanCSSOptions, {
		returnPromise: true
	});

	if(options.sourceMaps) {
		opts.sourceMap = source.map ? source.map+"" : true;
	}

	return new CleanCSS(opts)
		.minify(source.code)
		.then(function(result) {
			return {
				code: result.styles,
				map: result.sourceMap
			};
		});
};
