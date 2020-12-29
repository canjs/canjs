var transpile = require('transpile');
var nodeDependencyMap = require("../node/dependency_map"),
	minify = require("../buildTypes/minifyJS"),
	transformActiveSource = require("../node/transform_active_source"),
	_ = require("lodash");


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

var transpileNode = function(node, outputFormat, options, graph, loader){
	var name = node.load.name;

	if( !node.load.metadata.buildType || node.load.metadata.buildType === "js"  ) {

		// Nodes can provide their own `translate` function as part of metadata.
		if(loader.meta[name] && loader.meta[name].translate) {
			transformActiveSource(node, key({}, "[self-translate]"), function(node){
				var translate = loader.meta[name].translate;
				return {
					code: translate(node.load)
				};
			});
		}

		transformActiveSource(node,key(options, outputFormat),function(node, source){

			var opts = _.clone(options);
			var depMap = nodeDependencyMap(node);

			if(opts.useNormalizedDependencies) {
				opts.normalizeMap = depMap;
			}
			if(loader.transpiler) {
				opts.transpiler = loader.transpiler;
			}
			if(loader.babelOptions) {
				opts.babelOptions = loader.babelOptions;
			}
			// make sure load has activeSource
			var load = _.clone(node.load, true);
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
						var normalizedName = options.useNormalizedDependencies ? name : depMap[name];
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
module.exports = function(graph, outputFormat, options, data){

	options = options || {};
	if(Array.isArray(graph)) {
		graph.forEach(function(node){
			transpileNode(node, outputFormat, options, data.graph, data.loader);
		});
	} else {
		for(var name in graph) {
			var node = graph[name];
			// If JavaScript
			transpileNode(node, outputFormat, options, graph, data.loader);
		}
	}
};
