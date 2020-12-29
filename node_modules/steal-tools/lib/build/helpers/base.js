var path = require("path");
var supportedBuildTypes = ["js","css"];
var npmUtils = require("steal/ext/npm-utils");

var extend = function(d, s){
	for(var prop in s){
		d[prop] = s[prop];
	}
	return d;
};
var baseHelper = {
	parseModuleName: function(moduleName, currentPackageName) {
		var pluginParts = moduleName.split('!');
		var modulePathParts = pluginParts[0].split("#");
		var versionParts = modulePathParts[0].split("@");
		// it could be something like `@empty`
		if(!modulePathParts[1] && !versionParts[0]) {
			versionParts = ["@"+versionParts[0]];
		}
		var packageName, 
			modulePath;
		
		// if relative, use currentPackageName
		if( currentPackageName && moduleName[0] === "." ) {
			packageName= currentPackageName;
			modulePath = versionParts[0];
		} else {
			
			if(modulePathParts[1]) { // foo@1.2#./path
				packageName = versionParts[0];
				modulePath = modulePathParts[1];
			} else {
				// test/abc
				var folderParts = versionParts[0].split("/");
				packageName = folderParts.shift();
				modulePath = folderParts.join("/");
			}
			
		}
		
		return {
			plugin: pluginParts.length === 2 ? "!"+pluginParts[1] : undefined,
			version: versionParts[1],
			modulePath: modulePath,
			packageName: packageName,
			moduleName: moduleName
		};
	},
	makeHelper: function(settings){
		var func = function(options){
			options = extend({}, options || {});
			for(var prop in settings) {
				options[prop] = settings[prop](options[prop]);
			}
			return options;
		};
		extend(func, settings);
		return func;
	},
	extend: extend,
	cleanModuleName: function(moduleName){
		return moduleName.replace(/!.*$/,"");
	},
	basename: function(depLoad){
	
		var buildType = depLoad.metadata.buildType || "js";
		
		if( supportedBuildTypes.indexOf(buildType) >= 0 ) {
			// this will end in .js ... use the address
			var base = path.basename(depLoad.address),
				ext = path.extname(base);

			// might want to change to tabs.less.css
			return base+("."+buildType === ext ? "" : "."+buildType);
		} else {
			throw ("unsupported build type "+buildType);
		}
	},
	removeFileProtocol: function(path){
		if(path.indexOf("file:") ===0 ){
			return path.substr(5);
		}
		return path;
	},
	makeDest: function(distFolder) {
		return function(aliases, distPath) {
			aliases = aliases || {};

			if (typeof aliases === "string") {
				distPath = aliases;
				aliases = {};
			}

			if (typeof aliases === "function") {
				return aliases;
			}
			else {
				return function(moduleName, moduleData, load, System){
					var baseRoot = distPath || path.join( baseHelper.removeFileProtocol(System.baseURL), distFolder);

					if(aliases[moduleName]) {
						return path.join(baseRoot, aliases[moduleName]);
					}

					if(npmUtils.moduleName.isNpm(moduleName)) {
						moduleName = npmUtils.moduleName.parse(moduleName).modulePath;
					}

					// move it to lib/cjs and rename it
					var address = path.dirname(baseHelper.cleanModuleName(moduleName));
					var basename = baseHelper.basename(load);

					return path.join(baseRoot, address, basename);
				};
			}
		};
	},
	normalizeEndingSlash: function(moduleName) {
		if(moduleName.lastIndexOf("/") === moduleName.length - 1) {
			var parts = moduleName.split("/");
			parts[parts.length-1] = parts[parts.length-2];
			return parts.join("/");
		}
		return moduleName;
	}
};
module.exports = baseHelper;
