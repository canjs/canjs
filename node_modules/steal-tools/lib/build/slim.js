/*jshint funcscope:true*/
var pump = require("pump");
var arrify = require("../arrify");
var assign = require("lodash/assign");
var difference = require("lodash/difference");
var makeDeferred = require("../make-deferred");
var isUndefined = require("lodash/isUndefined");
var assignDefaultOptions = require("../assign_default_options");

// streams
var buildType = require("../stream/build_type");
var bundle = require("../stream/bundle");
var envify = require("../stream/envify");
var minify = require("../stream/minify");
var slimBundles = require("../stream/slim");
var transpile = require("../stream/transpile");
var concat = require("../bundle/concat_stream");
var addModuleIds = require("../stream/add_module_ids");
var addBundleIds = require("../stream/add_bundle_ids");
var filterGraph = require("../stream/filter_slim_graph");
var addPluginNames = require("../stream/add_plugin_names");
var addAtStealShim = require("../stream/add_steal_shim");
var addAtLoaderShim = require("../stream/add_loader_shim");
var loadNodeBuilder = require("../stream/load_node_builder");
var convertSlimConfig = require("../stream/convert_slim_config");
var adjustBundlesPath = require("../stream/adjust_bundles_path");
var write = require("../bundle/write_bundles").createWriteStream;
var writeBundlesManifest = require("../stream/write_bundle_manifest");
var graph = require("../graph/make_graph_with_bundles").createBundleGraphStream;
var treeshake = require("../stream/treeshake");

module.exports = function(cfg, opts) {
	var config = cfg !== undefined ? cfg : {};
	var options = opts !== undefined ? opts : {};

	var slimDfd = makeDeferred();
	var supportedTargets = ["web", "node", "worker"];

	// minification is on by default
	assign(options, {
		minify: isUndefined(options.minify) ? true : options.minify
	});

	try {
		options = assignDefaultOptions(config, options);
	} catch (err) {
		return Promise.reject(err);
	}

	// fail early if an unknown target is passed in
	var targets = arrify(options.target);
	if (difference(targets, supportedTargets).length) {
		var unknown = difference(targets, supportedTargets);
		return Promise.reject(
			new Error(
				`Cannot create slim build, target(s) ${unknown.join(",")} not supported`
			)
		);
	}

	var initialStream = pump(
		graph(config, options),
		buildType("optimize"),
		treeshake(),
		filterGraph(),
		addAtStealShim(),
		addAtLoaderShim(),
		addModuleIds(),
		convertSlimConfig(),
		loadNodeBuilder(),
		transpile({
			outputFormat: "slim",
			keepInGraph: ["@steal", "@loader"]
		}),
		envify(),
		bundle(),
		addPluginNames(),
		addBundleIds(),
		function(err) {
			if (err) slimDfd.reject(err);
		}
	);

	var promises = (targets.length ? targets : [""]).map(function(target) {
		var dfd = makeDeferred();

		var final = pump(
			initialStream,
			adjustBundlesPath({ target: target }), // the "" target is relevant for this transform
			slimBundles({ target: target || "web" }), // set default target so there is no need to handle ""
			concat(),
			minify(),
			write(),
			writeBundlesManifest(),
			function(err) {
				if (err) dfd.reject(err);
			}
		);

		final.on("data", function (builtResult) {
			// run external steal-tool plugins after the build
			if (options) {
				var p = Promise.resolve(builtResult);

				if (options.bundleAssets) {
					var bundleAssets = require("steal-bundler");
					p = p.then(function (builtResult) {
						return bundleAssets(builtResult, options.bundleAssets);
					});
				}
			}

			p.then(function (builtResult) {
				dfd.resolve(builtResult);
			}).catch(function (error) {
				dfd.reject(error);
			});
		});
		return dfd.promise;
	});

	Promise.all(promises).then(
		// If no `target` is provided resolves `buildResult`; otherwise
		// resolves an object where the key is the target name and its value
		// the `buildResult` object.
		function(results) {
			var value;

			if (targets.length) {
				value = {};
				results.forEach(function(result, index) {
					value[targets[index]] = result;
				});
			} else {
				value = results[0];
			}

			slimDfd.resolve(value);
		},
		slimDfd.reject
	);

	return slimDfd.promise;
};
