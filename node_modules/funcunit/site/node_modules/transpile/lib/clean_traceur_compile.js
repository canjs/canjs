// traceur needs a version of System.  It's possible that it's already
// been required and System overwritten/lost.
// This make sure traceur is entirely reloaded.

var traceurPath = require.resolve("traceur");
var path = require("path");
var assign = require('object.assign');

var search = path.sep + "node_modules" + path.sep + "traceur" + path.sep;
var index = traceurPath.indexOf(search);
var tPath = traceurPath.substr(0,index+search.length);

for(var name in require.cache) {
	if( name.indexOf(tPath) === 0 ) {
		delete require.cache[name];
	}
}

var globalNames = ["System"];

var oldGlobals = {};
globalNames.forEach(function(name){
	oldGlobals[name] = global[name];
});

var traceur = require('traceur');
var NodeCompiler = traceur.NodeCompiler;
var commonJSOptions = traceur.commonJSOptions;

var globals = {};
globalNames.forEach(function(name){
	globals[name] = global[name];
});

globalNames.forEach(function(name){
	global[name] = oldGlobals[name];
});

module.exports = function(source, compilerOptions, options){
	var saved = {};
	
	globalNames.forEach(function(name){
		saved[name] = global[name];
		global[name] = globals[name];
	});

	if(compilerOptions.sourceMaps) {
		compilerOptions.sourceMaps = "memory";
	}
	if(options.traceurOptions) {
		assign(compilerOptions, options.traceurOptions);
	}
	var compiler = new NodeCompiler(commonJSOptions(compilerOptions));

	var result = {};
	result.code = compiler.compile(source, compilerOptions.filename, compilerOptions.filename);
	result.map = compiler.getSourceMap();
	
	globalNames.forEach(function(name){
		global[name] = saved[name];
	});
	
	return result;
};
