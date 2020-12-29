var path = require("path");
var uniq = require("lodash.uniq");
var fs = require("fs-extra");
var asap = require("pdenodeify");
var removeDots = require("./remove_dots");

module.exports = bundleAssets;

var handlers = {
	css: require("./css")
};

var pluginExp = /\!.*/;


function bundleAssets(buildResult, options){
	var dest = buildResult.configuration.dest;
	var bundlesPath = buildResult.configuration.bundlesPath;
	var bundles = buildResult.bundles;
	var movedAssets = [];

	var promises = bundles.map(function(bundle){
		var buildType = bundle.buildType;
		var bundleName = bundle.name;
		var bundlePath = path.join(bundlesPath, bundleName.replace(pluginExp, "").replace("bundles/", ""));

		var handler = handlers[buildType];

		if(handler) {
			var assets = uniq(handler.find(bundle), "path");
			var toMove = [];
			assets.forEach(function(asset){
				asset.src = path.join(path.dirname(bundlePath), asset.path);
				asset.dest = path.join(dest, removeDots(asset.path));
				// Maintain a list of assets that have been moved so we only move them once
				if(movedAssets.indexOf(asset.dest) === -1) {
					toMove.push(asset);
					movedAssets.push(asset.dest);
				}
			});

			// move around the assets
			return moveAssets(toMove).then(function(){
				// rewrite the original bundle content so that the urls
				// are pointed at the correct, production, location.
				return rewriteContent(bundle, bundlePath, handler, assets);
			});
		}
	});

	return Promise.all(promises);
}

function moveAssets(assets){
	return Promise.all(
		assets.map(function(asset){
			return asap(fs.copy)(asset.src, asset.dest);
		})
	);
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
