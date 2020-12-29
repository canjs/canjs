/**
 * @module system-npm/utils
 *
 * Helpers that are used by npm-extension and the npm plugin.
 * This should be kept small and not have helpers exclusive to npm.
 * However, it can have all npm-extension helpers.
 */

// A regex to test if a moduleName is npm-like.
var slice = Array.prototype.slice;
var npmModuleRegEx = /.+@.+\..+\..+#.+/;
var conditionalModuleRegEx = /#\{[^\}]+\}|#\?.+$/;
var gitUrlEx = /(git|http(s?)):\/\//;
var supportsSet = typeof Set === "function";

var utils = {
	extend: function(d, s, deep, existingSet){
		var val;
		var set = existingSet;

		if(deep) {
			if(!set) {
				if(supportsSet) {
					set = new Set();
				} else {
					set = [];
				}
			}

			if(supportsSet) {
				if(set.has(s)) {
					return s;
				} else {
					set.add(s);
				}
			} else {
				if(set.indexOf(s) !== -1) {
					return s;
				} else {
					set.push(s);
				}
			}
		}

		for(var prop in s) {
			val = s[prop];

			if(deep) {
				if(utils.isArray(val)) {
					d[prop] = slice.call(val);
				} else if(utils.isPlainObject(val)) {
					d[prop] = utils.extend({}, val, deep, set);
				} else {
					d[prop] = s[prop];
				}
			} else {
				d[prop] = s[prop];
			}
		}
		return d;
	},
	map: function(arr, fn){
		var i = 0, len = arr.length, out = [];
		for(; i < len; i++) {
			out.push(fn.call(arr, arr[i]));
		}
		return out;
	},
	filter: function(arr, fn){
		var i = 0, len = arr.length, out = [], res;
		for(; i < len; i++) {
			res = fn.call(arr, arr[i]);
			if(res) {
				out.push(arr[i]);
			}
		}
		return out;
	},
	forEach: function(arr, fn) {
		var i = 0, len = arr.length;
		for(; i < len; i++) {
			fn.call(arr, arr[i], i);
		}
	},
	isObject: function(obj){
		return typeof obj === "object";
	},
	isPlainObject: function(obj){
		// A plain object has a proto that is the Object
		return utils.isObject(obj) && (!obj || obj.__proto__ === Object.prototype);
	},
	isArray: Array.isArray || function(arr){
		return Object.prototype.toString.call(arr) === "[object Array]";
	},
	isEnv: function(name) {
		return this.isEnv ? this.isEnv(name) : this.env === name;
	},
	isGitUrl: function(str) {
		return gitUrlEx.test(str);
	},
	warnOnce: function(msg){
		var w = this._warnings = this._warnings || {};
		if(w[msg]) return;
		w[msg] = true;
		this.warn(msg);
	},
	warn: function(msg){
		if(typeof steal !== "undefined" && typeof console !== "undefined" && console.warn) {
			steal.done().then(function(){
				if(steal.dev && steal.dev.warn){
					steal.dev.warn(msg)
				} else if(console.warn) {
					console.warn("steal.js WARNING: "+msg);
				} else {
					console.log(msg);
				}
			});
		}
	},
	relativeURI: function(baseURL, url) {
		return typeof steal !== "undefined" ? steal.relativeURI(baseURL, url) : url;
	},
	moduleName: {
		/**
		 * @function moduleName.create
		 * Converts a parsed module name to a string
		 *
		 * @param {system-npm/parsed_npm} descriptor
		 */
		create: function (descriptor, standard) {
			if(standard) {
				return descriptor.moduleName;
			} else {
				if(descriptor === "@empty") {
					return descriptor;
				}
				var modulePath;
				if(descriptor.modulePath) {
					modulePath = descriptor.modulePath.substr(0,2) === "./" ? descriptor.modulePath.substr(2) : descriptor.modulePath;
				}
				return descriptor.packageName
					+ (descriptor.version ? '@' + descriptor.version : '')
					+ (modulePath ? '#' + modulePath : '')
					+ (descriptor.plugin ? descriptor.plugin : '');
			}
		},
		/**
		 * @function moduleName.isNpm
		 * Determines whether a moduleName is npm-like.
		 * @return {Boolean}
		 */
		isNpm: function(moduleName){
			return npmModuleRegEx.test(moduleName);
		},
		/**
		 * @function moduleName.isConditional
		 * Determines whether a moduleName includes a condition.
		 * @return {Boolean}
		 */
		isConditional: function(moduleName){
			return conditionalModuleRegEx.test(moduleName);
		},
		/**
		 * @function moduleName.isFullyConvertedModuleName
		 * Determines whether a moduleName is a fully npm name, not npm-like
		 * With a parsed module name we can make sure there is a package name,
		 * package version, and module path.
		 */
		isFullyConvertedNpm: function(parsedModuleName){
			return !!(parsedModuleName.packageName &&
					  parsedModuleName.version && parsedModuleName.modulePath);
		},
		/**
		 * @function moduleName.isScoped
		 * Determines whether a moduleName is from a scoped package.
		 * @return {Boolean}
		 */
		isScoped: function(moduleName){
			return moduleName[0] === "@";
		},
		/**
		 * @function moduleName.parse
		 * Breaks a string moduleName into parts.
		 * packageName@version!plugin#modulePath
		 * "./lib/bfs"
		 *
		 * @return {system-npm/parsed_npm}
		 */
		parse: function (moduleName, currentPackageName, global, context) {
			var pluginParts = moduleName.split('!');
			var modulePathParts = pluginParts[0].split("#");
			var versionParts = modulePathParts[0].split("@");
			// it could be something like `@empty`
			if(!modulePathParts[1] && !versionParts[0]) {
				versionParts = ["@"+versionParts[1]];
			}
			// it could be a scope package
			if(versionParts.length === 3 && utils.moduleName.isScoped(moduleName)) {
				versionParts.splice(0, 1);
				versionParts[0] = "@"+versionParts[0];
			}
			var packageName,
				modulePath;

			// if the module name is relative
			// use the currentPackageName
			if (currentPackageName && utils.path.isRelative(moduleName)) {
				packageName = currentPackageName;
				modulePath = versionParts[0];

				// if the module name starts with the ~ (tilde) operator
				// use the currentPackageName
			} else if (currentPackageName && utils.path.isInHomeDir(moduleName, context)) {
				packageName = currentPackageName;
				modulePath = versionParts[0].split("/").slice(1).join("/");

			} else {

				if(modulePathParts[1]) { // foo@1.2#./path
					packageName = versionParts[0];
					modulePath = modulePathParts[1];
				} else {
					// test/abc
					var folderParts = versionParts[0].split("/");
					// Detect scoped packages
					if(folderParts.length && folderParts[0][0] === "@") {
						packageName = folderParts.splice(0, 2).join("/");
					} else {
						packageName = folderParts.shift();
					}
					modulePath = folderParts.join("/");
				}

			}

			modulePath = utils.path.removeJS(modulePath);

			return {
				plugin: pluginParts.length === 2 ? "!"+pluginParts[1] : undefined,
				version: versionParts[1],
				modulePath: modulePath,
				packageName: packageName,
				moduleName: moduleName,
				isGlobal: global
			};
		},
		/**
		 * @function moduleName.parseFromPackage
		 *
		 * Given the package that loads the dependency, the dependency name,
		 * and the moduleName of what loaded the package, return
		 * a [system-npm/parsed_npm].
		 *
		 * @param {Loader} loader
		 * @param {NpmPackage} refPkg The package `name` is a dependency of.
		 * @param {moduleName} name
		 * @param {moduleName} parentName
		 * @return {system-npm/parsed_npm}
		 *
		 */
		parseFromPackage: function(loader, refPkg, name, parentName) {
			// Get the name of the
			var packageName = utils.pkg.name(refPkg),
			    parsedModuleName = utils.moduleName.parse(name, packageName, undefined, {loader: loader}),
				isRelative = utils.path.isRelative(parsedModuleName.modulePath);

			if(isRelative && !parentName) {
				throw new Error("Cannot resolve a relative module identifier " +
								"with no parent module:", name);
			}

			// If the module needs to be loaded relative.
			if(isRelative) {
				// get the location of the parent
				var parentParsed = utils.moduleName.parse(parentName, packageName);

				// If the parentModule and the currentModule are from the same parent
				if( parentParsed.packageName === parsedModuleName.packageName && parentParsed.modulePath ) {
					var makePathRelative = true;

					if(name === "../" || name === "./" || name === "..") {
						var relativePath = utils.path.relativeTo(
							parentParsed.modulePath, name);
						var isInRoot = utils.path.isPackageRootDir(relativePath);
						if(isInRoot) {
							parsedModuleName.modulePath = utils.pkg.main(refPkg);
							makePathRelative = false;
						} else {
							parsedModuleName.modulePath = name +
								(utils.path.endsWithSlash(name) ? "" : "/") +
								"index";
						}
					}

					if(makePathRelative) {
						// Make the path relative to the parentName's path.
						parsedModuleName.modulePath = utils.path.makeRelative(
							utils.path.joinURIs(parentParsed.modulePath,
												parsedModuleName.modulePath)
						);
					}
				}
			}

			// we have the moduleName without the version
			// we check this against various configs
			var mapName = utils.moduleName.create(parsedModuleName),
				refSteal = utils.pkg.config(refPkg),
			    mappedName;

			// The refPkg might have a browser [https://github.com/substack/node-browserify#browser-field] mapping.
			// Perform that mapping here.
			if(refPkg.browser && (typeof refPkg.browser !== "string") &&
			   (mapName in refPkg.browser) &&
				   (!refSteal || !refSteal.ignoreBrowser)) {
				mappedName = refPkg.browser[mapName] === false ?
					"@empty" : refPkg.browser[mapName];
			}
			// globalBrowser looks like: {moduleName: aliasName, pgk: aliasingPkg}
			var global = loader && loader.globalBrowser &&
				loader.globalBrowser[mapName];
			if(global) {
				mappedName = global.moduleName === false ? "@empty" :
					global.moduleName;
			}

			if(mappedName) {
				return utils.moduleName.parse(mappedName, packageName, !!global);
			} else {
				return parsedModuleName;
			}
		},
		nameAndVersion: function(parsedModuleName){
			return parsedModuleName.packageName + "@" + parsedModuleName.version;
		}
	},
	pkg: {
		/**
		 * Returns a package's name.  The system config allows one to set this to
		 * something else.
		 * @return {String}
		 */
		name: function(pkg){
			var steal = utils.pkg.config(pkg);
			return (steal && steal.name) || pkg.name;
		},
		main: function(pkg) {
			var main;
			var steal = utils.pkg.config(pkg);
			if(steal && steal.main) {
				main = steal.main;
			} else if(typeof pkg.browser === "string") {
				if(utils.path.endsWithSlash(pkg.browser)) {
					main = pkg.browser + "index";
				} else {
					main = pkg.browser;
				}
			} else if(typeof pkg.jam === "object" && pkg.jam.main) {
				main = pkg.jam.main;
			} else if(pkg.main) {
				main = pkg.main;
			} else {
				main = "index";
			}

			return utils.path.removeJS(
				utils.path.removeDotSlash(main)
			);
		},
		rootDir: function(pkg, isRoot) {
			var root = isRoot ?
				utils.path.removePackage( pkg.fileUrl ) :
				utils.path.pkgDir(pkg.fileUrl);

			var lib = utils.pkg.directoriesLib(pkg);
			if(lib) {
				root = utils.path.joinURIs(utils.path.addEndingSlash(root), lib);
			}
			return root;
		},
		/**
		 * @function pkg.isRoot
		 * Determines whether a module is the loader's root module.
		 * @return {Boolean}
		 */
		isRoot: function(loader, pkg) {
			var root = utils.pkg.getDefault(loader);
			return pkg.name === root.name && pkg.version === root.version;
		},
		homeAlias: function (context) {
			return context && context.loader && context.loader.homeAlias || '~';
		},
		getDefault: function(loader) {
			return loader.npmPaths.__default;
		},
		/**
		 * Returns packageData given a module's name or module's address.
		 *
		 * Given a moduleName, it tries to return the package it belongs to.
		 * If a moduleName isn't provided, but a moduleA
		 *
		 * @param {Loader} loader
		 * @param {String} [moduleName]
		 * @param {String} [moduleAddress]
		 * @return {NpmPackage|undefined}
		 */
		findByModuleNameOrAddress: function(loader, moduleName, moduleAddress) {
			if(loader.npm) {
				if(moduleName) {
					var parsed = utils.moduleName.parse(moduleName);
					if(parsed.version && parsed.packageName) {
						var name = parsed.packageName+"@"+parsed.version;
						if(name in loader.npm) {
							return loader.npm[name];
						}
					}
				}
				if(moduleAddress) {
					// Remove the baseURL so that folderAddress only detects
					// node_modules that are within the baseURL. Otherwise
					// you cannot load a project that is itself within
					// node_modules
					var startingAddress = utils.relativeURI(loader.baseURL,
															moduleAddress);
					var packageFolder = utils.pkg.folderAddress(startingAddress);
					return packageFolder ? loader.npmPaths[packageFolder] : utils.pkg.getDefault(loader);
				} else {
					return utils.pkg.getDefault(loader);
				}
			}
		},
		folderAddress: function (address){
			var nodeModules = "/node_modules/",
				nodeModulesIndex = address.lastIndexOf(nodeModules),
				nextSlash = address.indexOf("/", nodeModulesIndex+nodeModules.length);
			if(nodeModulesIndex >= 0) {
				return nextSlash>=0 ? address.substr(0, nextSlash) : address;
			}
		},
		/**
		 * Finds a dependency by its saved resolutions. This will only be called
		 * after we've first successful found a package the "hard way" by doing
		 * semver matching.
		 */
		findDep: function(loader, refPkg, name){
			if(loader.npm && refPkg && !utils.path.startsWithDotSlash(name)) {
				var nameAndVersion = name + "@" + refPkg.resolutions[name];
				var pkg = loader.npm[nameAndVersion];
				return pkg;
			}
		},
		/**
		 * Walks up npmPaths looking for a [name]/package.json.  Returns
		 * the package data it finds.
		 *
		 * @param {Loader} loader
		 * @param {NpmPackage} refPackage
		 * @param {packgeName} name the package name we are looking for.
		 *
		 * @return {undefined|NpmPackage}
		 */
		findDepWalking: function (loader, refPackage, name) {
			if(loader.npm && refPackage && !utils.path.startsWithDotSlash(name)) {
				// Todo .. first part of name
				var curPackage = utils.path.depPackageDir(refPackage.fileUrl, name);
				while(curPackage) {
					var pkg = loader.npmPaths[curPackage];
					if(pkg) {
						return pkg;
					}
					var parentAddress = utils.path.parentNodeModuleAddress(curPackage);
					if(!parentAddress) {
						return;
					}
					curPackage = parentAddress+"/"+name;
				}
			}
		},
		findByName: function(loader, name) {
			if(loader.npm && !utils.path.startsWithDotSlash(name)) {
				return loader.npm[name];
			}
		},
		findByNameAndVersion: function(loader, name, version) {
			if(loader.npm && !utils.path.startsWithDotSlash(name)) {
				var nameAndVersion = name + "@" + version;
				return loader.npm[nameAndVersion];
			}
		},
		findByUrl: function(loader, url) {
			if(loader.npm) {
				var fullUrl = utils.pkg.folderAddress(url);
				return loader.npmPaths[fullUrl];
			}
		},
		directoriesLib: function(pkg) {
			var steal = utils.pkg.config(pkg);
			var lib = steal && steal.directories && steal.directories.lib;
			var ignores = [".", "/"], ignore;

			if(!lib) return undefined;

			while(!!(ignore = ignores.shift())) {
				if(lib[0] === ignore) {
					lib = lib.substr(1);
				}
			}
			return lib;
		},
		hasDirectoriesLib: function(pkg) {
			var steal = utils.pkg.config(pkg);
			return steal && steal.directories && !!steal.directories.lib;
		},
		findPackageInfo: function(context, pkg){
			var pkgInfo = context.pkgInfo;
			if(pkgInfo) {
				var out;
				utils.forEach(pkgInfo, function(p){
					if(pkg.name === p.name && pkg.version === p.version) {
						out = p;
					}
				});
				return out;
			}
		},
		saveResolution: function(context, refPkg, pkg){
			var npmPkg = utils.pkg.findPackageInfo(context, refPkg);
			npmPkg.resolutions[pkg.name] = refPkg.resolutions[pkg.name] =
				pkg.version;
		},
		config: function(pkg){
			return pkg.steal || pkg.system;
		}
	},
	path: {
		makeRelative: function(path){
			if( utils.path.isRelative(path) && path.substr(0,1) !== "/" ) {
				return path;
			} else {
				return "./"+path;
			}
		},
		removeJS: function(path) {
			return path.replace(/\.js(!|$)/,function(whole, part){return part;});
		},
		removePackage: function (path){
			return path.replace(/\/package\.json.*/,"");
		},
		addJS: function(path){
			// Don't add `.js` for types that need to work without an extension.
			if(/\.js(on)?$/.test(path)) {
				return path;
			} else {
				return path+".js";
			}
		},
		isRelative: function(path) {
			return  path.substr(0,1) === ".";
		},
		isInHomeDir: function( path, context ) {
			return path.substr(0,2) === utils.pkg.homeAlias(context) + "/";
		},
		joinURIs: function(baseUri, rel) {
			function removeDotSegments(input) {
				var output = [];
				input.replace(/^(\.\.?(\/|$))+/, '')
					.replace(/\/(\.(\/|$))+/g, '/')
					.replace(/\/\.\.$/, '/../')
					.replace(/\/?[^\/]*/g, function (p) {
						if (p === '/..') {
							output.pop();
						} else {
							output.push(p);
						}
					});
				return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
			}

			var href = parseURI(rel || '');
			var base = parseURI(baseUri || '');

			return !href || !base ? null : (href.protocol || base.protocol) +
				(href.protocol || href.authority ? href.authority : base.authority) +
				removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
					(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
					href.hash;
		},
		startsWithDotSlash: function( path ) {
			return path.substr(0,2) === "./";
		},
		removeDotSlash: function(path) {
			return utils.path.startsWithDotSlash(path) ?
				path.substr(2) :
				path;
		},
		endsWithSlash: function(path){
			return path[path.length -1] === "/";
		},
		addEndingSlash: function(path){
			return utils.path.endsWithSlash(path) ? path : path+"/";
		},
		// Returns a package.json path one node_modules folder deeper than the
		// parentPackageAddress
		depPackage: function (parentPackageAddress, childName){
			var packageFolderName = parentPackageAddress.replace(/\/package\.json.*/,"");
			return (packageFolderName ? packageFolderName+"/" : "")+"node_modules/" + childName + "/package.json";
		},
		peerPackage: function(parentPackageAddress, childName){
			var packageFolderName = parentPackageAddress.replace(/\/package\.json.*/,"");
			return packageFolderName.substr(0, packageFolderName.lastIndexOf("/"))
				+ "/" + childName + "/package.json";
		},
		// returns the package directory one level deeper.
		depPackageDir: function(parentPackageAddress, childName){
			return utils.path.depPackage(parentPackageAddress, childName).replace(/\/package\.json.*/,"");
		},
		peerNodeModuleAddress: function(address) {
			var nodeModules = "/node_modules/",
				nodeModulesIndex = address.lastIndexOf(nodeModules);
			if(nodeModulesIndex >= 0) {
				return address.substr(0, nodeModulesIndex+nodeModules.length - 1 );
			}
		},
		// /node_modules/a/node_modules/b/node_modules/c -> /node_modules/a/node_modules/
		parentNodeModuleAddress: function(address) {
			var nodeModules = "/node_modules/",
				nodeModulesIndex = address.lastIndexOf(nodeModules),
				prevModulesIndex = address.lastIndexOf(nodeModules, nodeModulesIndex-1);
			if(prevModulesIndex >= 0) {
				return address.substr(0, prevModulesIndex+nodeModules.length - 1 );
			}
		},
		pkgDir: function(address){
			var nodeModules = "/node_modules/",
				nodeModulesIndex = address.lastIndexOf(nodeModules),
				nextSlash = address.indexOf("/", nodeModulesIndex+nodeModules.length);
			// Scoped packages
			if(address[nodeModulesIndex+nodeModules.length] === "@") {
				nextSlash = address.indexOf("/", nextSlash+1);
			}
			if(nodeModulesIndex >= 0) {
				return nextSlash>=0 ? address.substr(0, nextSlash) : address;
			}
		},
		basename: function(address){
			var parts = address.split("/");
			return parts[parts.length - 1];
		},
		relativeTo: function(modulePath, rel) {
			var parts = modulePath.split("/");
			var idx = 1;
			while(rel[idx] === ".") {
				parts.pop();
				idx++;
			}
			return parts.join("/");
		},
		isPackageRootDir: function(pth) {
			return pth.indexOf("/") === -1;
		}
	},
	json: {
		/**
		 * if a jsonOptions transformer is provided (by the System.config)
		 * use it for all json files, package.json's are also included
		 * @param loader
		 * @param load
		 * @param data
		 * @returns data
		 */
		transform: function(loader, load, data) {
			// harmonize steal config
			data.steal = utils.pkg.config(data);
			var fn = loader.jsonOptions && loader.jsonOptions.transform;
			if(!fn) return data;
			return fn.call(loader, load, data);
		}
	},
	includeInBuild: true
};


function parseURI(url) {
	var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
		// authority = '//' + user + ':' + pass '@' + hostname + ':' port
		return (m ? {
		href     : m[0] || '',
		protocol : m[1] || '',
		authority: m[2] || '',
		host     : m[3] || '',
		hostname : m[4] || '',
		port     : m[5] || '',
		pathname : m[6] || '',
		search   : m[7] || '',
		hash     : m[8] || ''
	} : null);
}

module.exports = utils;
