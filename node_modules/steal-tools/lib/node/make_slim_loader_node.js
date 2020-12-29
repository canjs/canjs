var prettier = require("prettier");
var endsWith = require("lodash/endsWith");
var getNodeSource = require("./source").node;
var makeLoaderTemplate = require("./slim/make_loader_template");

module.exports = function makeSlimLoaderNode(options) {
	var modules = options.nodes.slice(0);

	var template = makeLoaderTemplate({
		target: options.target,
		plugins: options.plugins,
		bundleId: options.bundleId,
		splitLoader: options.splitLoader,
		progressive: options.progressive,
		sharedBundles: options.sharedBundles,
		extensions: options.slimConfig.extensions.length,
		resolve: options.slimConfig.identifiersToResolve.length,
		entryPointSharedBundles: options.entryPointSharedBundles
	});

	var args = modules
		.map(function(node) {
			var code = getNodeSource(node).code.toString();
			return endsWith(code, ";") ? code.substring(0, code.length - 1) : code;
		})
		.join(",");

	var code = prettier.format(
		template({
			args: args,
			bundleId: options.bundleId,
			mainModuleId: options.mainModuleId
		}),
		{ useTabs: true }
	);

	return {
		load: {
			source: code,
			name: "[slim-loader-shim]",
			metadata: { format: "global" }
		},
		dependencies: [],
		deps: []
	};
};
