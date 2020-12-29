var winston = require("winston");
var assign = require("lodash/assign");
var clone = require("lodash/cloneDeep");
var stealTools = require("../../index");
var makeStealConfig = require("./make_steal_config");
var makeBuildOptions = require("./make_build_options");

/**
 * Disable default values for conditional properties:
 *	Default values make it impossible for the `handler` callback
 *  to tell whether the user explicitly set a value or not
 */
var options = assign(clone(require("./options")), {
	minify: {
		type: "boolean",
		default: undefined,
		describe: "Minify the output. Defaults to true except when used with --watch"
	},
	quiet: {
		type: "boolean",
		describe: "Quiet output",
		default: undefined
	}
});

module.exports = {
	command: ["build", "*"], // `*` makes this the default command

	describe: "Build a module and all of its dependencies",

	builder: options,

	handler: function(argv) {
		var promise = stealTools.build(
			makeStealConfig(argv),
			makeBuildOptions(argv)
		);

		// If this is watch mode this is actually a stream.
		if (promise.then) {
			return promise.then(function() {
				winston.info("\nBuild completed successfully".green);
			}, function(e) {
				// since this is a library we should throw an exception, and
				// because it remains uncaught, will exit the node process with
				// and exit code greater than 0
				if (typeof e === "string") { e = new Error(e); }
				winston.error(e.message.red);
				winston.error("\nBuild failed".red);

				process.exit(1);
			});
		}
	}
};
