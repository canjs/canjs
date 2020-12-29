var winston = require("winston");
var _assign = require("lodash/assign");
var omit = require("lodash/omit");
var stealTools = require("../../index");
var _clone = require("lodash/cloneDeep");
var makeStealConfig = require("./make_steal_config");
var options = _clone(require("./options"));
var makeOutputs = require("./make_outputs");

module.exports = {
	command: "export",

	builder: _assign({}, omit(options, ["tree-shaking", "no-tree-shaking"]), {
		cjs: {
			type: "boolean",
			describe: "Sets default +cjs output"
		},
		amd: {
			type: "boolean",
			describe: "Sets default +amd output"
		},
		global: {
			type: "boolean",
			describe: "Sets default +global-js and +global-css outputs"
		},
		standalone: {
			type: "boolean",
			describe: "Sets default +standalone output"
		},
		all: {
			type: "boolean",
			describe: "Sets outputs to +cjs, +amd, +global-js, and +global-css"
		},
		dest: {
			type: "string",
			describe: "Set the destination for the created file"
		}
	}),

	describe: "Export a project's modules to other forms and formats declaratively",

	handler: function(argv) {
		var options = argv;
		var steal = makeStealConfig(argv);
		var outputs = makeOutputs(options);

		var promise = stealTools.export({
			steal: steal,
			options: options,
			outputs: outputs
		});

		return promise.then(function() {
			winston.info("\nExport completed successfully".green);
		});
	}
};
