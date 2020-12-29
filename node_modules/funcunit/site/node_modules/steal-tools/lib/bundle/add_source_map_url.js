var path = require("path");

module.exports = function(bundle){
	if(bundle.source.map) {
		var filename = path.basename(removePlugin(bundleName(bundle))) + "." +
			bundle.buildType;
		bundle.source.code += wrap(filename, bundle.buildType);
	}
};

var pluginExp = /\..+!$/;
function removePlugin(name) {
	return name.replace(pluginExp, "");
}

function bundleName(bundle) {
	var name = bundle.name || bundle.bundles[0] || bundle.nodes[0].load.name;
	return name .replace("bundles/", "").replace(/\..+!/, "");
}

function wrap(filename, buildType) {
	switch(buildType) {
		case "css":
			return "\n/*# sourceMappingURL=" + filename + ".map */";
		default:
			return "\n//# sourceMappingURL=" + filename + ".map";
	}
}
