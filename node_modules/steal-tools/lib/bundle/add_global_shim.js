
var makeNode = require("../node/make_node"),
	minify = require("../graph/minify"),
	fs = require("fs"),
	path = require("path"),
	prettier = require("prettier");

// makes it so this bundle loads steal
module.exports = function(bundle, options){
	var exports = options.exports; // ? exportsForDependencies(bundle.nodes, options.exports) : {};
	var shim = fs.readFileSync(path.join(__dirname, "shim.js"));
	var shimEnd = fs.readFileSync(path.join(__dirname, "shim-end.js"));
	var shimEval = fs.readFileSync(path.join(__dirname, "shim-eval.js"));

	// target global variable, self (Web Workers) or window
	var g = `typeof self == "object" && self.Object == Object ? self : (typeof process === "object" && Object.prototype.toString.call(process) === "[object process]") ? global : window`;

	var source = prettier.format(
		`(${shim.toString()})(
			${JSON.stringify(exports)},
			${g},
			${shimEval.toString()}
		);`,
		{ useTabs: true }
	);

	var start = makeNode("[global-shim-start]", source);
	source = `(${shimEnd.toString()})(${g});`;
	var end = makeNode("[global-shim-end]", source);

	if(options.minify){
		minify([start]);
		minify([end]);
	}
	bundle.nodes.unshift(start);
	bundle.nodes.push(end);
};
