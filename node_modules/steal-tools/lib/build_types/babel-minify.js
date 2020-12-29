var assign = require("lodash/assign");

function babelMinify(source, options) {
	var minify = require("babel-minify");

	var code = source.code;
	var existingSourceMap = source.map;

	var minifyOptions = assign({
		sourceType: "unambiguous"
	}, options ? options.babelMinifyOptions : {});

	if(options.sourceMaps) {
		minifyOptions.sourceMaps = true;
		minifyOptions.inputSourceMap = existingSourceMap;
	}

	var result = minify(code, {}, minifyOptions);
	return result;
}

module.exports = babelMinify;
module.exports.async = function(source, options) {
	return Promise.resolve().then(function(){
		return babelMinify(source, options);
	});
};
