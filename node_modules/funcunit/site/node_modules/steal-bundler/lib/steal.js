var fs = require("fs-extra");
var path = require("path");
var asap = require("pdenodeify");

module.exports = bundle;

function bundle(buildResult){
	var config = buildResult.configuration;
	var bundlesPath = config.bundlesPath;

	var stealInfo = getStealPath(buildResult, config);

	return asap(fs.readFile)(stealInfo.src, "utf8").then(function(content){
		var stealJs = insertConfig(bundlesPath, content);

		return asap(fs.outputFile)(stealInfo.dest, stealJs, "utf8");
	});

}

function getStealPath(buildResult, config){
	var bundlesPath = config.bundlesPath;
	var bundleSteal = !!config.options.bundleSteal;

	if(bundleSteal) {
		var mainPath = path.join(bundlesPath, buildResult.bundles[0].name.replace("bundles/", "") + ".js");

		return {
			src: mainPath,
			dest: mainPath
		};
	}

	var configMain = buildResult.loader.configMain;
	var prefix = "";

	if(configMain.indexOf("package.json!npm") >= 0)
		prefix = "node_modules/steal/";
	else if(configMain.indexOf("bower.json!bower") >= 0)
		prefix = "bower_components/steal/";

	var stealProject = require.resolve("steal");

	var stealPath = path.join(
		path.dirname(stealProject),
		"steal.production.js"
	);

	return {
		src: stealPath,
		dest: path.join(
			path.dirname(bundlesPath),
			path.join(prefix, "steal.production.js")
		)
	};
}

function insertConfig(bundlesPath, content){
	bundlesPath = path.basename(bundlesPath);

	return "if(typeof steal === \"undefined\") steal = {};\n" +
		"steal.bundlesPath = \""+ bundlesPath + "\";\n" + content;
}

function writeSteal(){

}
