"format cjs";

var convert = require("./npm-convert");
var utils = require("./npm-utils");

/**
 * @function saveLoad
 * @param {Context} context
 *
 * Creates the `package.json!npm` load's source and saves it in the load cache.
 */
exports.saveLoad = function(context){
	var loader = context.loader;
	if(loader.getModuleLoad) {
		var load = loader.getModuleLoad("package.json!npm");
		var source = exports.makeSource(context);
		load.source = source;
	}
};

exports.saveLoadIfNeeded = function(context){
	// Only do the actual saving in the build
	if(context.resavePackageInfo) {
		exports.saveLoad(context);

		var localLoader = context.loader.localLoader;
		if(localLoader) {
			exports.saveLoad(localLoader.npmContext);
		}
	}
};

/**
 * @function makeSource
 * @param {Context} context
 * @param {Package} pkg The root package.json
 * @return {String} The source representation of the `package.json!npm` module.
 */
exports.makeSource = function(context, npmPkg){
	var pkg = npmPkg || utils.pkg.getDefault(context.loader);
	var configDependencies = ["@loader","npm-extension","module"].concat(
		exports.configDeps(context, pkg)
	);
	var pkgMain = exports.pkgMain(context, pkg);
	var options = exports.options(context);

	return "def" + "ine(" + JSON.stringify(configDependencies) +
		", function(loader, npmExtension, module){\n" +
		"npmExtension.addExtension(loader);\n"+
		(pkgMain ? "if(!loader.main){ loader.main = " +
		 JSON.stringify(pkgMain) + "; }\n" : "") +
		"loader._npmExtensions = [].slice.call(arguments, 2);\n" +
		"("+ translateConfig.toString() + ")(loader, " +
		JSON.stringify(context.pkgInfo, null, " ") + ", " +
		JSON.stringify(options, null, " ") + ");\n" +
	"});";
};

/**
 * @function saveLoad
 * @param {Context} context
 * @param {Package} pkg The root package.json
 * @return {Array<String>} An array of configDependencies
 */
exports.configDeps = function(context, pkg){
	var deps = [];
	var config = utils.pkg.config(pkg);
	if(config && config.configDependencies) {
		deps = deps.concat(config.configDependencies);
	}
	if(context.loader.configDependencies) {
		deps = deps.concat(context.loader.configDependencies);
	}
	return deps;
};

/**
 * @function pkgMain
 * @param {Context} context
 * @param {Package} pkg The root package.json
 * @return {String} The main module for the app
 */
exports.pkgMain = function(context, pkg){
	var pkgMain = utils.pkg.main(pkg);
	// Convert the main
	var mainHasPkg = pkgMain.indexOf(pkg.name) === 0;
	if(mainHasPkg) {
		pkgMain = convert.name(context, pkg, false, true, pkgMain);
	} else {
		pkgMain = convert.name(context, pkg, false, true, pkg.name+"/"+pkgMain);
	}
	return pkgMain;
};

/**
 * @function options
 * @param {Context} context
 * @return {Object} Options passed into the translated config.
 */
exports.options = function(context){
	return {
		npmParentMap: context.loader.npmParentMap
	};
};

