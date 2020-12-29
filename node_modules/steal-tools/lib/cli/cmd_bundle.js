var _ = require("lodash");
var winston = require("winston");
var stealTools = require("../../index");
var clone = require("lodash/cloneDeep");
var options = clone(require("./options"));
var makeStealConfig = require("./make_steal_config");

var pathsToOmit = [
	"bundles-path",
	"bundle-steal",
	"watch",
	"tree-shaking",
	"no-tree-shaking"
];

var bundleOptions = _.assign(
	{},
	_.omit(options, pathsToOmit),
	{
		dest: {
			alias: "d",
			type: "string",
			default: "",
			describe: "Defaults to root folder, a directory to save the bundles"
		},
		filter: {
			alias: "f",
			default: "**",
			type: "string",
			describe: "Glob pattern to match modules to be included in the bundle"
		},
		deps: {
			type: "boolean",
			default: false,
			describe: "Generates a development bundle of the dependencies in the node_modules folder"
		},
		dev: {
			type: "boolean",
			default: false,
			describe: "Generates a development bundle like --deps but includes StealJS @config modules"
		}
	}
);

module.exports = {
	command: "bundle",

	describe: "Creates a custom bundle",

	builder: bundleOptions,

	handler: function (argv) {
		var options = argv;
		var config = makeStealConfig(argv);
		var filter = getFilterPattern(options);

		options.filter = filter ? filter : options.filter;

		return stealTools.bundle(config, options)
			.then(function() {
				winston.info("\nBundle created successfully".green);
			})
			.catch(function(e) {
				e = typeof e === "string" ? new Error(e) : e;

				winston.error(e.message.red);
				winston.error("\nBuild failed".red);

				process.exit(1);
			});
	}
};

/**
 * Returns the glob pattern(s) used to generate the bundle
 * @param {{}} options The command options object
 * @returns {String|Array} Glob pattern(s)
 */
function getFilterPattern(options) {
	var pattern;

	// if the --dev flag is passed, generate a bundle with the
	// node_modules dependencies AND StealJS @config graph
	if (options.dev) {
		pattern = ["node_modules/**/*", "package.json"];
	}
	// make a bundle of dependencies in node_modules folder
	// when the --deps flag is used
	else if (options.deps) {
		pattern = "node_modules/**/*";
	}

	return pattern;
}
