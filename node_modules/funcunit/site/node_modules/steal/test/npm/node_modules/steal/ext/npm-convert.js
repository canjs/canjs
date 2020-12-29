"format cjs";

var crawl = require('./npm-crawl');
var utils = require("./npm-utils");

exports.system = convertSystem;
exports.propertyNames = convertPropertyNames;
exports.propertyNamesAndValues = convertPropertyNamesAndValues;
exports.name = convertName;
exports.browser = convertBrowser;
exports.browserProperty = convertBrowserProperty;
exports.jspm = convertJspm;
exports.toPackage = convertToPackage;
exports.forPackage = convertForPackage;

/*
{
  "system": {
    "map": {
      "package": {
        "another": "one-more"
	  }
	},
	"meta": {
      "package": {
        "deps": [
          "jquery"
		]
	  }
	}
  }
}
*/

// Translate helpers ===============
// Given all the package.json data, these helpers help convert it to a source.
function convertSystem(context, pkg, system, root, ignoreWaiting) {
	if(!system) {
		return system;
	}
	var copy = utils.extend({}, system, true);
	var waiting = utils.isArray(ignoreWaiting) ? ignoreWaiting : [];
	if(system.meta) {
		system.meta = convertPropertyNames(context, pkg, system.meta, root, waiting);
	}
	if(system.map) {
		system.map = convertPropertyNamesAndValues(context, pkg, system.map, root, waiting);
	}
	if(system.paths) {
		system.paths = convertPropertyNames(context, pkg, system.paths, root, waiting);
	}
	// needed for builds
	if(system.buildConfig) {
		system.buildConfig = convertSystem(context, pkg, system.buildConfig, root, waiting);
	}

	// Push the waiting conversions down.
	if(ignoreWaiting !== true && waiting.length) {
		convertLater(context, waiting, function(){
			var context = this;
			var local = utils.extend({}, copy, true);
			var config = convertSystem(context, pkg, local, root, true);

			// If we are building we need to resave the package's system
			// configuration so that it will be written out into the build.
			if(context.resavePackageInfo) {
				var info = utils.pkg.findPackageInfo(context, pkg);
				info.system = config;
			}

			// Temporarily remove system.main so that it doesn't set System.main
			var systemMain = config.main;
			delete config.main;
			delete config.transpiler;
			context.loader.config(config);
			config.main = systemMain;
		});
	}

	return system;
}

// converts only the property name
function convertPropertyNames (context, pkg, map , root, waiting) {
	if(!map) {
		return map;
	}
	var clone = {}, value;
	for(var property in map ) {
		value = convertName(context, pkg, map, root, property, waiting);
		if(typeof value === 'string') {
			clone[value] = map[property];
		}

		// do root paths b/c we don't know if they are going to be included with the package name or not.
		if(root) {
			value = convertName(context, pkg, map, false, property, waiting);
			if(typeof value === 'string') {
				clone[value] = map[property];
			}
		}
	}
	return clone;
}

// converts both property name and value
function convertPropertyNamesAndValues (context, pkg, map, root, waiting) {
	if(!map) {
		return map;
	}
	var clone = {}, val, name;
	for(var property in map ) {
		val = map[property];
		name = convertName(context, pkg, map, root, property, waiting); 
		val = typeof val === "object"
			? convertPropertyNamesAndValues(context, pkg, val, root, waiting)
			: convertName(context, pkg, map, root, val, waiting);
		if(typeof name !== 'undefined' && typeof val !== 'undefined') {
			clone[name] = val;
		}
	}
	return clone;
}

function convertName (context, pkg, map, root, name, waiting) {
	var parsed = utils.moduleName.parse(name, pkg.name),
		depPkg, requestedVersion;
	if( name.indexOf("#") >= 0 ) {
		// If this is a fully converted name just return the name.
		if(utils.moduleName.isFullyConvertedNpm(parsed)) {
			return name;
		}

		if(parsed.packageName === pkg.name) {
			parsed.version = pkg.version;
		} else {
			// Get the requested version's actual version.
			requestedVersion = crawl.getDependencyMap(context.loader, pkg, root)[parsed.packageName].version;
			depPkg = crawl.matchedVersion(context, parsed.packageName, requestedVersion);
			// This hasn't been crawled yet, so convert later
			if(!depPkg) {
				waiting.push({
					packageName: parsed.packageName,
					requestedVersion: requestedVersion
				});
				return;
			}
			parsed.version = depPkg.version;
		}
		return utils.moduleName.create(parsed);

	} else {
		if(root && name.substr(0,2) === "./" ) {
			return name.substr(2);
		} else {
			// this is for a module within the package
			if (name.substr(0,2) === "./" ) {
				return utils.moduleName.create({
					packageName: pkg.name,
					modulePath: name,
					version: pkg.version,
					plugin: parsed.plugin
				});
			} else {
				// TODO: share code better!
				// SYSTEM.NAME
				if(  pkg.name === parsed.packageName || ( (pkg.system && pkg.system.name) === parsed.packageName) ) {
					depPkg = pkg;
				} else {
					var requestedProject = crawl.getDependencyMap(context.loader, pkg, root)[parsed.packageName];
					if(!requestedProject) {
						if(root) warn(name);
						return name;
					}
					requestedVersion = requestedProject.version;
					depPkg = crawl.matchedVersion(context, parsed.packageName, requestedVersion);
					// If we still didn't find one just use the first available version.
					if(!depPkg) {
						var versions = context.versions[parsed.packageName];
						depPkg = versions && versions[requestedVersion];

						if(!depPkg) {
							waiting.push({
								packageName: parsed.packageName,
								requestedVersion: requestedVersion
							});
							return;
						}
					}
				}
				// SYSTEM.NAME
				if(depPkg.system && depPkg.system.name) {
					parsed.packageName = depPkg.system.name;
				}

				parsed.version = depPkg.version;
				if(!parsed.modulePath) {
					parsed.modulePath = utils.pkg.main(depPkg);
				}
				return utils.moduleName.create(parsed);
			}

		}

	}
}


