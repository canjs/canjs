var DEFAULT = 3;

module.exports = function(config, options, isMain){
	if(isMain && isNumber(options.maxMainRequests)) {
		return options.maxMainRequests;
	}

	if(isNumber(options.maxBundleRequests)) {
		return options.maxBundleRequests;
	}

	return DEFAULT;
};

function isNumber(x) {
	return typeof x === "number";
}
