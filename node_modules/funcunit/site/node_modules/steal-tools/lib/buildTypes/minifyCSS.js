var CleanCSS = require('clean-css');

module.exports = function(source, options){
	var opts = (options != null) ? options.cleanCSSOptions : {};
	opts = opts || {};
	
	if(options.sourceMaps) {
		opts.sourceMap = source.map ? source.map+"" : true;
	}

	var code = source.code;

	var result = new CleanCSS(opts).minify(code);

	return {
		code: result.styles,
		map: result.sourceMap
	};
};
