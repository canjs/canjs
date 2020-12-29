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
	 * @param {String} source
	 * @return {NpmPackage}
	 */
	processPkgSource: function(context, pkg, source) {
		var packageJSON = JSON.parse(source);
		utils.extend(pkg, packageJSON);
		context.packages.push(pkg);
		return pkg;
	},
	/**
	 * Crawls the packages dependencies
	 * @param {Object} context
	 * @param {NpmPackage} pkg
	 * @param {Boolean} [isRoot] If the root module's dependencies shoudl be crawled.
	 * @return {Promise} A promise when all packages have been loaded
	 */
	deps: function(context, pkg, isRoot) {
	
		var deps = crawl.getDependencies(context.loader, pkg, isRoot);

		return Promise.all(utils.filter(utils.map(deps, function(childPkg){
			return crawl.fetchDep(context, pkg, childPkg, isRoot);
		}), truthy)).then(function(packages){
			// at this point all dependencies of pkg have been loaded, it's ok to get their children
			
			// TODO exception for steal-builtins
			return Promise.all(utils.map(packages, function(childPkg){
				if(childPkg && childPkg.name === 'steal-builtins') {
					return crawl.deps(context, childPkg);
				}
			})).then(function(){
				return packages;
			});
		});
	},

	dep: function(context, pkg, refPkg, childPkg, isRoot) {
		var versionAndRange = childPkg.name+"@"+childPkg.version;
		if(context.fetchCache[versionAndRange]) {
			return context.fetchCache[versionAndRange];
		}

		childPkg = utils.extend({}, childPkg);

		var p = context.fetchCache[versionAndRange] =
			crawl.fetchDep(context, pkg, childPkg, isRoot);

		p = Promise.resolve(p).then(function(result){
			// Package already being fetched
			if(result === undefined) {
				var fetchedPkg = crawl.matchedVersion(context, childPkg.name,
													  childPkg.version);
				return fetchedPkg;
			} else {
				childPkg = result;
			}

			// Save this pkgInfo into the context
			var localPkg = convert.toPackage(context, childPkg);

			convert.forPackage(context, childPkg);
			
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
		return npmLoad(context, childPkg, requestedVersion)
		.then(function(pkg){
			crawl.setVersionsConfig(context, pkg, requestedVersion);
			return pkg;
		});
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
	 * @return {Object<String,Range>} A map of dependency names and requested version ranges.
	 */
	getDependencyMap: function(loader, packageJSON, isRoot){
		var system = packageJSON.system;
		// convert npmIgnore
		var npmIgnore = system && system.npmIgnore;
		function convertToMap(arr) {
			var npmMap = {};
			for(var i = 0; i < arr.length; i++) {
				npmMap[arr[i]] = true;
			}
			return npmMap;
		}
		if(npmIgnore && typeof npmIgnore.length === 'number') {
			npmIgnore = packageJSON.system.npmIgnore = convertToMap(npmIgnore);
		}
		// convert npmDependencies
		var npmDependencies = system && system.npmDependencies;
		if(npmDependencies && typeof npmDependencies.length === "number") {
			packageJSON.system.npmDependencies = convertToMap(npmDependencies);
		}
		npmIgnore = npmIgnore || {};
		
		var deps = {};

		addDeps(packageJSON, packageJSON.peerDependencies || {}, deps,
				"peerDependencies", {_isPeerDependency: true});

		addDeps(packageJSON, packageJSON.dependencies || {}, deps, "dependencies");

		if(isRoot) {
			addDeps(packageJSON, packageJSON.devDependencies || {}, deps,
				   "devDependencies");
		}

		return deps;
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
			if(SemVer.valid(pkg.version) &&
			   SemVer.satisfies(pkg.version, requestedVersion)) {
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
				} else {
					return curAddress;
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
		if(pkg.system) {
			var ignoredConfig = ["bundle", "configDependencies", "transpiler"];

			// don't set system.main
			var main = pkg.system.main;
			delete pkg.system.main;
			utils.forEach(ignoredConfig, function(name){
				delete pkg.system[name];
			});
			loader.config(pkg.system);
			pkg.system.main = main;

		}
		if(pkg.globalBrowser) {
			setGlobalBrowser(pkg.globalBrowser, pkg);
		}
		var systemName = pkg.system && pkg.system.name;
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

var alwaysIgnore = {"steal": 1,"steal-tools":1,"bower":1,"grunt":1, "grunt-cli": 1};

function addDeps(packageJSON, dependencies, deps, type, defaultProps){
	// convert an array to a map
	var npmIgnore = packageJSON.system && packageJSON.system.npmIgnore;
	var npmDependencies = packageJSON.system && packageJSON.system.npmDependencies;
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
		if(loadingTask) {
			var task = this;
			return loadingTask.promise.then(function(){
				if(loadingTask.hadErrorLoading()) {
					task.error = loadingTask.error;
					task.failed = true;
				} else {
					task._fetchedPackage = loadingTask.getPackage();
					if(!task.isCompatibleVersion()) {
						task.failed = true;
					}
				}
			});
		}
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
		var context = this.context;

		if(isFlat && !pkg.__crawledNestedPosition) {
			pkg.__crawledNestedPosition = true;
			pkg.nextFileUrl = pkg.nestedFileUrl;
		}
		else {
			// make sure we aren't loading something we've already loaded
			var parentAddress = utils.path.parentNodeModuleAddress(fileUrl);
			if(!parentAddress) {
				throw new Error('Did not find ' + pkg.origFileUrl);
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
function npmLoad(context, pkg){
	var task = new FetchTask(context, pkg);

	return task.load().then(function(){
		if(task.failed) {
			// Recurse. Calling task.next gives us a new pkg object
			// with the fileUrl being the parent node_modules folder.
			return npmLoad(context, task.next());
		}
		return task.getPackage();
	});
}

module.exports = crawl;
