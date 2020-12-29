var UglifyJS = require("uglify-js");
var removeSourceMapUrl = require("../remove_source_map_url");

module.exports = function(source, options){
	var opts = (options != null) ? options.uglifyOptions : {};
	var code = source.code;

	opts = opts || {};
	opts.fromString = true;
	if(source.map) {
		var inMap = source.map.toJSON();
		var file = inMap.sources && inMap.sources[0];
		opts.inSourceMap = inMap;
		opts.outSourceMap = file;

		if(options.sourceMapsContent) {
			opts.sourceMapIncludeSources = true;
		}
	}

	var result = UglifyJS.minify(code, opts);
	result.code = removeSourceMapUrl(result.code);
	return result;
};