/**
 * Converts browser names into actual module names.
 *
 * Example:
 *
 * ```
 * {
 * 	 "foo": "browser-foo"
 *   "traceur#src/node/traceur": "./browser/traceur"
 *   "./foo" : "./foo-browser"
 * }
 * ```
 *
 * converted to:
 *
 * ```
 * {
 * 	 // any foo ... regardless of where
 *   "foo": "browser-foo"
 *   // this module ... ideally minus version
 *   "traceur#src/node/traceur": "transpile#./browser/traceur"
 *   "transpile#./foo" : "transpile#./foo-browser"
 * }
 * ```
 */
function convertBrowser(pkg, browser) {
	if(typeof browser === "string") {
		return browser;
	}
	var map = {};
	for(var fromName in browser) {
		convertBrowserProperty(map, pkg, fromName, browser[fromName]);
	}
	return map;
}


function convertBrowserProperty(map, pkg, fromName, toName) {
	var packageName = pkg.name;

	var fromParsed = utils.moduleName.parse(fromName, packageName);
	var toResult = toName;

	if(!toName || typeof toName === "string") {
		var toParsed = toName ? utils.moduleName.parse(toName, packageName)
			: "@empty";
		toResult = utils.moduleName.create(toParsed);
	} else if(utils.isArray(toName)) {
		toResult = toName;
	}
	
	map[utils.moduleName.create(fromParsed)] = toResult;
}

function convertJspm(pkg, jspm){
	var type = typeof jspm;
	if(type === "undefined" || type === "string") {
		return jspm;
	}
	return {
		main: jspm.main
	};
}


function convertToPackage(context, pkg, index) {
	var packages = context.pkgInfo;
	var nameAndVersion = pkg.name+"@"+pkg.version;
	var localPkg;
	if(!packages[nameAndVersion]) {
		if(pkg.browser){
			delete pkg.browser.transform;
		}
		localPkg = {
			name: pkg.name,
			version: pkg.version,
			fileUrl: utils.path.isRelative(pkg.fileUrl) ?
				pkg.fileUrl :
				utils.relativeURI(context.loader.baseURL, pkg.fileUrl),
			main: pkg.main,
			system: convertSystem(context, pkg, pkg.system, index === 0),
			globalBrowser: convertBrowser(pkg, pkg.globalBrowser),
			browser: convertBrowser(pkg, pkg.browser || pkg.browserify),
			jspm: convertJspm(pkg, pkg.jspm),
			jam: convertJspm(pkg, pkg.jam),
			resolutions: {}
		};
		packages.push(localPkg);
		packages[nameAndVersion] = true;
	} else {
		localPkg = utils.filter(packages, function(lpkg){
			if(pkg.name === lpkg.name && pkg.version === lpkg.version) {
				return lpkg;
			}
		})[0];
	}
	return localPkg;
}

/**
 * waiting looks like:
 *
 * [
 *   { packageName: 'can', requestedVersion: '^2.3.0' },
 *   { packageName: 'lodash': 'requestedVersion': '~3.0.0' }
 * ]
 *
 * Pushes these objects into a side table. Whenver a package.json is loaded
 * it will convert and apply config.
 */
function convertLater(context, waiting, fn) {
	utils.forEach(waiting, function(p){
		var packageName = p.packageName;
		var requestedVersion = p.requestedVersion;

		var conv = context.deferredConversions;
		var pkg = conv[packageName];
		if(!pkg) pkg = conv[packageName] = {};
		var vers = pkg[requestedVersion];
		if(!vers) vers = pkg[requestedVersion] = [];
		vers.push(fn);
	});
}

/**
 * When progressively loading package.jsons we need to convert any config
 * that is waiting on a package.json to load. This function is called after
 * a package is loaded and will call all of the callbacks that cause the 
 * config to be applied.
 */
function convertForPackage(context, pkg) {
	var name = pkg.name;
	var version = pkg.version;

	var conv = context.deferredConversions;
	var pkgConv = conv[name];
	var depPkg, fns, keys = 0;
	if(pkgConv) {
		for(var range in pkgConv) {
			depPkg = crawl.matchedVersion(context, name, range);
			if(depPkg) {
				fns = pkgConv[range];
				for(var i = 0, len = fns.length; i < len; i++) {
					fns[i].call(context);
				}
				delete pkgConv[range];
			} else {
				keys++;
			}
		}
		if(keys === 0) {
			delete conv[name];
		}
	}
}

var warn = (function(){
	var warned = {};
	return function(name){
		if(!warned[name]) {
			warned[name] = true;
			var warning = "WARN: Could not find " + name + " in node_modules. Ignoring.";
			if(typeof steal !== "undefined" && steal.dev && steal.dev.warn) steal.dev.warn(warning)
			else if(console.warn) console.warn(warning);
			else console.log(warning);
		}
	};
})();
