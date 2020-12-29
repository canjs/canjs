var transpile = require("transpile");
var minify = require("../build_types/minify_js").sync;
var processBabelPlugins = require("../process_babel_plugins");
var processBabelPresets = require("../process_babel_presets");
var nodeDependencyMap = require("../node/dependency_map");
var transformActiveSource = require("../node/transform_active_source");

var normalizeId = 0;
var cid = function(func){
	if(!func._cid) {
		return (func._cid = (++normalizeId));
	} else {
		return func._cid;
	}
};

var key = function(options,format) {
	var clone = {
		useNormalizedDependencies: options.useNormalizedDependencies
	};
	if(options.normalize) {
		clone.normalize = cid(options.normalize);
	}
	return "format-"+format+"-"+JSON.stringify(clone);
};

function isOptimizedBuild(options) {
	return options.buildType === "optimize";
}

function isJavaScriptNode(node) {
	return !node.load.metadata.buildType || node.load.metadata.buildType === "js";
}

var transpileNode = function(node, outputFormat, options, graph, loader){
	var name = node.load.name;

	if (isJavaScriptNode(node)) {
		// Nodes can provide their own `translate` function as part of metadata.
		if(loader.meta[name] && loader.meta[name].translate) {
			transformActiveSource(node, key({}, "[self-translate]"), function(node){
				var translate = loader.meta[name].translate;
				return {
					code: translate(node.load)
				};
			});
		}

		transformActiveSource(node, key(options, outputFormat), function(node, source){
			var opts = Object.assign({}, options, {
				forceES5: loader.forceES5 !== false
			});
			var depMap = nodeDependencyMap(node);

			// this options is used by steal-tools transform
			if(opts.useNormalizedDependencies) {
				opts.normalizeMap = depMap;
			}

			// slim builds should use normalized modules names when numeric ids
			// cannot be assigned during the build. E.g: steal-conditional
			if (isOptimizedBuild(opts)) {
				opts.normalizeMap = loader.normalizeMap;
			}

			opts.transpiler = loader.transpiler || "babel"; // Babel is the default in Steal 1.x
			if(loader.babelOptions) {
				opts.babelOptions = loader.babelOptions;
				var npmPkg = node.load.metadata.npmPackage;
				if(npmPkg) {
					var pkgSteal = npmPkg.steal || npmPkg.system;
					if(pkgSteal && pkgSteal.babelOptions) {
						opts.babelOptions = pkgSteal.babelOptions;
					}
				}

				opts.babelOptions.presets = processBabelPresets({
					baseURL: loader.baseURL,
					babelOptions: opts.babelOptions,
					loaderEnv: loader.getEnv()
				});

				opts.babelOptions.plugins = processBabelPlugins({
					baseURL: loader.baseURL,
					babelOptions: opts.babelOptions,
					loaderEnv: loader.getEnv()
				});
			}
			// make sure load has activeSource
			var load = Object.assign({}, node.load);
			load.source = source.code || load.source;
			// Minify globals prior to transpiling because they can't
			// be minified after they become a System.define.
			if(load.metadata.format === "global" && options.minify) {
				load.source = minify({ code: load.source }, options).code;
			}
			// I'm not sure how to handle defined.  "less" is an example of something we
			// define.  Presumably these should all be ignored.
			// also ignore any non js build type ... for now ...!
			// also ignore modules that will not bundled (metadata => bundle: false), we can skip transpiling into AMD
			var buildType = load.metadata.buildType || "js";
			if(load.metadata.format === "defined" ||
				buildType !== "js" ||
				(load.metadata.hasOwnProperty('bundle') && load.metadata.bundle === false)) {
				return source;
			}
			if(opts.sourceMapPath) {
				opts.baseURL = opts.sourceMapPath;
			}
			if(opts.normalize) {
				var givenNormalize = opts.normalize;
				opts.normalize = function(name, curName){
					// if name === curName ... it's asking to normalize the current module's name
					// for something like define('component/component',[...])
					// component/component won't be in depMap.
					var isDefining = name === curName;
					var depLoad;
					if(isDefining) {
						depLoad = load;
					} else {
						var normalizedName = options.useNormalizedDependencies ?
							name : (depMap[name] || name);
						var depNode = graph[normalizedName];
						if(depNode) {
							depLoad = depNode.load;
						}
					}
					return givenNormalize.call(this, name, depLoad, curName,
											   load, loader, isDefining);
				};
			}
			try {
				return transpile.to(load, outputFormat, opts);
			} catch(err) {
				var message = "Unable to transpile " + load.name + ": \n\n" +
					err.message;
				err.message = message;
				throw err;
			}
		});
	}
};

// fullGraph - if graph is a bundle ... fullGraph is the actual graph
module.exports = function(graph, outputFormat, options, data) {
	var opts = Object.assign({}, options, {
		buildType: data.buildType
	});

    if (Array.isArray(graph)) {
		flagCircularDependencies(data.graph);

        graph.forEach(function(node){
            transpileNode(node, outputFormat, opts, data.graph, data.loader);
        });
    } else {
		flagCircularDependencies(graph);

        for (var name in graph) {
            transpileNode(graph[name], outputFormat, opts, graph, data.loader);
		}
	}
};

/**
 * Adds a circular flag to the load object of cyclic dependencies
 *
 * MUTATES THE GRAPH
 *
 * @param {Object} graph - The graph to check
 */
function flagCircularDependencies(graph) {
	var includes = require("lodash/includes");
	var nodes = Array.isArray(graph) ? graph : require("lodash/values")(graph);

	for (var i = 0; i < nodes.length; i += 1) {
		var curr = nodes[i];

		for (var j = i + 1; j < nodes.length; j += 1) {
			var next = nodes[j];

			if (
				includes(curr.dependencies, next.load.name) &&
				includes(next.dependencies, curr.load.name)
			) {
				curr.load.circular = true;
				next.load.circular = true;
			}
		}
	}

	return graph;
}
