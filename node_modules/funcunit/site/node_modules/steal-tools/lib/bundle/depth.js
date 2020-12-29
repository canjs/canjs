var DEFAULT = 3;

module.exports = function(config, options, isMain){
	if(isMain && isNumber(config.mainDepth)) {
		return config.mainDepth;
	}

	if(isNumber(options.bundleDepth)) {
		return options.bundleDepth;
	}

	return DEFAULT;
};

function isNumber(x) {
	return typeof x === "number";
}
