"format cjs";

var utils = require('./npm-utils');
var convert = require("./npm-convert");
var crawl = require('./npm-crawl');
var npmLoad = require("./npm-load");
var isNode = typeof process === "object" &&
	{}.toString.call(process) === "[object process]";

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

	var resavePackageInfo = isNode && !loader.isEnv("production");
	var isBuild = loader.isPlatform("build");

	var prevPackages = loader.npmContext && loader.npmContext.pkgInfo;
	var versions = loader.npmContext && loader.npmContext.versions;

	var context = {
		packages: [],
		pkgInfo: [],
		loader: this,
		// places we load package.jsons from
		paths: {},
		// paths that are currently be loaded
		loadingPaths: {},
		versions: utils.extend({}, versions),
		// A map of packages to its parents. This is used so that
		// we can find a package by name and get its parent packages,
		// in order to load bare module specifiers that refer to packages
		// that are not listed as dependencies
		packageParents: {},
		fetchCache: {},
		deferredConversions: {},
		npmLoad: npmLoad,
		crawl: crawl,
		convert: convert,
		resavePackageInfo: resavePackageInfo,
		applyBuildConfig: isBuild,
		forwardSlashMap: {},
		// default file structure for npm 3 and higher
		isFlatFileStructure: true
	};
	this.npmContext = context;
	var pkg = {origFileUrl: load.address, fileUrl: utils.relativeURI(loader.baseURL, load.address)};
	crawl.processPkgSource(context, pkg, load.source);
	var pkgVersion = context.versions[pkg.name] = {};
	pkgVersion[pkg.version] = context.versions.__default = pkg;

	if (!pkg.name) {
		throw new Error([
			"Missing 'name' field in package.json file",
			"See https://docs.npmjs.com/files/package.json#name"
		].join("\n"));
	}

	if (!pkg.version) {
		throw new Error([
			"Missing 'version' field in package.json file",
			"See https://docs.npmjs.com/files/package.json#version"
		].join("\n"));
	}

	// backwards compatible for < npm 3
	var steal = utils.pkg.config(pkg) || {};

	if(steal.npmAlgorithm === "nested"){
		context.isFlatFileStructure = false;
	}else{
		steal.npmAlgorithm = "flat";
	}

	pkg.steal = steal;

	return crawl.root(context, pkg, true).then(function(){
		// clean up packages so everything is unique
		var names = {};
		var packages = context.pkgInfo;
		utils.forEach(context.packages, function(npmPkg, index){
			var pkg = npmPkg;
			if(!packages[pkg.name+"@"+pkg.version]) {
				if(pkg.browser){
					delete pkg.browser.transform;
				}
				pkg = utils.json.transform(loader, load, pkg);

				var conv = convert.steal(context, pkg, pkg.steal, index === 0);

				// When packages load, apply their configuration
				convert.updateConfigOnPackageLoad(conv, resavePackageInfo,
					true, isBuild);

				packages.push({
					name: pkg.name,
					version: pkg.version,
					fileUrl: utils.path.isRelative(pkg.fileUrl) ?
						pkg.fileUrl :
						utils.relativeURI(context.loader.baseURL, pkg.fileUrl),
					main: pkg.main,
					steal: conv.steal,
					globalBrowser: convert.browser(pkg, pkg.globalBrowser),
					browser: convert.browser(pkg, pkg.browser || pkg.browserify),
					jspm: convert.jspm(pkg, pkg.jspm),
					jam: convert.jspm(pkg, pkg.jam),
					resolutions: {}
				});
				packages[pkg.name+"@"+pkg.version] = true;
			}
		});

		npmLoad.addExistingPackages(context, prevPackages);
		var source = npmLoad.makeSource(context, pkg);

		return source;
	});
};
