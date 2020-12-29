var amd_amd = require('./amd_amd');
var getCompile = require('./es6_compiler');
var esprima = require("esprima");
var getAst = require("./get_ast");

module.exports = function(load, options){
	var compile = getCompile(options);

	var result = compile(load.source.toString(), {
		filename: options.sourceMapFileName || load.address,
		modules: 'amd',
		sourceMaps: true
	}, options);
	load.source = result.code;
	load.map = result.map;
	load.ast = getAst(load, options.sourceMapFileName);
	return amd_amd(load, options);
};
