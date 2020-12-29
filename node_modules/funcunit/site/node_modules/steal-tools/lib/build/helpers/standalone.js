var baseHelper = require("./base");
var globalJS = require("./global").js;
var npmUtils = require("steal/ext/npm-utils");

/**
 * @module {function} steal-tools/lib/build/helpers/standalone standalone
 * @parent steal-tools.helpers
 *
 * Helper that make exporting to [syntax.global] formats easier.
 *
 * @signature `"+standalone": { ... OVERRIDES ... }`
 *
 * Exports all Javascript into a single file, including all dependencies.
 *
 * @body
 *
 * ## Use
 *
 * Add in `+standalone` in an output name to export your project to a single
 * file which will include NPM dependencies. This is the option you most often
 * want when creating a build meant to be used in a script tag or jsbin, etc.
  *
 * ```
 * stealTools.export({
 *   system: {
 *     config: __dirname+"/package.json!npm"
 *   },
 *   outputs: {
 *	   "+standalone": {
 *       dest: __dirname + "/mylib.js"
 *	   }
 *   }
 * });
 * ```
 */
var standalone = {
	modules: globalJS.modules,
	format: function(){
		return "global";
	},
	dest: globalJS.dest,
	useNormalizedDependencies: globalJS.useNormalizedDependencies,
	//normalize: globalJS.normalize,
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

module.exports = baseHelper.makeHelper(standalone);
