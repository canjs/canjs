"format cjs";

var steal = require("@steal");
var utils = require("./npm-utils");
exports.includeInBuild = true;

var isNode = typeof process === "object" && {}.toString.call(process) ===
	"[object process]";
var isWorker = typeof WorkerGlobalScope !== "undefined" && (self instanceof WorkerGlobalScope);
var isElectron = isNode && !!process.versions.electron;
var isBrowser = typeof window !== "undefined" && (!isNode || isElectron) && !isWorker;

exports.addExtension = function addNpmExtension(System){
	if (System._extensions) {
		System._extensions.push(addNpmExtension);
	}
	/**
	 * Normalize has to deal with a "tricky" situation.  There are module names like
	 * "css" -> "css" normalize like normal
	 * "./qunit" //-> "qunit"  ... could go to steal-qunit#qunit, but then everything would?
	 *
	 * isRoot?
	 *   "can-slider" //-> "path/to/main"
	 *
	 * else
	 *
	 *   "can-slider" //-> "can-slider#path/to/main"
	 */
	var oldNormalize = System.normalize;
	System.normalize = function(identifier, parentModuleName, parentAddress, pluginNormalize){
		var name = identifier;
		var parentName = parentModuleName;
		if(parentName && this.npmParentMap && this.npmParentMap[parentName]) {
			parentName = this.npmParentMap[parentName];
		}

		var hasNoParent = !parentName;
		var nameIsRelative = utils.path.isRelative(name);
		var nameIsNpmModule = utils.moduleName.isNpm(name);
		var parentIsNpmModule = utils.moduleName.isNpm(parentName);
		var identifierEndsWithSlash = utils.path.endsWithSlash(name);

		// If this is an npm module name already, we don't need to re-resolve it.
		if(nameIsNpmModule && parentModuleName) {
			return oldNormalize.call(this, name, parentName, parentAddress,
									 pluginNormalize);
		}

		// If this is a relative module name and the parent is not an npm module
		// we can skip all of this logic.
		if(parentName && nameIsRelative && !parentIsNpmModule) {
			return oldNormalize.call(this, name, parentName, parentAddress,
									 pluginNormalize);
		}

		// don't normalize name module yet if it includes any conditionals
		if (utils.moduleName.isConditional(name)) {
			return oldNormalize.call(this, name, parentName, parentAddress,
									 pluginNormalize);
		}

		// Check against contextual maps that would not be converted.
		var hasContextualMap = typeof this.map[parentName] === "object" &&
		  this.map[parentName][name];
		if(hasContextualMap) {
			return oldNormalize.call(this, name, parentName, parentAddress,
									 pluginNormalize);
		}

		// Get the current package
		var refPkg = utils.pkg.findByModuleNameOrAddress(this, parentName,
														 parentAddress);

		// this isn't in a package, so ignore
		if(!refPkg) {
			return oldNormalize.call(this, name, parentName, parentAddress,
									 pluginNormalize);
		}

		// If name is ./ or ../
		var isPointingAtParentFolder = name === "../" || name === "./";

		if(parentIsNpmModule && isPointingAtParentFolder) {
			var parsedParentModuleName = utils.moduleName.parse(parentName);
			var parentModulePath = parsedParentModuleName.modulePath || "";
			var relativePath = utils.path.relativeTo(parentModulePath, name);
			var isInRoot = utils.path.isPackageRootDir(relativePath);

			if(isInRoot) {
				name = refPkg.name + "#" + utils.path.removeJS(
					utils.path.removeDotSlash(refPkg.main)
				);

			} else {
				name = name + "index";
			}
		}

		// Using the current package, get info about what it is probably asking for
		var parsedModuleName = utils.moduleName.parseFromPackage(this, refPkg,
																 name,
																 parentName);

		var isRoot = utils.pkg.isRoot(this, refPkg);
		var parsedPackageNameIsReferringPackage =
			parsedModuleName.packageName === refPkg.name;

		// Are we normalizing a module that is relative to another npm module?
		var isRelativeToParentNpmModule =
			parentIsNpmModule &&
			nameIsRelative &&
			parsedPackageNameIsReferringPackage;

		// Look for the dependency package specified by the current package
		var depPkg, wantedPkg;

		// If we are within the same package then refPkg is the package we care
		// about
		if(isRelativeToParentNpmModule) {
			depPkg = refPkg;
		}

		var context = this.npmContext;
		var crawl = context && context.crawl;
		var isDev = !!crawl;
		if(!depPkg) {
			// Development mode
			if(crawl) {
				var parentPkg = nameIsRelative ? null :
					crawl.matchedVersion(context, refPkg.name,
										 refPkg.version);
				if(parentPkg) {
					var depMap = crawl.getFullDependencyMap(this, parentPkg, isRoot);
					wantedPkg = depMap[parsedModuleName.packageName];
					if(wantedPkg) {
						var wantedVersion = (refPkg.resolutions &&
							refPkg.resolutions[wantedPkg.name]) || wantedPkg.version;

						var foundPkg = crawl.matchedVersion(this.npmContext,
															wantedPkg.name,
															wantedVersion);
						if(foundPkg) {
							depPkg = utils.pkg.findByUrl(this, foundPkg.fileUrl);
						}
					}
				}
			} else {
				if(isRoot) {
					depPkg = utils.pkg.findDepWalking(this, refPkg,
													  parsedModuleName.packageName);
				} else {
					depPkg = utils.pkg.findDep(this, refPkg,
											   parsedModuleName.packageName);
				}
			}
		}

		// If the parent package is loading itself by name, look up by version
		if(parsedPackageNameIsReferringPackage) {
			depPkg = utils.pkg.findByNameAndVersion(this,
													parsedModuleName.packageName,
													refPkg.version);
		}

		// This really shouldn't happen, but lets find a package.
		var lookupByName = parsedModuleName.isGlobal || hasNoParent;
		if (!depPkg) {
			depPkg = utils.pkg.findByName(this, parsedModuleName.packageName);
		}

		var isThePackageWeWant = !isDev || !depPkg ||
			(wantedPkg ? crawl.pkgSatisfies(depPkg, wantedPkg.version) : true);
		if(!isThePackageWeWant) {
			depPkg = undefined;
		} else if(isDev && depPkg) {
			utils.pkg.saveResolution(context, refPkg, depPkg);
		}

		// It could be something like `fs` so check in globals
		if(!depPkg) {
			var browserPackageName = this.globalBrowser[parsedModuleName.packageName];
			if(browserPackageName) {
				parsedModuleName.packageName = browserPackageName.moduleName;
				depPkg = utils.pkg.findByName(this, parsedModuleName.packageName);
			}
		}

		// It could be the root main.
		if(!depPkg && isRoot && name === refPkg.main &&
		  utils.pkg.hasDirectoriesLib(refPkg)) {
			parsedModuleName.version = refPkg.version;
			parsedModuleName.packageName = refPkg.name;
			parsedModuleName.modulePath = utils.pkg.main(refPkg);
			return oldNormalize.call(this,
									 utils.moduleName.create(parsedModuleName),
									 parentName, parentAddress, pluginNormalize);
		}

		// This is the beginning of progressively loading package.json
		var loader = this;
		if(!depPkg) {
			if(crawl) {
				var parentPkg = crawl.matchedVersion(this.npmContext, refPkg.name,
													 refPkg.version);

				if(parentPkg) {
					var depMap = crawl.getFullDependencyMap(this, parentPkg, isRoot);
					depPkg = depMap[parsedModuleName.packageName];

					// If we still haven't found a package, try to find it by
					// name, we'll take whatever we can get.
					if(!depPkg) {
						var parents = crawl.findPackageAndParents(this.npmContext,
							parsedModuleName.packageName);
						if(parents) {
							depPkg = parents.package;
						}
					}
				}
			}

			if(!depPkg) {
				if(refPkg.browser && refPkg.browser[name]) {
					return oldNormalize.call(this, refPkg.browser[name], parentName,
											 parentAddress, pluginNormalize);
				}
				// Apply mappings, if they exist in the refPkg
				var steal = utils.pkg.config(refPkg);
				if (steal && steal.map && typeof steal.map[name] === "string") {
					var mappedName = steal.map[name];
					var envConfig = steal.envs && steal.envs[loader.env];

					if(envConfig && envConfig.map && typeof envConfig.map[name] === "string") {
						mappedName = envConfig.map[name];
					}

					return loader.normalize(
						mappedName,
						parentName,
						parentAddress,
						pluginNormalize
					);
				} else {
					return oldNormalize.call(
						this,
						name,
						parentName,
						parentAddress,
						pluginNormalize
					);
				}
			}
			return crawl.dep(this.npmContext, parentPkg, refPkg, depPkg, isRoot)
				.then(createModuleNameAndNormalize);
		} else {
			return createModuleNameAndNormalize(depPkg);
		}

		function createModuleNameAndNormalize(depPkg){
			parsedModuleName.version = depPkg.version;
			// add the main path
			if(!parsedModuleName.modulePath) {
				parsedModuleName.modulePath = utils.pkg.main(depPkg);
			}

			var p = oldNormalize.call(
				loader,
				utils.moduleName.create(parsedModuleName),
				parentName,
				parentAddress,
				pluginNormalize
			);

			// For identifiers like ./lib/ save this info as we might
			// get a 404 and need to retry with lib/index.js
			if(identifierEndsWithSlash) {
				p.then(function(name){
					if(context && context.forwardSlashMap) {
						context.forwardSlashMap[name] = true;
					}
				});
			}

			return p;

		}
	};

	var oldLocate = System.locate;
	System.locate = function(load){
		var parsedModuleName = utils.moduleName.parse(load.name),
			loader = this;

		var pmn = load.metadata.parsedModuleName = parsedModuleName;
		load.metadata.npmPackage = utils.pkg.findByNameAndVersion(this,
			pmn.packageName, pmn.version);

		// @ is not the first character
		if(parsedModuleName.version && this.npm && !loader.paths[load.name]) {
			var pkg = this.npm[utils.moduleName.nameAndVersion(parsedModuleName)];
			if(pkg) {
				return oldLocate.call(this, load).then(function(locatedAddress){
					var address = locatedAddress;
					var expectedAddress = utils.path.joinURIs(
						System.baseURL, load.name
					);
					if(isBrowser) {
						expectedAddress = expectedAddress.replace(/#/g, "%23");
					}

					// If locate didn't do the expected thing then we're going
					// to guess that we shouldn't perform npm lookup on this
					// module as there might be a wildcard path.
					if(address !== expectedAddress + ".js" &&
					  address !== expectedAddress) {
						return address;
					}

					var root = utils.pkg.rootDir(pkg, utils.pkg.isRoot(loader, pkg));

					if(parsedModuleName.modulePath) {
						var npmAddress = utils.path.joinURIs(
							utils.path.addEndingSlash(root),
								parsedModuleName.plugin ?
								parsedModuleName.modulePath :
								utils.path.addJS(parsedModuleName.modulePath)
						);
						address = typeof steal !== "undefined" ?
							utils.path.joinURIs(loader.baseURL, npmAddress) :
							npmAddress;
					}

					return address;
				});
			}
		}
		return oldLocate.call(this, load);
	};

	var oldFetch = System.fetch;
	System.fetch = function(load){
		if(load.metadata.dryRun) {
			return oldFetch.apply(this, arguments);
		}

		var loader = this;
		var context = loader.npmContext;
		var fetchPromise = Promise.resolve(oldFetch.apply(this, arguments));

		if(utils.moduleName.isNpm(load.name)) {
			fetchPromise = fetchPromise.then(null, function(err){
				var statusCode = err.statusCode;
				if(statusCode !== 404 && statusCode !== 0) {
					return Promise.reject(err);
				}

				// In order to retry in dev bundles there must be a forwardSlashMap
				// to maintain the state.
				if(!loader.npmContext) {
					loader.npmContext = { forwardSlashMap: {} };
				}

				// Begin attempting retries. `retryTypes` defines different
				// types of retries to do, currently retrying on the
				// /index and /package.json conventions.
				var types = [].slice.call(retryTypes);

				return retryAll(types, err).then(null, function(e){
					// Return the original error.
					return Promise.reject(err);
				});

				function retryAll(types, err){
					if(!types.length) {
						throw err;
					}

					var type = types.shift();
					if(!type.test(load)) {
						throw err;
					}

					return Promise.resolve(retryFetch.call(loader, load, type))
					.then(null, function(err){
						return retryAll(types, err);
					});
				}
			});
		}

		return fetchPromise.catch(function(error) {
			var statusCode = error.statusCode;
			if ((statusCode === 404 || statusCode === 0) &&
				utils.moduleName.isBareIdentifier(load.name) &&
				!utils.pkg.isRoot(loader, load.metadata.npmPackage)) {
				var newError = new Error([
					"Could not load '" + load.name + "'",
					"Is this an npm module not saved in your package.json?"
				].join("\n"));
				newError.statusCode = error.statusCode;
				newError.stack = newError.stack + error.stack;
				throw newError;
			} else {
				throw error;
			}
		});
	};

	// Given a moduleName convert it into a npm-style moduleName if it belongs
	// to a package.
	var convertName = function(loader, name){
		var pkg = utils.pkg.findByName(loader, name.split("/")[0]);
		if(pkg) {
			var parsed = utils.moduleName.parse(name, pkg.name);
			parsed.version = pkg.version;
			if(!parsed.modulePath) {
				parsed.modulePath = utils.pkg.main(pkg);
			}
			return utils.moduleName.create(parsed);
		}
		return name;
	};

	var configSpecial = {
		map: function(map){
			var newMap = {}, val;
			for(var name in map) {
				val = map[name];
				newMap[convertName(this, name)] = typeof val === "object"
					? configSpecial.map(val)
					: convertName(this, val);
			}
			return newMap;
		},
		meta: function(map){
			var newMap = {};
			for(var name in map){
				newMap[convertName(this, name)] = map[name];
			}
			return newMap;
		},
		paths: function(paths){
			var newPaths = {};
			for(var name in paths) {
				newPaths[convertName(this, name)] = paths[name];
			}
			return newPaths;
		}
	};


	var oldConfig = System.config;
	System.config = function(cfg){
		var loader = this;

		// Use npm-convert if it is available as it is better
		// and has the ability to push mappings into a waiting queue.
		if(loader.npmContext) {
			var context = loader.npmContext;
			var pkg = context.versions.__default;
			var conv = context.convert.steal(context, pkg, cfg, true);
			context.convert.updateConfigOnPackageLoad(conv, false,
				true, context.applyBuildConfig);
			oldConfig.apply(loader, arguments);
			return;
		}

		for(var name in cfg) {
			if(configSpecial[name]) {
				cfg[name] = configSpecial[name].call(loader, cfg[name]);
			}
		}
		oldConfig.apply(loader, arguments);
	};

	// Implement the newLoader hook to copy config over during the build.
	var newLoader = System._newLoader || Function.prototype;
	System._newLoader = function(loader) {
		loader.npmContext = this.npmContext;
		loader.npmParentMap = this.npmParentMap;
		return newLoader.apply(this, arguments);
	};

	steal.addNpmPackages = function(npmPackages) {
		var packages = npmPackages || [];
		var loader = this.loader;

		for (var i = 0; i < packages.length; i += 1) {
			var pkg = packages[i];
			var path = pkg && pkg.fileUrl;

			if (path) {
				loader.npmContext.paths[path] = pkg;
			}
		}
	};

	steal.getNpmPackages = function() {
		var context = this.loader.npmContext;
		return context ? (context.packages || []) : [];
	}

	function retryFetch(load, type) {
		var loader = this;

		// Get the new moduleName to test against
		var moduleName = typeof type.name === "function" ?
			type.name(loader, load) :
			load.name + type.name;

		var local = utils.extend({}, load);
		local.name = moduleName;
		local.metadata = { dryRun: true };

		return Promise.resolve(loader.locate(local))
			.then(function(address){
				local.address = address;
				return loader.fetch(local);
			})
			.then(function(source){
				load.metadata.address = local.address;
				loader.npmParentMap[load.name] = local.name;
				var npmLoad = loader.npmContext &&
					loader.npmContext.npmLoad;
				if(npmLoad) {
					npmLoad.saveLoadIfNeeded(loader.npmContext);
					if(!isNode) {
						utils.warnOnce("Some 404s were encountered " +
									   "while loading. Don't panic! " +
									   "These will only happen in dev " +
									   "and are harmless.");
					}
				}
				return source;
			});
	}

	// These define ways to retry a fetch when it fails (404)
	var retryTypes = [
		{
			name: function(loader, load){
				var context = loader.npmContext;
				if(context.forwardSlashMap[load.name]) {
					var parts = load.name.split("/");
					parts.pop();
					return parts.concat(["index"]).join("/");
				}

				return load.name + "/index";
			},
			test: function() { return true; }
		},
		{
			name: ".json",
			test: function(load){
				return utils.moduleName.isNpm(load.name) &&
					utils.path.basename(load.address) === "package.js";
			}
		}
	];
};
