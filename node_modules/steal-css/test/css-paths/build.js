var stealTools = require("steal-tools");

var promise = stealTools.build({
	main: "main",
	config: __dirname+"/config.js"
},{
	minify: false,
	debug: true,
	bundleAssets: true
});