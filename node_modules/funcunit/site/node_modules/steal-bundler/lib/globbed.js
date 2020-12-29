var asap = require("pdenodeify");
var fs = require("fs-extra");
var glob = require("glob");
var path = require("path");
var copy = asap(fs.copy);

module.exports = bundleAssets;

function bundleAssets(buildResult, options){
	var globs = toArray(options.glob);

	var promises = globs.map(function(pattern){

		return asap(glob)(pattern).then(function(files){

			return Promise.all(copyFiles(buildResult, files));

		});

	});

	return Promise.all(promises);
}

function toArray(thing){
	if(!thing) return [];
	if(Array.isArray(thing)) return thing;
	return [thing];
}

function copyFiles(buildResult, files){
	var bundlesPath = buildResult.configuration.bundlesPath;
	var dist = path.dirname(bundlesPath);

	return files.map(function(file){
		var dest = path.join(
			bundlesPath,
			path.relative(dist, file)
		);

		return copy(file, dest);
	});
}
