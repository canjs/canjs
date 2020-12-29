var fs = require('fs'),
	path = require('path'),
	traceurPath = require.resolve('traceur'),
	makeNode = require("../node/make_node"),
	minify = require("../graph/minify");
	
module.exports = function(bundle){
	var lastTraceur = traceurPath.indexOf("traceur" + path.sep);
	var baseTraceur = traceurPath.substr(0, lastTraceur);
	
	// We have to product Steal's system.
	
	var traceurRuntime = fs.readFileSync( path.join(baseTraceur,"traceur/bin/traceur-runtime.js") );
	
	var node = makeNode("[traceur-runtime]", "this._System = this.System;\n"+traceurRuntime+";\nthis.System = this._System; delete this._System");
	minify([node]);
	bundle.nodes.unshift( node );
};
