var through = require("through2");
var prune = require("../graph/prune");
var treeshake = require("../graph/treeshake");
var winston = require("winston");

module.exports = function() {
	return through.obj(function(data, enc, next) {
		var options = data.options;

		var disabled =
			// Can be disabled from the BuildOptions
			options.treeShaking === false ||
			// Or from package.json config
			data.loader.treeShaking === false;

		if(disabled) {
			next(null, data);
			return;
		}

		winston.info("Tree shaking...");
		treeshake(data, options)
		.then(function(){
			prune(data);
			next(null, data);
		})
		.catch(next);
	});
};
