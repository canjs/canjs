// given a named bundle, returns the filename

module.exports = function(bundle){
	if(bundle.buildType && bundle.buildType !== "js") {
		var last = bundle.name.lastIndexOf("!");
		if(last !== -1) {
			return bundle.name.substr(0,last).replace(/^bundles\//,"");
		} else {
			return bundle.name.replace(/^bundles\//,"");
		}
		
	} else {
		return bundle.name.replace(/^bundles\//,"")+".js";
	}
};
