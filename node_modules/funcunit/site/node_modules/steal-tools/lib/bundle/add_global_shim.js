
var makeNode = require("../node/make_node"),
	minify = require("../graph/minify"),
	fs = require("fs"),
	path = require("path");

// makes it so this bundle loads steal
module.exports = function(bundle, options){
	var exports = options.exports; // ? exportsForDependencies(bundle.nodes, options.exports) : {};
	var shim = fs.readFileSync(path.join(__dirname, "shim.js"));
	var shimEnd = fs.readFileSync(path.join(__dirname, "shim-end.js"));
	var shimEval = fs.readFileSync(path.join(__dirname, "shim-eval.js"));

	var source = "(" + shim.toString() +")(" + JSON.stringify(exports) + ",window,"+shimEval.toString()+")";
	var start = makeNode("[global-shim-start]", source);
	source = "(" + shimEnd.toString() + ")();";
	var end = makeNode("[global-shim-end]", source);

	if(options.minify){
		minify([start]);
		minify([end]);
	}
	bundle.nodes.unshift(start);
	bundle.nodes.push(end);
};

// This only includes exports for loads in the bundle and their dependencies.
/*var exportsForDependencies = function(bundle, allExports){
	var exports = {};

	bundle.forEach(function(node){
		if(allExports[node.load.name]){
			exports[node.load.name] = allExports[node.load.name];
		}
		node.dependencies.forEach(function(dep){
			if(allExports[dep]){
				exports[dep] = allExports[dep];
			}
		});
	});
	return exports;
};*/
