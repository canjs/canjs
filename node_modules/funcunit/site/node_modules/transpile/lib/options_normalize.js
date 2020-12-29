module.exports = function(options, moduleName, curModule, address){
	options = options || {};
	var name = (options.normalizeMap && options.normalizeMap[moduleName]) || moduleName;
	if(options.normalize) {
		name = options.normalize(name, curModule, address);
	}
	return name;
};
