var stealTools = require("steal-tools");

var promise = stealTools.build({
	main: "main",
	config: __dirname+"/stealconfig.js"
},{
	minify: false,
	debug: true
});