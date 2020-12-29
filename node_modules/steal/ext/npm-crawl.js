var convert = require("./npm-convert");
var npmModuleLoad = require("./npm-load");
var utils = require("./npm-utils");
var SemVer = require('./semver');
/**
 * @module {{}} system-npm/crawl
 * Exports helpers used for crawling package.json
 */
var crawl = {
	/**
	 * Adds the properties read from a package's source to the `pkg` object.
	 * @param {Object} context
	 * @param {NpmPackage} pkg -
	 * @param {String} src
	 * @return {NpmPackage}
	 */
	processPkgSource: function(context, pkg, src) {
		var source = src || "{}";
		var packageJSON;

		try {
			packageJSON = JSON.parse(source);
		} catch(err) {
			err.jsonSource = src;
			throw err;
		}

		utils.extend(pkg, packageJSON);
		context.packages.push(pkg);
		return pkg;
	},
	/**
	 * Crawl from the root, only fetching Steal and its dependencies so
	 * that Node built-ins are autoconfigured.
	 */
	root: function(context, pkg){
		var deps = crawl.getDependencyMap(context.loader, pkg, true);
		crawl.setParent(context, pkg, true);

		var pluginsPromise = crawl.loadPlugins(context, pkg, true, deps, true);
		var stealPromise = crawl.loadSteal(context, pkg, true, deps);

		return Promise.all([pluginsPromise, stealPromise]);
	},
	/**
	 * Crawls the packages dependencies
	 * @param {Object} context
	 * @param {NpmPackage} pkg
	 * @param {Boolean} [isRoot] If the root module's dependencies should be crawled.
	 * @return {Promise} A promise when all packages have been loaded
	 */
	deps: function(context, pkg, isRoot) {
		var deps = crawl.getDependencies(context.loader, pkg, isRoot);

		return Promise.all(utils.filter(utils.map(deps, function(childPkg){
			return crawl.fetchDep(context, pkg, childPkg, isRoot);
		}), truthy)).then(function(packages){
 			// at this point all dependencies of pkg have been loaded, it's ok to get their children

			return Promise.all(utils.map(packages, function(childPkg){
				// Also load 'steal' so that the builtins will be configured
				if(childPkg && childPkg.name === 'steal') {
					return crawl.deps(context, childPkg);
				}
			})).then(function(){
				return packages;
			});
		});
	},
	dep: function(context, pkg, refPkg, childNpmPkg, isRoot, skipSettingConfig) {
		var childPkg = childNpmPkg;
		var versionAndRange = childPkg.name + "@" + childPkg.version;
		if(context.fetchCache[versionAndRange]) {
			return context.fetchCache[versionAndRange];
		}

		childPkg = utils.extend({}, childPkg);

		var p = context.fetchCache[versionAndRange] =
			Promise.resolve(crawl.fetchDep(context, pkg, childPkg, isRoot))
			.then(function(result){
				// Package already being fetched
				if(result === undefined) {
					var fetchedPkg = crawl.matchedVersion(context, childPkg.name,
														  childPkg.version);
					return fetchedPkg;
				} else {
					childPkg = result;
				}
				return result;
			}).then(function(childPkg){
				// Save this pkgInfo into the context
				if(!skipSettingConfig) {
					var localPkg = convert.toPackage(context, childPkg);
					convert.forPackage(context, childPkg);

					// If this is a build we need to copy over the configuration
					// from the plugin loader to the localLoader.
					if(context.loader.localLoader) {
						var localContext = context.loader.localLoader.npmContext;
						convert.toPackage(localContext, childPkg);
					}
				}

				return crawl.loadPlugins(context, childPkg, false, null,
										skipSettingConfig).then(function(){
					return localPkg;
				});
			}).then(function(localPkg){
				if(!skipSettingConfig) {
					// When progressively fetching package.jsons, we need to save
					// the 'resolutions' so in production we get the *correct*
					// version of a dependency.
					if(refPkg) {
						utils.pkg.saveResolution(context, refPkg, localPkg);
					}

					// Save package.json!npm load
					npmModuleLoad.saveLoadIfNeeded(context);

					// Setup any config that needs to be placed on the loader.
					crawl.setConfigForPackage(context, localPkg);
				}

				return localPkg;
			});
		return p;
	},

	/**
	 * Fetch a particular package.json dependency
	 * @param {Object} context
	 * @param {NpmPackage} parentPkg
	 * @param {NpmPackage} childPkg
	 * @param {Boolean} [isRoot] If the root module's dependencies shoudl be crawled.
	 * @return {Promise} A promise when the package has loaded
	 */
	fetchDep: function(context, parentPkg, childPkg, isRoot){
		var pkg = parentPkg;
		var isFlat = context.isFlatFileStructure;

		// if a peer dependency, and not isRoot
		if(childPkg._isPeerDependency && !isRoot ) {
			// check one node_module level higher
			childPkg.origFileUrl = nodeModuleAddress(pkg.fileUrl)+"/"+childPkg.name+"/package.json";
		} else if(isRoot) {
			childPkg.origFileUrl = utils.path.depPackage(pkg.fileUrl, childPkg.name);
		} else {
			// npm 2
			childPkg.origFileUrl = childPkg.nestedFileUrl =
				utils.path.depPackage(pkg.fileUrl, childPkg.name);

			if(isFlat) {
				// npm 3
				childPkg.origFileUrl = crawl.parentMostAddress(context,
															   childPkg);
			}
		}

		// check if childPkg matches a parent's version ... if it
		// does ... do nothing
		if(crawl.hasParentPackageThatMatches(context, childPkg)) {
			return;
		}

		if(crawl.isSameRequestedVersionFound(context, childPkg)) {
			return;
		}

		var requestedVersion = childPkg.version;
		return npmLoad(context, childPkg, parentPkg)
		.then(function(pkg){
			crawl.setVersionsConfig(context, pkg, requestedVersion);
			crawl.setParent(context, pkg, false);
			return pkg;
		});
	},
	loadPlugins: function(context, pkg, isRoot, deps, skipSettingConfig){
		var deps = deps || crawl.getDependencyMap(context.loader, pkg, isRoot);
		var plugins = crawl.getPlugins(pkg, deps);
		var needFetching = utils.filter(plugins, function(pluginPkg){
			return !crawl.matchedVersion(context, pluginPkg.name,
										 pluginPkg.version);
		}, truthy);

		return Promise.all(utils.map(needFetching, function(pluginPkg){
			return crawl.dep(context, pkg, false, pluginPkg, isRoot, skipSettingConfig);
		}));
	},
	/**
	 * Load steal and its dependencies, if needed
	 */
	loadSteal: function(context, pkg, isRoot, deps){
		var stealPkg, dep;
		for(var p in deps) {
			dep = deps[p];
			if(dep.name === "steal") {
				stealPkg = dep;
				break;
			}
		}

		if(stealPkg) {
			return Promise.resolve(crawl.fetchDep(context, pkg, stealPkg, isRoot))
				.then(function(childPkg){
					if(childPkg) {
						return crawl.deps(context, childPkg);
					}
				});
		} else {
			return Promise.resolve();
		}
	},
	/**
	 * Returns an array of the dependency names that should be crawled.
	 * @param {Object} loader
	 * @param {NpmPackage} packageJSON
	 * @param {Boolean} [isRoot]
	 * @return {Array<String>}
	 */
	getDependencies: function(loader, packageJSON, isRoot){
		var deps = crawl.getDependencyMap(loader, packageJSON, isRoot);

		var dependencies = [];
		for(var name in deps) {
			dependencies.push(deps[name]);
		}

		return dependencies;
	},
	/**
	 * Returns a map of the dependencies and their ranges.
	 * @param {Object} loader
	 * @param {Object} packageJSON
	 * @param {Boolean} isRoot
	 * @param {Boolean} includeDevDependenciesIfNotRoot
	 * @return {Object<String,Range>} A map of dependency names and requested version ranges.
	 */
	getDependencyMap: function(loader, packageJSON, isRoot){
		var config = utils.pkg.config(packageJSON);
		var hasConfig = !!config;

		// convert npmIgnore
		var npmIgnore = hasConfig && config.npmIgnore;
		function convertToMap(arr) {
			var npmMap = {};
			for(var i = 0; i < arr.length; i++) {
				npmMap[arr[i]] = true;
			}
			return npmMap;
		}
		if(npmIgnore && typeof npmIgnore.length === 'number') {
			npmIgnore = config.npmIgnore = convertToMap(npmIgnore);
		}
		// convert npmDependencies
		var npmDependencies = hasConfig && config.npmDependencies;
		if(npmDependencies && typeof npmDependencies.length === "number") {
			config.npmDependencies = convertToMap(npmDependencies);
		}
		npmIgnore = npmIgnore || {};

		var deps = {};

		addDeps(packageJSON, packageJSON.peerDependencies || {}, deps,
				"peerDependencies", {_isPeerDependency: true});

		addDeps(packageJSON, packageJSON.dependencies || {}, deps,
			"dependencies");

		if(isRoot) {
			addDeps(packageJSON, packageJSON.devDependencies || {}, deps,
				"devDependencies");
		}

		return deps;
	},
	/**
	 * Return a map of all dependencies from a package.json, including
	 * devDependencies
	 */
	getFullDependencyMap: function(loader, packageJSON, isRoot){
		var deps = crawl.getDependencyMap(loader, packageJSON, isRoot);

		return addMissingDeps(
			packageJSON,
			packageJSON.devDependencies || {},
			deps,
			"devDependencies"
		);
	},
	getPlugins: function(packageJSON, deps) {
		var config = utils.pkg.config(packageJSON) || {};
		var plugins = config.plugins || [];
		return utils.filter(utils.map(plugins, function(pluginName){
			return deps[pluginName];
		}), truthy);
	},
	isSameRequestedVersionFound: function(context, childPkg) {
		if(!context.versions[childPkg.name]) {
			context.versions[childPkg.name] = {};
		}
		var versions = context.versions[childPkg.name];

		var requestedRange = childPkg.version;

		if( !SemVer.validRange(childPkg.version) ) {

			if(/^[\w_\-]+\/[\w_\-]+(#[\w_\-]+)?$/.test(requestedRange)  ) {

				requestedRange = "git+https://github.com/"+requestedRange;
				if(!/(#[\w_\-]+)?$/.test(requestedRange)) {
					requestedRange += "#master";
				}
			}
		}
		var version = versions[requestedRange];

		if(!version) {
			versions[requestedRange] = childPkg;
		} else {
			// add a placeholder at this path
			context.paths[childPkg.origFileUrl] = version;
			return true;
		}
	},
	hasParentPackageThatMatches: function(context, childPkg){
		// check paths
		var parentAddress = childPkg._isPeerDependency ?
			utils.path.peerNodeModuleAddress(childPkg.origFileUrl) :
			utils.path.parentNodeModuleAddress(childPkg.origFileUrl);
		while( parentAddress ) {
			var packageAddress = parentAddress+"/"+childPkg.name+"/package.json";
			var parentPkg = context.paths[packageAddress];
			if(parentPkg) {
				if(SemVer.valid(parentPkg.version) &&
				   SemVer.satisfies(parentPkg.version, childPkg.version)) {
					return parentPkg;
				}
			}
			parentAddress = utils.path.parentNodeModuleAddress(packageAddress);
		}
	},
	matchedVersion: function(context, packageName, requestedVersion){
		var versions = context.versions[packageName], pkg;
		for(v in versions) {
			pkg = versions[v];
			if((SemVer.valid(pkg.version) &&
			   SemVer.satisfies(pkg.version, requestedVersion)) ||
			   utils.isGitUrl(requestedVersion)) {
				return pkg;
			}
		}
	},
	/**
	 * Walk up the parent addresses until you run into the root or a conflicting
	 * package and return that as the address.
	 */
	parentMostAddress: function(context, childPkg){
		var curAddress = childPkg.origFileUrl;
		var parentAddress = utils.path.parentNodeModuleAddress(childPkg.origFileUrl);
		while(parentAddress) {
			var packageAddress = parentAddress+"/"+childPkg.name+"/package.json";
			var parentPkg =	context.paths[packageAddress];
			if(parentPkg && SemVer.valid(parentPkg.version)) {
				if(SemVer.satisfies(parentPkg.version, childPkg.version)) {
					return parentPkg.fileUrl;
				}
			}
			parentAddress = utils.path.parentNodeModuleAddress(packageAddress);
			curAddress = packageAddress;
		}
		return curAddress;
	},
	setConfigForPackage: function(context, pkg) {
		var loader = context.loader;
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
		var config = utils.pkg.config(pkg);
		if(config) {
			var ignoredConfig = ["bundle", "configDependencies", "transpiler"];

			// don't set steal.main
			var main = config.main;
			delete config.main;
			utils.forEach(ignoredConfig, function(name){
				delete config[name];
			});
			loader.config(config);
			config.main = main;

		}
		if(pkg.globalBrowser) {
			setGlobalBrowser(pkg.globalBrowser, pkg);
		}
		var systemName = config && config.name;
		if(systemName) {
			setInNpm(systemName, pkg);
		} else {
			setInNpm(pkg.name, pkg);
		}
		if(!loader.npm[pkg.name]) {
			loader.npm[pkg.name] = pkg;
		}
		loader.npm[pkg.name+"@"+pkg.version] = pkg;
		var pkgAddress = pkg.fileUrl.replace(/\/package\.json.*/,"");
		loader.npmPaths[pkgAddress] = pkg;
	},
	setVersionsConfig: function(context, pkg, versionRange) {
		if(!context.versions[pkg.name]) {
			context.versions[pkg.name] = {};
		}
		var versions = context.versions[pkg.name];
		versions[versionRange] = pkg;
	},
	/**
	 * Set this package's dependencies, marking itself as a parent.
	 * { childPkg: [parent1, parent2] }
	 */
	setParent: function(context, pkg, isRoot) {
		var deps = crawl.getDependencies(context.loader, pkg, isRoot);
		deps.forEach(function(childDep){
			var name = childDep.name;
			var parents = context.packageParents[name]
			if(!parents) {
				parents = context.packageParents[name] = [];
				parents.package = childDep;
			}
			parents.push(pkg);
		});
	},
	/**
	 * @function findPackageAndParents
	 * Find a package and its parents.
	 * [package:{}, parent1, parent2, ...]
	 * @param {Object} context
	 * @param {String} name the package name
	 */
	findPackageAndParents: function(context, name) {
		return context.packageParents[name];
	},
	pkgSatisfies: function(pkg, versionRange) {
		return SemVer.validRange(versionRange) &&
			SemVer.valid(pkg.version) ?
			SemVer.satisfies(pkg.version, versionRange) : true;
	}
};

function nodeModuleAddress(address) {
	var nodeModules = "/node_modules/",
		nodeModulesIndex = address.lastIndexOf(nodeModules);
	if(nodeModulesIndex >= 0) {
		return address.substr(0, nodeModulesIndex+nodeModules.length - 1 );
	}
}

function truthy(x) {
	return x;
}

var alwaysIgnore = {"steal-tools":1,"grunt":1,"grunt-cli":1};

function addDeps(packageJSON, dependencies, deps, type, defProps){
	var defaultProps = defProps;
	var config = utils.pkg.config(packageJSON);

	// convert an array to a map
	var npmIgnore = config && config.npmIgnore;
	var npmDependencies = config && config.npmDependencies;
	var ignoreType = npmIgnore && npmIgnore[type];

	function includeDep(name) {
		if(alwaysIgnore[name]) return false;

		if(!npmIgnore && npmDependencies) {
			return !!npmDependencies[name];
		}

		if(npmIgnore && npmDependencies) {
			return ignoreType ? !!npmDependencies[name] : !npmIgnore[name];
		}

		if(ignoreType) return false;

		return !!(!npmIgnore || !npmIgnore[name]);
	}

	defaultProps = defaultProps || {};
	var val;
	for(var name in dependencies) {
		if(includeDep(name)) {
			val = utils.extend({}, defaultProps);
			utils.extend(val, {name: name, version: dependencies[name]});
			deps[name] = val;
		}
	}
}

/**
 * Same as `addDeps` but it does not override dependencies already set
 */
function addMissingDeps(packageJson, dependencies, deps, type, defProps) {
	var without = {};

	for (var name in dependencies) {
		if (!deps[name]) {
			without[name] = dependencies[name];
		}
	}

	addDeps(packageJson, without, deps, type, defProps);
	return deps;
}

/**
 * A FetchTask is an *attempt* to load a package.json. It might fail
 * if there is a 404 or if the package we fetched is not the correct version.
 * In either of those cases we'll either:
 *
 * 1) If npm3 we'll first try to crawl from the most nested position
 * 2) If not npm3 (or we've already done #1) we'll traverse up the
 * node_modules folder structure.
 */
function FetchTask(context, pkg){
	this.context = context;
	this.pkg = pkg;
	this.orig = utils.extend({}, pkg);
	this.requestedVersion = pkg.version;
	this.failed = false;
}

utils.extend(FetchTask.prototype, {
	load: function(){
		// Get the fileUrl and pass to fetch
		// Check if the fileUrl is already loading
		// check if the fileUrl is already loaded
		// check if the fileUrl that is already loaded is semver compat
		var pkg = this.pkg;
		var fileUrl = pkg.fileUrl = pkg.nextFileUrl || pkg.origFileUrl;

		this.fileUrl = fileUrl;

		var promise = this.handleCurrentlyLoading() ||
			this.handleAlreadyLoaded();

		return promise || this.fetch(fileUrl);
	},

	fetch: function(fileUrl){
		var task = this;
		var pkg = this.pkg;
		var context = this.context;
		var loader = context.loader;

		context.paths[fileUrl] = pkg;
		context.loadingPaths[fileUrl] = this;

		this.promise = loader.fetch({
			address: fileUrl,
			name: fileUrl,
			metadata: {}
		})
		.then(function(src){
			task.src = src;

			if(!task.isCompatibleVersion()) {
				task.failed = true;
				task.error = new Error("Incompatible package version requested");

			}
			delete context.loadingPaths[fileUrl];
		}, function(err){
			task.error = err;
			task.failed = true;
			delete context.loadingPaths[fileUrl];
		});

		return this.promise;
	},

	/**
	 * Is the package fetched from this task a compatible version?
	 */
	isCompatibleVersion: function(pkg){
		var pkg = pkg || this.getPackage();
		var requestedVersion = this.requestedVersion;

		return SemVer.validRange(requestedVersion) &&
			SemVer.valid(pkg.version) ?
			SemVer.satisfies(pkg.version, requestedVersion) : true;
	},

	/**
	 * Get the package.json from this task.
	 */
	getPackage: function(){
		if(this._fetchedPackage) {
			return this._fetchedPackage;
		}
		this._fetchedPackage = crawl.processPkgSource(this.context,
													  this.pkg,
													  this.src);
		return this._fetchedPackage;
	},

	/**
	 * If this task had a loading error, like a 404
	 */
	hadErrorLoading: function(){
		return this.failed && !!this.error;
	},

	/**
	 * Handle the case where this fileUrl is already loading
	 */
	handleCurrentlyLoading: function(){
		// If a task is currently loading this fileUrl,
		// wait for it to complete
		var loadingTask = this.context.loadingPaths[this.fileUrl];
		if (!loadingTask) return;

		var task = this;
		return loadingTask.promise.then(function() {
			task._fetchedPackage = loadingTask.getPackage();

			var firstTaskFailed = loadingTask.hadErrorLoading();
			var currentTaskIsCompatible = task.isCompatibleVersion();
			var firstTaskIsNotCompatible = !loadingTask.isCompatibleVersion();

			// Do not flag the current task as failed if:
			//
			//	- Current task fetches a version in rage and
			//	- First task had no error loading at all or
			//	- First task fetched an incompatible version
			//
			// otherwise, assume current task will fail for the same reason as
			// the first did
			if (currentTaskIsCompatible && (!firstTaskFailed || firstTaskIsNotCompatible)) {
				task.failed = false;
				task.error = null;
			}
			else if (!currentTaskIsCompatible) {
				task.failed = true;
				task.error = new Error("Incompatible package version requested");
			}
			else if (firstTaskFailed) {
				task.failed = true;
				task.error = loadingTask.error;
			}
		});
	},

	/**
	 * Handle the case where this fileUrl has already loaded.
	 */
	handleAlreadyLoaded: function(){
		// If it is already loaded check to see if it's semver compatible
		// and if so use it. Otherwise reject.
		var loadedPkg = this.context.paths[this.fileUrl];
		if(loadedPkg) {
			this._fetchedPackage = loadedPkg;
			if(!this.isCompatibleVersion()) {
				this.failed = true;
			}
			return Promise.resolve();
		}
	},

	/**
	 * Get the next package to look up by traversing up the node_modules.
	 * Create a new pkg by extending the existing one
	 */
	next: function(){
		var pkg = utils.extend({}, this.orig);

		var isFlat = this.context.isFlatFileStructure;
		var fileUrl = this.pkg.fileUrl;

		if(isFlat && !pkg.__crawledNestedPosition) {
			pkg.__crawledNestedPosition = true;
			pkg.nextFileUrl = pkg.nestedFileUrl;
		}
		else {
			// make sure we aren't loading something we've already loaded
			var parentAddress = utils.path.parentNodeModuleAddress(fileUrl);

			if (!parentAddress) {
				var found = this.getPackage();

				if (!parentAddress) {
					var found = this.getPackage();

					var error = new Error("Unable to locate" + pkg.origFileUrl);
					error.didNotFindPkg = true;
					throw error;
				}
			}

			var nodeModuleAddress = parentAddress + "/" + pkg.name +
				"/package.json";

			pkg.nextFileUrl = nodeModuleAddress;
		}

		return pkg;
	}
});

crawl.FetchTask = FetchTask;

// Loads package.json
// if it finds one, it sets that package in paths
// so it won't be loaded twice.
function npmLoad(context, pkg, parentPkg){
	var task = new FetchTask(context, pkg);

	return task.load()
	.then(function(){
		if(task.failed) {
			// Recurse. Calling task.next gives us a new pkg object
			// with the fileUrl being the parent node_modules folder.
			return npmLoad(context, task.next(), parentPkg);
		}
		return task.getPackage();
	})
	.then(null, function(err) {
		if((err instanceof SyntaxError) && err.jsonSource) {
			var src = err.jsonSource;
			var loc = context.loader._parseJSONError(err, src);
			var msg = "Unable to parse package.json for [" + pkg.name + "]\n" +
				err.message;
			var newError = new SyntaxError(msg);
			return context.loader._addSourceInfoToError(newError, loc, {
				name: pkg.name,
				address: pkg.fileUrl,
				metadata: {},
				source: src
			}, "parse");
		} else if(err.didNotFindPkg) {
			var found = task.getPackage();

			var msg = "Unable to find [" + pkg.name + "] at " + pkg.origFileUrl + "\n\n" +
				"The package [" + parentPkg.name + "] requested " + pkg.version +
				(found ? " but we found " + found.version : "") + ".\n" +
				"Running `npm install` should install the version listed in your package.json.\n\n" +
				"See https://stealjs.com/docs/StealJS.error-messages.html#mismatched-package-version for more information.\n";

			var error = new Error(msg);
			error.stack = null;

			var src = JSON.stringify(parentPkg, null, " ");
			var idx = src.indexOf('"' + pkg.name + '"');
			var pos = context.loader._getLineAndColumnFromPosition(src, idx);
			var load = {
				address: parentPkg.origFileUrl,
				metadata: {},
				source: src
			};

			return context.loader._addSourceInfoToError(error, pos, load, '');
		} else {
			throw err;
		}
	});
}

module.exports = crawl;
