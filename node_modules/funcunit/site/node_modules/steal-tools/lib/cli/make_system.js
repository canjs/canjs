var path = require("path");

module.exports = function(argv) {
	// Determine the location of the config file
	var config = argv.config[0] === "/" ?
		argv.config :
		path.join(process.cwd(), argv.config);

	var system = { config: config };

	if (argv.main) {
		system.main = argv.main;
	}

	if(argv.bundlesPath) {
		system.bundlesPath = argv.bundlesPath;
	}

	return system;
};
