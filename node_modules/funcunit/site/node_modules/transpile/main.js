var bfs = require("./lib/bfs");
var detect = require('js-module-formats').detect;
var generate = require("./lib/generate");
var getAst = require("./lib/get_ast");
var sourceMapFileName = require("./lib/source_map_filename");
var graph = {},
	transpilers = {
		"amd_cjs": require("./lib/amd_cjs"),
		"cjs_amd": require("./lib/cjs_amd"),
		"cjs_steal": require("./lib/cjs_steal"),
		"es6_amd": require("./lib/es6_amd"),
		"es6_cjs": require("./lib/es6_cjs"),
		"steal_amd": require("./lib/steal_amd"),
		"amd_amd": require("./lib/amd_amd"),
		"global_amd": require("./lib/global_amd"),
		"cjs_cjs": require("./lib/cjs_cjs")
	};

for(var edge in transpilers) {
	var types = edge.split("_");
	
	if(!graph[types[0]]) {
		graph[types[0]] = {};
	}
	if(!graph[types[1]]) {
		graph[types[1]] = {};
	}
	
	graph[types[0]][types[1]] = graph[types[1]];
}


	
var copyLoad = function(load){
	var copy = {};
	for(var prop in load){
		copy[prop] = load[prop];
	}
	return copy;
};

var toSelf = function(load){
	return load.ast;
};


function moduleType(source) {
	var type = detect(source);
	// tricky, since the detected type could be just `es` instead of `es6`.
	return type && type !== 'es' ? type : 'es6';
}

// transpile.to
var transpile = {
	transpilers: transpilers,
	// transpile.to("amd",load)
	to: function(load, type, options){
		var format = load.metadata.format || moduleType(load.source);
		var path = this.able(format, type);
		
		if(!path) {
			throw "transpile - unable to transpile "+format+" to "+type;
		}
		if(!path.length) {
			// we are transpiling to ourselves.  Check for a transpiler
			path.push(format);
		}
		
		path.push(type);
		
		var copy = copyLoad(load);
		var normalize = options.normalize;

		options = options || {};
		options.sourceMapFileName = sourceMapFileName(copy, options);

		// Create the initial AST
		if(format !== "es6") {
			copy.ast = getAst(copy, options.sourceMapFileName);
		}

		var sourceContent = load.source;
		
		for(var i =0; i < path.length - 1; i++) {
			var transpiler = transpilers[path[i]+"_"+path[i+1]] || toSelf;	
			copy.ast = transpiler(copy, options);
			// remove the normalize option after the first pass.  
			delete options.normalize;
		}
		options.normalize = normalize;
		return generate(copy.ast, options, sourceContent);
	},
	able: function(from, to) {
		var path;
		bfs(from || "es6", graph, function(cur){
			if(cur.node === to) {
				path = cur.path;
				return false;
			}
		});
		return path;
	}
};

module.exports = transpile;
