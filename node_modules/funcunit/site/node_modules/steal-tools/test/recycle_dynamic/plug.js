var loader = require("@loader");

exports.translate = function(load){
	// Detect dynamic imports
	var res = /System\.import\("([a-z]+)"\)/.exec(load.source);
	if(res) {
		var localLoader = loader.localLoader || loader;
		var bundle = localLoader.bundle;
		if(!bundle) {
			bundle = localLoader.bundle = [];
		}
		bundle.push(res[1]);
	}

	return "def" + "ine([], function(){" +

	"});";
};
