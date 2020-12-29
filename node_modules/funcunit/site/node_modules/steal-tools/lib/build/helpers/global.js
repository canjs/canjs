var cjs = require("./cjs");
var baseHelper = require("./base");
var fs = require("fs");
var path = require("path");
var npmUtils = require("steal/ext/npm-utils");

// https://github.com/bitovi/documentjs/issues/103
/**
 * @module {function} steal-tools/lib/build/helpers/global global
 * @parent steal-tools.helpers
 *
 * Helpers that make exporting to [syntax.global] formats easier.
 *
 * @signature `"+global-js": { ... OVERWRITES ... }`
 *
 * Exports all JS into a single file.
 *
 * @signature `"+global-css": { ... OVERWRITES ... }`
 *
 * Exports all CSS into a single file.
 *
 * @body
 *
 * ## Use
 *
 * Add in `+global-js` and `+global-css` in an output name to build
 * a single file with all of the module and its dependencies JS and CSS
 * that is not in _node_modules_.
 *
 * ```
 * stealTools.export({
 *   system: {
 *     main: "my-module",
 *     config: __dirname+"/package.json!npm"
 *   },
 *   outputs: {
 *     "+global-js": {},
 *     "+global-css": {}
 *   }
 * });
 * ```
 */
var make = function(buildType){
	return {
		modules: cjs.graphs,
		format: function(){
			return "global";
		},
		/**
		 * @function dest
		 *
		 * By default, writes  out every module in `[baseURL]/dist/global`.  And adds a ".js" or ".css" to
		 * files not ending with ".js" or ".css".
		 *
		 * @param {String} [path] If provided, changes the location where files are written out.
		 */
		dest: function(loc){
			return function(moduleName, moduleData, load, System){
				if(loc) {
					if(typeof loc === "function") {
						return loc(moduleName, moduleData, load, System);
					}

					return loc;
				} else {
					var baseRoot = baseHelper.removeFileProtocol(System.baseURL);
					var name;
					try {
						var pkg = JSON.parse( fs.readFileSync( path.join( baseRoot, "package.json" ) ) );
						name = pkg.name;
					} catch(e) {
						name = path.basename(baseRoot);
					}
					return path.join(baseRoot,"dist/global",name+"."+buildType);
				}
			};
		},
		ignore: function(items){
			var cssIgnore = [function(name, load){
				var bt = load.metadata.buildType || "js";
				return bt !== buildType;
			}];

			// Support ignore: false for globals
			return items === false ? cssIgnore : cjs.ignore(items).concat(cssIgnore);
		},
		useNormalizedDependencies: function(){
			return false;
		},
		normalize: function(){
			return function(depName, depLoad, curName, curLoad, loader, isDefining){
				if(!depLoad) {
					return depName;
				}

				if(!isDefining && depLoad.address.indexOf("node_modules") >=0) {
					return baseHelper.normalizeEndingSlash(depName);
				} else {
					var isNpmName = npmUtils.moduleName.isNpm(depName);
					var defaultPackage = npmUtils.pkg.getDefault(loader);
					var packageName = isNpmName ?
						npmUtils.moduleName.parse(depName).packageName :
						npmUtils.pkg.name(defaultPackage);
					// convert this to what would be the normalized name
					var pkg = loader.npm[packageName] || defaultPackage;
					var res;
					var name;
					if( npmUtils.moduleName.isNpm(depLoad.name) ) {
						name = npmUtils.moduleName.parse(depLoad.name, packageName ).modulePath;
					} else {
						name = depLoad.name;
					}

					if( name === npmUtils.pkg.main(pkg) ) {
						res = packageName;
					} else {
						res = packageName+"/"+name;
					}

					return res;
				}
			};
		}
	};
};

var css = make("css");
css.noGlobalShim = function(value){
	return value || true;
};

module.exports = {
	js: baseHelper.makeHelper(make("js")),
	css: baseHelper.makeHelper(css)
};




