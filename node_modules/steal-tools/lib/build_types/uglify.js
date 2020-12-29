var assign = require("lodash/assign");
var isFunction = require("lodash/isFunction");

function uglify(source, options) {
	var Terser = require("terser");

	var code = source.code;
	var existingSourceMap = source.map;
	var uglifyOptions = assign({}, options ? options.uglifyOptions : {});

	if (options.sourceMaps) {
		var sourceMap = uglifyOptions.sourceMap || {};

		if (existingSourceMap) {
			var content = getRawSourceMap(existingSourceMap);
			var filename = content.sources && content.sources[0];

			sourceMap.filename = filename;
			sourceMap.content = content;
		}

		sourceMap.includeSources = !!options.sourceMapsContent;
		uglifyOptions.sourceMap = sourceMap;
	}

	return Terser.minify(code, uglifyOptions);
}

function getRawSourceMap(map) {
	return isFunction(map.toJSON) ? map.toJSON() : map;
}

module.exports = uglify;
module.exports.async = function(source, options){
	return Promise.resolve().then(function() {
		return uglify(source, options);
	});
};
