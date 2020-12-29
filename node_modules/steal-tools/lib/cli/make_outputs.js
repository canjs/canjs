var _keys = require("lodash/keys");
var _some = require("lodash/some");
var _merge = require("lodash/merge");

module.exports = function(options) {
	var result = {};

	var outputs = {
		cjs: { "+cjs": {} },
		amd: { "+amd": {} },
		global: {
			"+global-css": {},
			"+global-js": {
				exports: { "jquery": "jQuery" }
			}
		},
		standalone: { "+standalone": {} }
	};

	var outputOptions = [ "dest" ];

	var hasSetOptions = _some(_keys(outputs), function(out) {
		return options[out];
	});

	// determines if the output is included in "all"
	var outputAll = function(hasSetOptions, options, out){
		return (!hasSetOptions || options.all) && out !== "standalone";
	};

	_keys(outputs).forEach(function(out) {
		if (outputAll(hasSetOptions, options, out) || options[out]) {
			_merge(result, outputs[out]);
		}
	});

	// Set the options on the outputs, like `dest`
	outputOptions.forEach(function(opt){
		if(options[opt]) {
			_keys(result).forEach(function(key){
				var out = result[key];
				
				// Set the value
				out[opt] = options[opt];
			});
		}
	});

	return result;
};
