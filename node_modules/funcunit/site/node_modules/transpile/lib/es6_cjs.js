var normalizeCJS = require('./normalize_cjs');
var getCompile = require('./es6_compiler');
var getAst = require("./get_ast");
var sourceMapToAst = require("sourcemap-to-ast");

module.exports = function(load, options){
	var compile = getCompile(options);

	var copy = {};
	for(var prop in load) {
		copy[prop] = load[prop];
	}
	
	var result = compile(load.source.toString(), {
		filename: options.sourceMapFileName || load.address,
		modules: 'commonjs',
		sourceMaps: true
	}, options);
	load.source = result.code;
	load.map = result.map;
	var ast = load.ast = getAst(load, options.sourceMapFileName);
	if(options && (options.normalizeMap || options.normalize)) {
		copy.source = result.code;
		copy.ast = ast;
		return normalizeCJS(copy, options);
	} else {
		return ast;
	}
	
};
