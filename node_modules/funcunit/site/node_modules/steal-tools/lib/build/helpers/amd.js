var cjs = require("./cjs");
var baseHelper = require("./base");
var path = require("path");

var cjsCopy = baseHelper.extend({}, cjs);

var pseudoModules = {
	require: true,
	exports: true,
	module: true
};

/**
 * @module {function} steal-tools/lib/build/helpers/amd amd
 * @parent steal-tools.helpers
 * 
 * Helpers that make exporting to AMD projects easier.
 * 
 * @signature `"+amd": { ... OVERWRITES ... }`
 * 
 * Adds [steal-tools.export.output] values that write a project out to an AMD format.
 * 
 * @body
 * 
 * ## Use
 * 
 * Add `+amd` in an output name.
 * 
 * ```
 * stealTools.export({
 *   system: {
 *     main: "my-module",
 *     config: __dirname+"/package.json!npm"
 *   },
 *   outputs: {
 *     "+amd": {
 *       normalize: { "lodash": "underscore" }  
 *     }
 *   }
 * });
 * ```
 * 
 *`+amd` mixes in the following default values:
 * 
 * - [steal-tools/lib/build/helpers/cjs.graphs graphs] - Writes out System.main and all of its dependencies.
 * - [steal-tools/lib/build/helpers/amd.format format] - Writes out all modules as CJS.
 * - [steal-tools/lib/build/helpers/amd.normalize normalize] - Leaves moduleName references that reference modules in node_modules alone; makes
 *   all other moduleName references relative.
 * - [steal-tools/lib/build/helpers/amd.dest dest] - Writes out each module in `[baseURL]/dist/amd`.
 * - [steal-tools/lib/build/helpers/cjs.ignore ignore] - Ignores everything in node_modules.
 * 
 * Some of the behavior is inherit from the [steal-tools/lib/build/helpers/cjs] export helper.
 * 
 */


module.exports = (baseHelper.makeHelper(baseHelper.extend(cjsCopy, {
	
	// graphs the same
	/**
	 * @function
	 * 
	 * Returns "amd".
	 */
	format: function(){
		return "amd";
	},
	
	// useNormalizedDependencies the same
	
	// very much like CJS's but:
	// - puts a css! for css build types
	// - remove .js for js resources 
	/**
	 * @function
	 * 
	 * Normalizes to the AMD format.
	 * 
	 * @param {Object} [aliases] An object of aliases that will be used
	 * to normalize module names.
	 * 
	 * @body
	 * 
	 * ## Use
	 * 
	 * By default, removes `.js` for js resources and prepends `css!` 
	 * for css resources. It also removes the last part of "repeat" modules. 
	 * For example `"mods/module1/module1"` becomes `"mods/module1"`.
	 *  
	 * 
	 */
	normalize: function(aliases){
		aliases = aliases || {};
		return function(depName, depLoad, curName, curLoad){
			// If this is a special module like require or exports, doesn't
			// need the normalization.
			if(pseudoModules[depName] && !depLoad) {
				return depName;
			}
			if(aliases[depName]) {
				return aliases[depName];
			}
			// if both not in node_modules
			if(depLoad.address.indexOf("node_modules") === -1 && curLoad.address.indexOf("node_modules") === -1) {
				// provide its name relative
				depName = path.relative(path.dirname(curLoad.address), depLoad.address);
				if(depName[0] !== ".") {
					depName = "./"+depName;
				}
			}
			
			// if it ends in /
			var parts = depName.split("/"),
				last = parts[parts.length - 1];
				
			if(parts.length > 2 && (!last || last === parts[parts.length - 2]) ) {
				parts.pop();
				depName = parts.join("/");
			}
			
			// if the path is already relative ... good ... keep it that way
			if(depName[0] === ".") {
				depName = path.dirname(depName)+"/"+baseHelper.basename(depLoad);
			} 
			// if two relative paths that are not in node_modules
			
			var result = depName;
			
			
			var buildType = depLoad.metadata.buildType || "js";
			if(buildType === "css") {
				return buildType+"!"+result;
			}
			if(path.extname(result) === ".js") {
				return result.substr(0, result.length-3);
			}
			
			return result;
		};
	},
	// similar put defaults to putting things in dist/amd
	/**
	 * @function dest
	 * 
	 * By default, writes  out every module in `[baseURL]/dist/amd`.  And adds a ".js" or ".css" to
	 * files not ending with ".js" or ".css".
	 * 
	 * @param {String} [path] If provided, changes the location where files are written out. 
	 */
	dest: baseHelper.makeDest("dist/amd")
	
	// ignore the same
})));




