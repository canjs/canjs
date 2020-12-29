var baseHelper = require("./base");
var globalJS = require("./global").js;
var npmUtils = require("steal/ext/npm-utils");

var bundledES = {
	modules: globalJS.modules,
	skipTranspile: function(){
		return true;
	},
	dest: globalJS.dest,
	useNormalizedDependencies: globalJS.useNormalizedDependencies,
	concatFormat: function(){
		return "es";
	},
	normalize: function(){
		return function(depName, depLoad, curName, curLoad, loader){
			if(!depLoad) {
				return depName;
			}
			var name = depLoad.name;
			var res;

			var isNpmName = npmUtils.moduleName.isNpm(name);

			if(!isNpmName) {
				return name;
			}

			// Get the package name. We need this to denpm the name.
			var defaultPackage = npmUtils.pkg.getDefault(loader);
			var packageName = isNpmName ?
				npmUtils.moduleName.parse(name).packageName :
				npmUtils.pkg.name(defaultPackage);


			// convert this to what would be the normalized name
			name = npmUtils.moduleName.parse(depLoad.name, packageName)
				.modulePath;

			// If this is the package's main like `lodash/main` use `lodash`
			// instead.
			var pkg = loader.npm[packageName] || defaultPackage;
			if(name === npmUtils.pkg.main(pkg)) {
				res = packageName;
			} else {
				res = packageName + "/" + name;
			}

			return res;
		};

	},
	ignore: function(){
		return false;
	}
};

module.exports = baseHelper.makeHelper(bundledES);
