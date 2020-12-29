var asap = require("pdenodeify");
var fs = require("fs-extra");
var glob = require("glob");
var minimatch = require("minimatch");
var path = require("path");
var uniq = require("lodash.uniq");
var removeDots = require("./remove_dots");
var copy = asap(fs.copy);

module.exports = bundleAssets;

var handlers = {
	css: require("./css")
};

var pluginExp = /\!.*/;


function bundleAssets(buildResult, options){
	var globs = toArray(options.glob);
	var globOpts = { nodir: true };
	var globBasePath = path.resolve() + '/';
	var dest = buildResult.configuration.dest;
	var bundlesPath = buildResult.configuration.bundlesPath;
	var bundles = buildResult.bundles;
	var promises = [];

	// rewrite paths in bundles to files matching the globs we are moving
	promises.push.apply(promises, bundles.map(function(bundle){
		var buildType = bundle.buildType;
		var bundleName = bundle.name;
		var bundlePath = path.join(
			bundlesPath,
			bundleName.replace(pluginExp, "").replace("bundles/", "")
		);
		var handler = handlers[buildType];

		if(handler) {
			var assets = uniq(handler.find(bundle), "path");
			var toRewrite = [];

			assets.forEach(function(asset){
				asset.src = path.join(path.dirname(bundlePath), asset.path);
				asset.dest = path.join(dest, removeDots(asset.path));

				var globBaseRelativePath = asset.src.replace(globBasePath, '');

				for (var i = 0; i < globs.length; i++) {
					if (minimatch(globBaseRelativePath, globs[i], globOpts)) {
						toRewrite.push(asset);
						break;
					}
				}
			});

			// rewrite the original bundle content so that the urls
			// are pointed at the correct, production, location for assets
			// matching the glob
			return rewriteContent(bundle, bundlePath, handler, toRewrite);
		}
	}));

	// move files matching the globs
	promises.push.apply(promises, globs.map(function(pattern){

		return asap(glob)(pattern, globOpts).then(function(files){

			return Promise.all(copyFiles(buildResult, files));

		});

	}));

	return Promise.all(promises);
}

function toArray(thing){
	if(!thing) return [];
	if(Array.isArray(thing)) return thing;
	return [thing];
}

function copyFiles(buildResult, files) {
	var dest = buildResult.configuration.dest;

	return files.map(function(file) {
		var to = path.join(dest, removeDots(path.relative(dest, file)));
		return copy(file, to);
	});
}

function rewriteContent(bundle, bundlePath, handler, assets){
	return asap(fs.readFile)(bundlePath, "utf8").then(function(content){
		var newContent = handler.rewrite(content, bundlePath, assets);

		if(newContent !== content) {
			// Overwrite the content
			return asap(fs.writeFile)(bundlePath, newContent, "utf8");
		}
	});
}
