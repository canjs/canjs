var path = require("path");

module.exports = function(argv) {
	// Determine the location of the config file
	var config = argv.config[0] === "/" ?
		argv.config :
		path.join(process.cwd(), argv.config);

	var steal = { config: config };

	if (argv.main) {
		steal.main = argv.main;
	}

	if(argv.bundlesPath) {
		steal.bundlesPath = argv.bundlesPath;
	}

	return steal;
};