var translateConfig = function(loader, packages, options){
	var g = loader.global;
	if(!g.process) {
		g.process = {
			argv: [],
			cwd: function(){
				var baseURL = loader.baseURL;
				return baseURL;
			},
			browser: true,
			env: {
				NODE_ENV: loader.env
			},
			version: '',
			platform: (navigator && navigator.userAgent && /Windows/.test(navigator.userAgent)) ? "win" : ""
		};
	}

	if(!loader.npm) {
		loader.npm = {};
		loader.npmPaths = {};
		loader.globalBrowser = {};
	}
	if(!loader.npmParentMap) {
		loader.npmParentMap = options.npmParentMap || {};
	}
	var rootPkg = loader.npmPaths.__default = packages[0];
	var rootConfig = rootPkg.steal || rootPkg.system;
	var lib = rootConfig && rootConfig.directories && rootConfig.directories.lib;

	var setGlobalBrowser = function(globals, pkg){
		for(var name in globals) {
			loader.globalBrowser[name] = {
				pkg: pkg,
				moduleName: globals[name]
			};
		}
	};
	var setInNpm = function(name, pkg){
		if(!loader.npm[name]) {
			loader.npm[name] = pkg;
		}
		loader.npm[name+"@"+pkg.version] = pkg;
	};
	var forEach = function(arr, fn){
		var i = 0, len = arr.length;
		for(; i < len; i++) {
			res = fn.call(arr, arr[i], i);
			if(res === false) break;
		}
	};
	var setupLiveReload = function(){
		if(loader.liveReloadInstalled) {
			loader["import"]("live-reload", { name: module.id })
			.then(function(reload){
				reload.dispose(function(){
					var pkgInfo = loader.npmContext.pkgInfo;
					delete pkgInfo[rootPkg.name+"@"+rootPkg.version];
					var idx = -1;
					forEach(pkgInfo, function(pkg, i){
						if(pkg.name === rootPkg.name &&
							pkg.version === rootPkg.version) {
							idx = i;
							return false;
						}
					});
					pkgInfo.splice(idx, 1);
				});
			});
		}
	};

	var ignoredConfig = ["bundle", "configDependencies", "transpiler", "treeShaking"];
	packages.reverse();
	forEach(packages, function(pkg){
		var steal = pkg.steal || pkg.system;
		if(steal) {
			// don't set steal.main
			var main = steal.main;
			delete steal.main;
			var configDeps = steal.configDependencies;
			if(pkg !== rootPkg) {
				forEach(ignoredConfig, function(name){
					delete steal[name];
				});
			}

			loader.config(steal);
			if(pkg === rootPkg) {
				steal.configDependencies = configDeps;
			}
			steal.main = main;
		}
		if(pkg.globalBrowser) {
			var doNotApplyGlobalBrowser = pkg.name === "steal" &&
				rootConfig.builtins === false;
			if(!doNotApplyGlobalBrowser) {
				setGlobalBrowser(pkg.globalBrowser, pkg);
			}
		}
		var systemName = steal && steal.name;
		if(systemName) {
			setInNpm(systemName, pkg);
		} else {
			setInNpm(pkg.name, pkg);
		}
		if(!loader.npm[pkg.name]) {
			loader.npm[pkg.name] = pkg;
		}
		loader.npm[pkg.name + "@" + pkg.version] = pkg;
		var pkgAddress = pkg.fileUrl.replace(/\/package\.json.*/, "");
		loader.npmPaths[pkgAddress] = pkg;
	});
	setupLiveReload();
	forEach(loader._npmExtensions || [], function(ext){
		// If there is a systemConfig use that as configuration
		if(ext.systemConfig) {
			loader.config(ext.systemConfig);
		}
	});
};

/**
 * @function addExistingPackages
 * @param {Context} context
 */
exports.addExistingPackages = function(context, existingPackages){
	if(existingPackages) {
		var packages = context.pkgInfo;
		utils.forEach(existingPackages, function(pkg){
			var nameAndVersion = pkg.name + "@" + pkg.version;
			if(!packages[nameAndVersion]) {
				packages.push(pkg);
				packages[nameAndVersion] = true;
			} else {
				var curPkg = utils.filter(packages, function(p){
					return p.name === pkg.name && p.version === pkg.version;
				})[0];
				if(!curPkg) return;
				deeplyExtendPkg(curPkg, pkg);
			}
		});
	}
};

// Deeply extend the configuration that needs to be kept from
// a previous bundle that runs through the build process.
// This makes sure that if we load different configuration for different
// bundles, all of it is retained for use in production.
function deeplyExtendPkg(a, b) {
	if(!a.resolutions) {
		a.resolutions = {};
	}
	utils.extend(a.resolutions, b.resolutions || {});

	if(!a.steal) {
		a.steal = {};
	}
	if(!b.steal) {
		b.steal = {};
	}

	utils.extend(a.steal, b.steal, true);
}
