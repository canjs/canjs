/**
 * Naming bundles
 *
 * for naming rules see .md file
 */

var crypto = require("crypto");
var npmUtils = require("steal/ext/npm-utils");
var isNpm = npmUtils.moduleName.isNpm;
var parseModuleName = npmUtils.moduleName.parse;

/**
 * remove the filetype from a
 *
 * @param modulePath
 * @returns {*}
 */
var removeFiletype = function(modulePath) {
	if(modulePath.lastIndexOf('.') !== -1) {
		modulePath = modulePath.substr(0, modulePath.lastIndexOf('.'));
	}
	return modulePath;
};

/**
 * get the last part of a module path
 * if a npm package is provided
 * e.g.
 * main/bar/foo => foo
 * packagename@1.0.0#foo/bar => bar
 *
 * @param uri
 * @returns {string}
 */
var filename = function (uri) {
	var lastSlash = uri.lastIndexOf("/");
	var sub;
	if (lastSlash == -1) {
		sub = uri;
	} else {
		sub = uri.substr(lastSlash + 1);
	}
	sub = sub.toLowerCase();
	var parsed = parseModuleName(sub);
	var path = removeFiletype(parsed.modulePath || sub);
	var matches = path.match(/^[\w-\s\.]+/);
	return matches ? matches[0] : "";
};

/**
 * return the plugin part
 *
 * @param name
 * @returns {string}
 */
var pluginPart = function (name) {
	var bang = name.lastIndexOf("!");
	if (bang !== -1) {
		return name.substr(bang + 1);
	}
};

/**
 * return the plugin resource
 *
 * @param name
 * @returns {string}
 */
var pluginResource = function (name) {
	var bang = name.lastIndexOf("!");
	if (bang !== -1) {
		return name.substr(0, bang);
	}
};

/**
 *
 * @param bundle
 * @returns {string}
 */
function makeGetName() {

	var bundleCounter = 0;
	var usedBundleNames = {};

	if(arguments.length === 1){
		return getName(arguments[0]);
	}else{
		return getName;
	}


	/**
	 * get a unique name, based on bundleCounter
	 *
	 * @param dirName
	 * @param shortened
	 * @param buildTypeSuffix
	 * @returns {string}
	 */
	function getUniqueName(dirName, shortened, buildTypeSuffix) {
		if (!usedBundleNames[dirName + shortened + buildTypeSuffix]) {
			return dirName + shortened + buildTypeSuffix + "";
		}else {
			return dirName + shortened + "-" + (bundleCounter++) + buildTypeSuffix + "";
		}
	}

	/**
	 * get the name of a bundle
	 *
	 * @param bundle
	 * @returns {string}
	 */
	function getName(bundle) {

		/**
		 * add a prototype method to String
		 *
		 * @param whatever
		 * @returns {string}
		 */
		if(!String.prototype.removeTrailing) {
			String.prototype.removeTrailing = function (whatever) {
				var result = this;
				if (this.substr((-1 * whatever.length)) === whatever) {
					result = this.substr(0, this.length - (1 * whatever.length));
				}
				return result + "";
			};
		}

		var dirName = "bundles/",
			shortened,
			bundleName;

		// remove trailing and leading parts
		var bundleNames = bundle.bundles.map(function(appName){
			appName = appName.trim().removeTrailing('/');
			return appName;
		});

		// If this is a "main" bundle
		if (bundle.bundles.length === 1) {
			// main module
			shortened = bundleNames[0];

			if(pluginPart(shortened)) {
				shortened = pluginResource(shortened);
			}

			// for the shortened we only want the path of the module
			if(isNpm(shortened)) {
				var parsed = parseModuleName(shortened);
				shortened = removeFiletype(parsed.modulePath);
				dirName += parsed.packageName + "/";

				// no npm module !
			}else{
				shortened = removeFiletype(shortened);
			}

			// if multiple bundles and very long concatenated name
		} else if (bundle.bundles.length > 1) {

			// concat multiple bundles into one shortened filename,
			// for that use only the last part of each modulepath
			shortened = bundleNames.map(function(l){
				return filename(l);
			}).join('-');

			// we dont care about naming rules
			// we add the bundles into the bundles config
			shortened = shortened.replace(/[^\w\-_]/g, "-").replace(/-{2,}/g, '-');

			if(shortened.length > 25) {
				var hasher = crypto.createHash("md5");
				hasher.update(shortened);
				var shortenedHash = hasher.digest('hex');
				shortened = shortened.substr(0, 16) + "-" + shortenedHash.substr(0, 8);
			}

		}

		var buildType = bundle.buildType || "js",
			buildTypeSuffix = buildType === "js" ? "" : "."+buildType+"!";

		// delete the String prototype method
		delete String.prototype.removeTrailing;


		if(bundle.bundles.length === 1) {
			// we dont want do rewrite a main module
			bundleName = dirName + shortened + buildTypeSuffix;

		} else {
			bundleName = getUniqueName(dirName, shortened, buildTypeSuffix);
		}

		usedBundleNames[bundleName] = true;

		return bundleName;
	}

}

exports = module.exports = function(bundles) {

	var getName = makeGetName();

	bundles.forEach(function(bundle){
		bundle.name = getName(bundle);
	});

};

exports.getName = function(bundle) {
	return makeGetName(bundle);
};
