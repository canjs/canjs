var asap = require("pdenodeify");
var path = require("path");
var through = require("through2");
var fs = require("fs-extra");
var npmUtils = require("steal/ext/npm-utils");
var tags = require("common-tags");

module.exports = function(){
	return through.obj(function(data, enc, done){
		addConfiguredSteal(data)
		.then(function(){
			done(null, data);
		}, function(err){
			done(err);
		});
	});
};

function addConfiguredSteal(data) {
	var options = data.options;
	var configuration = data.configuration;

	var stealFilename = options.bundlePromisePolyfill ?
		"steal-with-promises.production.js" :
		"steal.production.js";

	var stealProductionDest = path.join(configuration.dest, stealFilename);

	// Don't do this if we are bundling steal
	if (options.bundleSteal) {
		return Promise.resolve();
	}

	var stealProject = require.resolve("steal");
	var stealPath = path.join(path.dirname(stealProject), stealFilename);

	return asap(fs.readFile)(stealPath, "utf8")
	.then(function(src){
		return appendConfig(src, data);
	})
	.then(function(src){
		return asap(fs.outputFile)(stealProductionDest, src, "utf8");
	});
}

function appendConfig(src, data) {
	var main = data.mains[0];
	var configMain = data.steal.System.configMain;

	var configSrc = tags.stripIndent`
		if(typeof steal === "undefined") steal = {};
		steal.bundlesPath = "bundles";
		steal.main = "${ denormalize(main) }";
		steal.configMain = "${ configMain }";
		steal.loadMainOnStartup = true;
	`;

	return configSrc + "\n" + src;
}

function denormalize(name) {
	if(npmUtils.moduleName.isNpm(name)) {
		var parsed = npmUtils.moduleName.parse(name);
		name = parsedToFriendly(parsed);

		if(parsed.plugin) {
			var parsedPlugin = npmUtils.moduleName.parse(parsed.plugin.substr(1));
			name += "!" + parsedToFriendly(parsedPlugin);
		}
	}
	return name;
}

function parsedToFriendly(parsed) {
	var name = parsed.packageName + "/" + parsed.modulePath;
	return name;
}
