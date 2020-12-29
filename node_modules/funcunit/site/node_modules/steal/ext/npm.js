"format cjs";

// TODO: cleanup removing package.json
var utils = require('./npm-utils');
var convert = require("./npm-convert");
var crawl = require('./npm-crawl');
var npmLoad = require("./npm-load");
var isNode = typeof process === "object" &&
	{}.toString.call(process) === "[object process]";

// SYSTEMJS PLUGIN EXPORTS =================

/**
 * @function translate
 * @description Convert the package.json file into a System.config call.
 * @signature `translate(load)`
 * @param {Object} load Load object
 * @return {Promise} a promise to resolve with the load's new source.
 */
exports.translate = function(load){
	var loader = this;

	// This could be an empty string if the fetch failed.
	if(load.source == "") {
		return "define([]);";
	}

	var resavePackageInfo = isNode && loader.isEnv &&
		!loader.isEnv("production");
	var prevPackages = loader.npmContext && loader.npmContext.pkgInfo;
	var context = {
		packages: [],
		loader: this,
		// places we load package.jsons from
		paths: {},
		// paths that are currently be loaded
		loadingPaths: {},
		versions: {},
		fetchCache: {},
		deferredConversions: {},
		npmLoad: npmLoad,
		crawl: crawl,
		resavePackageInfo: resavePackageInfo,
		forwardSlashMap: {}
	};
	this.npmContext = context;
	var pkg = {origFileUrl: load.address, fileUrl: utils.relativeURI(loader.baseURL, load.address)};
	crawl.processPkgSource(context, pkg, load.source);
	if(pkg.system && pkg.system.npmAlgorithm === "flat") {
		context.isFlatFileStructure = true;
	}

	return crawl.deps(context, pkg, true).then(function(){
		// clean up packages so everything is unique
		var names = {};
		var packages = context.pkgInfo = [];
		utils.forEach(context.packages, function(pkg, index){
			if(!packages[pkg.name+"@"+pkg.version]) {
				if(pkg.browser){
					delete pkg.browser.transform;
				}
				packages.push({
					name: pkg.name,
					version: pkg.version,
					fileUrl: utils.path.isRelative(pkg.fileUrl) ?
						pkg.fileUrl :
						utils.relativeURI(context.loader.baseURL, pkg.fileUrl),
					main: pkg.main,
					system: convert.system(context, pkg, pkg.system, index === 0),
					globalBrowser: convert.browser(pkg, pkg.globalBrowser),
					browser: convert.browser(pkg, pkg.browser || pkg.browserify),
					jspm: convert.jspm(pkg, pkg.jspm),
					jam: convert.jspm(pkg, pkg.jam),
					resolutions: {}
				});
				packages[pkg.name+"@"+pkg.version] = true;
			}
		});

		var source = npmLoad.makeSource(context, pkg);

		npmLoad.addExistingPackages(context, prevPackages);

		return source;
	});
};
