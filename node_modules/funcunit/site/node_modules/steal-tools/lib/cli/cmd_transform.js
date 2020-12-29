var fs = require("fs");
var _assign = require("lodash/assign");
var stealTools = require("../../index");
var _clone = require("lodash/cloneDeep");
var makeSystem = require("./make_system");
var options = _clone(require("./options"));

module.exports = {
	command: "transform",

	builder: _assign({}, options, {
		out: {
			alias: "o",
			type: "string",
			describe: "Specify an output file"
		},
		ignore: {
			type: "string",
			describe: "Comma-separated list of modules to not include in the output"
		}
	}),

	describe: "Transform a module to other formats",

	handler: function(argv) {
		var ignore = [];
		var options = argv;
		var system = makeSystem(argv);

		// ignore would be a comma-separated list like jquery,underscore,moment
		if (argv.ignore) {
			ignore = argv.ignore.split(",");
		}

		return stealTools.transform(system, options)
			.then(function(transform){
				var result = transform(null, {
					ignore: ignore
				});

				var code = result.code;
				var map = result.map;

				// Write out the contents
				fs.writeFileSync(argv.out, code, "utf8");
				if (map) {
					fs.writeFileSync(argv.out + ".map", map.toString(), "utf8");
				}
			});
	}
};
