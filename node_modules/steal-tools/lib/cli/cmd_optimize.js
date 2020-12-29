var winston = require("winston");
var omit = require("lodash/omit");
var assign = require("lodash/assign");
var clone = require("lodash/cloneDeep");
var stealTools = require("../../index");
var isString = require("lodash/isString");
var makeStealConfig = require("./make_steal_config");
var makeBuildOptions = require("./make_build_options");

var options = assign(
	clone(omit(require("./options"), ["bundle-steal", "watch"])),
	{
		minify: {
			type: "boolean",
			default: undefined,
			describe: "Minify the output. Defaults to true"
		},
		quiet: {
			type: "boolean",
			describe: "Quiet output"
		},
		"split-loader": {
			type: "boolean",
			default: false,
			describe: "Writes the optimized loader in its own bundle (loader.js)"
		},
		target: {
			type: "array",
			demandOption: false,
			describe: [
				"Specifies the platform where the application is going to be deployed",
				'[choices: "web", "node", "worker"]'
			].join("\n")
		}
	}
);

module.exports = {
	command: ["optimize"],

	describe: "Creates an optimized build of a module and all of its dependencies",

	builder: options,

	handler: function(argv) {
		return stealTools.optimize(makeStealConfig(argv), makeBuildOptions(argv))
			.then(function() {
				winston.info("\nOptimized build completed successfully".green);
			})
			.catch(function(e) {
				var error = isString(e) ? new Error(e) : e;

				winston.error(error.message.red);
				winston.error("\nOptimized build failed".red);

				process.exit(1);
			});
	}
};
