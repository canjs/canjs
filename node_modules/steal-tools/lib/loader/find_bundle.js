var path = require("path");
var glob = require("globby").sync;

module.exports = findBundles;

/**
 * @module {Function} findBundles
 * @description Find all of the bundles belonging to a loader.
 * @param {Loader} loader
 * @return {Array.<moduleName>}
 */
function findBundles(loader) {
	var globbyOptions = {
		expandDirectories: false,
		cwd: ""+((loader.directories && loader.directories.lib) ? path.join(loader.baseURL, loader.directories.lib) : path.join(loader.baseURL)).replace("file:", "")
	};

	var plain = [],
		globs = [],
		bundles = [];

	if(Array.isArray(loader.bundle)) {
		loader.bundle.reduce(function ([plain, globs], bundle) {
			split(bundle, plain, globs);
			return [plain, globs];
		}, [plain, globs]);

	} else if(typeof loader.bundle === "string") {
		split(loader.bundle, plain, globs);

	}else{
		return [];
	}

	var pattern = [];
	if (globs.length > 0) {
		var out = [];

		pattern = globs.map(function (bundlePattern) {
			return substitute(bundlePattern, loader);
		});

		pattern = groupPatterns(pattern);

		pattern.forEach(pattern => {
			var trailingSlash = typeof pattern === "string" && pattern.endsWith("/");

			bundles = glob(pattern, Object.assign({}, globbyOptions)).forEach(function (bundle) {
				bundle = minusJS(bundle);
				if(trailingSlash && !isModlet(bundle)) {
					return;
				}
				if(loader.npmContext) {
					var app = loader.npmContext.pkgInfo[0];
					bundle = app.name + "/" + bundle;
				}
				out.push(bundle);
			});
		});

		return [].concat(plain, out);

	} else {
		return plain;
	}
}

// Remove the .js extension to make these proper module names.
function minusJS(name) {
	var idx = name.indexOf(".js");
	return idx === -1 ? name : name.substr(0, idx);
}

function isModlet(name) {
	return /\/(.+)\/\1$/.test(name);
}

function startsWith(prefix, path) {
	return path.substr(0,prefix.length) === prefix;
}

function split(bundle, plain, globs) {
	if(bundle.indexOf("*") > 0){
		globs.push(bundle);
	}else{
		plain.push(bundle);
	}
}

function groupPatterns(pattern) {
	var current, last, i = 0, out = [];
	while(i < pattern.length) {
		current = pattern[i];

		if(last && current[0] === "!") {
			out.pop();
			out.push([last, current]);
		} else {
			out.push(current);
		}

		last = current;
		i++;
	}
	return out;
}

function substitute(bundle, loader) {
	if(loader.npmContext) {
		var negation = false;
		if (startsWith("!", bundle)){
			bundle = bundle.substr(1);
			negation = true;
		}

		// first pkgInfo should be the package.json and provide some info about the app
		var app = loader.npmContext.pkgInfo[0];

		// if the module starts with tilde ~, remove it because glob can't handle it
		if (startsWith("~/", bundle)) {
			// remove ~/
			bundle = bundle.substr(2);

		} else if (startsWith(app.name + "/", bundle)) {
			// if the pattern starts with the appName like
			// "npm-bundle/site/site4.js" remove it
			bundle = bundle.substr((app.name + "/").length);
		}

		if(negation){
			bundle = "!"+bundle;
		}
	}

	return bundle;
}
