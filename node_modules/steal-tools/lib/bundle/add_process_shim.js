
var makeNode = require("../node/make_node"),
	minify = require("../graph/minify"),
	fs = require("fs"),
	path = require("path"),
	prettier = require("prettier");

// makes it so this bundle loads steal
module.exports = function(bundle, options){
	var processFn = fs.readFileSync(path.join(__dirname, "shim-process.js"));
    var env = options.env || "development";

	// target global variable, self (Web Workers) or window
	var g = `typeof self == "object" && self.Object == Object ? self : (typeof process === "object" && Object.prototype.toString.call(process) === "[object process]") ? global : window`;

	var source = prettier.format(
		`(${processFn.toString()})(
			${g},
			${JSON.stringify(env)}
		);`,
		{ useTabs: true }
	);

	var start = makeNode("[process-shim]", source);

	if(options.minify){
		minify([start]);
	}
	bundle.nodes.unshift(start);
};
