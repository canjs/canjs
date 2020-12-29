var makeStealNode = require("../node/make_steal_node"),
	makeNode = require("../node/make_node"),
	prettier = require("prettier");

// makes it so this bundle loads steal
module.exports = function(options) {
	var main = options.main;
	var bundle = options.bundle;
	var configuration = options.configuration;

	bundle.nodes.unshift(
		makeProductionConfigNode(main, configuration),
		options.bundlePromisePolyfill ?
			makeStealNode.withPromises() :
			makeStealNode.withoutPromises(),
		makeDefineNode()
	);

	bundle.nodes.push(
		makeNode(
			"[import-main-module]",
			prettier.format(
				`System["import"]("${configuration.configMain}")
				.then(function() {
					System["import"]("${main}")
				});`,
				{ useTabs: true }
			)
		)
	);
};

function makeProductionConfigNode(main, configuration){
	var configString = "steal = " + browserGlobal + ".steal || {};\n" +
		"steal.stealBundled = true;\n" +
		"steal.loadBundles = true;\n" +
		"steal.baseURL = './';\n" +
		"steal.configMain = \"" + configuration.configMain + "\";\n" +
		"steal.main = \"" + main + "\";";
	return makeNode("[production-config]", configString);
}

function makeDefineNode(){
	return makeNode("[add-define]", browserGlobal + ".define = System.amdDefine;");
}

var browserGlobal = "((typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) ? self : window)";
