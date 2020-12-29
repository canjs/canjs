var path = require('path'),
	baseHelper = require('./base');

// TODO: this should be loaded from steal:



/**
 * @module {function} steal-tools/lib/build/helpers/cjs cjs
 * @parent steal-tools.helpers
 *
 * Helpers that make exporting to CJS projects easier.
 *
 * @signature `"+cjs": { ... OVERWRITES ... }`
 *
 * Adds helpers that export modules to a CJS format.
 *
 * @body
 *
 * ## Use
 *
 * Adding "+cjs" to a [steal-tools.export.output] name will mixin
 * default [steal-tools.export.output] and [steal-tools.transform.options]
 * values that export modules to a CommonJS format.
 *
 * ```
 * outputs: {
 *   "+cjs": {},
 *   "minified+cjs": {
 *     minify: true
 *   }
 * }
 * ```
 *
 * This mixes in the following default values:
 *
 * - [steal-tools/lib/build/helpers/cjs.graphs graphs] - Writes out System.main and all of its dependencies.
 * - [steal-tools/lib/build/helpers/cjs.format format] - Writes out all modules as CJS.
 * - [steal-tools/lib/build/helpers/cjs.normalize normalize] - Leaves moduleName references that reference modules in node_modules alone; makes
 *   all other moduleName references relative.
 * - [steal-tools/lib/build/helpers/cjs.dest dest] - Writes out each module in `[baseURL]/dist/cjs`.
 * - [steal-tools/lib/build/helpers/cjs.ignore ignore] - Ignores everything in node_modules.
 *
 * You can overwrite or alter the behavior of these default values by adding a value in
 * the [steal-tools.export.output].
 * The following writes out dest in a different location:
 *
 * ```
 * outputs: {
 *   "+cjs": {
 * 	   dest: __dirname+"/cjs"
 *   }
 * }
 * ```
 *
 * The behavior for overwriting [steal-tools.export.output] values is
 * documented in the default value API pages.
 *
 */
module.exports = baseHelper.makeHelper({
	/**
	 * @function
	 *
	 * By default, writes out System.main and all of its dependencies. Defaults to "graphs"
	 * default behavior if anything else is provided.
	 *
	 * @param {function|Array<moduleName>} [modules] An array of modules to overide the main file.
	 */
	graphs: function(modules){
		return function(System){
			if(!Array.isArray(modules)) {
				return [System.main];
			} else if(typeof modules === "function") {
				return modules.apply(this, arguments);
			} else {
				return modules;
			}
		};
	},
	/**
	 * @function
	 *
	 * Returns "cjs".
	 */
	format: function(){
		return "cjs";
	},
	useNormalizedDependencies: function(){
		return false;
	},
	/**
	 * @function
	 *
	 * By default, makes everything not in node_modules relative. It also
	 * adds a ".js" or ".css" to files not ending with ".js" or ".css". If a function is provided,
	 * it will overwrite this behavior.
	 *
	 */
	normalize: function(aliases){
		if(typeof aliases === "function") {
			return aliases;
		}

		aliases = aliases || {};

		return function(depName, depLoad, curName, curLoad, loader){
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
			if(depName[depName.length -1] === "/") {
				var parts = depName.split("/");
				parts[parts.length -1] = parts[parts.length -2];
				depName = parts.join("/");
			}

			// if the path is already relative ... good ... keep it that way
			if(depName[0] === ".") {
				depName = path.dirname(depName)+"/"+baseHelper.basename(depLoad);
			} else if(depLoad.address.indexOf("node_modules") !== -1){
				// this means its something like can/foo
				// make sure we are referencing the package name
				var parsed = baseHelper.parseModuleName(depLoad.name);
				if(!parsed.packageName || !parsed.version) {
					return depName;
				}
				// SYSTEM.NAME
				var pkg = loader.npm[parsed.packageName+"@"+parsed.version];
				var systemName = pkg.system && pkg.system.name;
				if(systemName && depName.indexOf(systemName) === 0) {
					depName = depName.replace(systemName, pkg.name);
				}
			}
			// if two relative paths that are not in node_modules

			return depName;
		};

	},
	/**
	 * @function dest
	 *
	 * By default, writes  out every module in `[baseURL]/dist/cjs`.  And adds a ".js" or ".css" to
	 * files not ending with ".js" or ".css".
	 *
	 * @param {String} [path] If provided, changes the location where files are written out.
	 */
	dest: baseHelper.makeDest("dist/cjs"),
	/**
	 * @function
	 *
	 * Ignores everything in _node_modules_.
	 *
	 * @param {*} additional "ignores" that should be added.
	 */
	ignore: function(additional){
		return [function(name, load){
			if(load.address.indexOf("node_modules") >= 0 || load.metadata.format === "defined") {
				return true;
			}
		}].concat(additional || []);
	}
});
