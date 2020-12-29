define([
	"@loader",
	"c"
], function(loader){

	var localLoader = loader.localLoader || loader;

	function setBundle(name, source) {
		var bundle = localLoader.bundle = localLoader.bundle || [];
		bundle.push(name);
		var virtualModules = localLoader.virtualModules = localLoader.virtualModules || [];
		virtualModules[name] = source;
	}

	function translate(load){
		var bSource = "require('c');\nwindow.b = module.exports = 'b';";
		setBundle("other/b", bSource);

		return "module.exports = 'a';";
	}

	return {
		translate: translate
	};

});
