var stealTools = require("steal-tools");

stealTools.build({
	main: "can/test/test-production",
	config: __dirname + "/../package.json!npm"
},{
	minify: false,
	debug: true,
	bundleAssets: true
});
