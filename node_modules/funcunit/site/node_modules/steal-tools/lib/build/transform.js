var makeGraph = require("../graph/make_graph"),
	makeBundleFromModuleName = require("../graph/get"),
	concatSource = require("../bundle/concat_source"),
	mapDependencies = require("../graph/map_dependencies"),

	logging = require('../logger'),
	hasES6 = require('../graph/has_es6'),
	_ = require('lodash'),
	hasES6 = require("../graph/has_es6"),
	addTraceurRuntime = require("../bundle/add_traceur_runtime"),
	addGlobalShim = require("../bundle/add_global_shim"),
	transpile = require('../graph/transpile'),
	clean = require("../graph/clean"),
	minify = require("../graph/minify"),
	winston = require('winston'),
	removeActiveSourceKeys = require("../graph/remove_active_source_keys"),
	nameBundle = require("../bundle/name"),
	makeConfiguration = require("../configuration/make"),
	addSourceMapUrl = require("../bundle/add_source_map_url");

var transformImport = function(config, transformOptions){
	transformOptions = _.assign(transformOptions || {}, {
		useNormalizedDependencies: true
	});
	if(transformOptions.sourceMaps) {
		_.assign(config, {
			lessOptions: _.assign({}, transformOptions.lessOptions, {
				sourceMap: {}
			})
		});
	}
	transformOptions.exports = transformOptions.exports || {};

	// Setup logging
	logging.setup(transformOptions, config);

	return makeGraph(config, transformOptions).then(function(data){
		
		return transformImport.normalizeExports(data.steal.System,
												transformOptions)
		.then(function(){
			return data;
		});
	}).then(function(data){

		var transform = function(moduleNames, options){
			options = _.extend({
				ignore: [],
				minify: false,
				removeDevelopmentCode: true,
				format: "global",
				noGlobalShim: false,
				includeTraceurRuntime: true,
				ignoreAllDependencies: false,
				removeSourceNodes: true
			},transformOptions, options);
			var configuration = makeConfiguration(data.loader, data.buildLoader, options);

			if(!moduleNames) {
				moduleNames = data.loader.main;
			}
			if(typeof moduleNames === "string"){
				moduleNames = [moduleNames];
			}

			moduleNames.forEach(function(moduleName){
				if(!data.graph[moduleName]){
					throw new Error("Can't find module '" + moduleName + "' in graph.");
				}
			});
			var nodesInBundle;

			// get nodes
			if(options.ignoreAllDependencies) {

				nodesInBundle = moduleNames.map(function(moduleName){
					return data.graph[moduleName];
				});

			} else {
				// get all nodes that are dependencies of moduleName
				var nodes = makeBundleFromModuleName(data.graph, moduleNames);
				// figure ot what modules should be ignored
				var ignores = transformImport.getAllIgnores(options.ignore, data.graph);
				// get only the nodes that should be in the bundle.
				nodesInBundle = transformImport.notIgnored(nodes, ignores);
			}

			// If there's nothing in this bundle, just give them an empty
			// source object.
			if(nodesInBundle.length === 0) {
				return {code: ""};
			}

			// resets the active source to be worked from.
			removeActiveSourceKeys(nodesInBundle, options);

			// #### clean
			// Clean first
			if(options.removeDevelopmentCode) {
				winston.debug('Cleaning...');
				clean(nodesInBundle, options);
			}
			// Minify would make sense to do next as it is expensive.  But it
			// makes transpile hard to debug.

			// #### transpile
			winston.debug('Transpiling...');
			options.sourceMapPath = configuration.bundlesPath;
			transpile(nodesInBundle,
				options.format === "global" ? "amd" : options.format,
				options.format === "global" ? _.assign(_.clone(options),{namedDefines: true})  : options,
				data);


			// #### minify
			if(options.minify) {
				winston.debug('Minifying...');
				minify(nodesInBundle);
			}

			var bundle = {
				bundles: moduleNames,
				nodes: nodesInBundle,
				buildType: nodesInBundle[0].load.metadata.buildType || "js"
			};
			bundle.name = nameBundle.getName(bundle);

			// add shim if global
			if(options.format === "global" && !options.noGlobalShim) {
				addGlobalShim(bundle, options);
			}
			if(hasES6(nodesInBundle) && options.includeTraceurRuntime){
				addTraceurRuntime(bundle);
			}
			winston.debug('Output Modules:');
			bundle.nodes.forEach(function(node) {
				winston.debug("+ %s", node.load.name);
			});
			concatSource(bundle,"activeSource", options.format === "global");
			if(options.sourceMaps) {
				addSourceMapUrl(bundle);
			}

			return bundle.source;
		};

		// Set the graph on transform in case anyone needs to use it.
		transform.graph = data.graph;
		transform.loader = data.loader;
		return transform;


	});

};



var matches = function(rules, name, load){
	if(rules === name) {
		return true;
	}else if( Array.isArray(rules) ) {
		for(var i =0; i < rules.length; i++) {
			if( matches(rules[i], name, load) ) {
				return true;
			}
		}
	} else if( rules instanceof RegExp) {
		return rules.test(name);
	} else if( typeof rules === "function") {
		return rules(name, load);
	}

};

transformImport.getAllIgnores = function(baseIgnores, graph) {
	var ignores = [];
	baseIgnores = Array.isArray(baseIgnores) ? baseIgnores : [ baseIgnores ];

	baseIgnores.forEach(function(moduleName){

		// An ignore could be a regular expression, this only applies to strings.
		if(typeof moduleName === "string") {
			// Add this ignore's dependencies
			ignores = ignores.concat(mapDependencies(graph, moduleName, function(name){
				return name;
			}));
		} else {
			ignores.push(moduleName);
		}

	});

	return ignores;
};

transformImport.notIgnored = function( bundle, rules ) {
	var notIgnored = [];
	bundle.filter(function(b) { return !!b; })
	.forEach(function(node){
		if( !matches(rules, node.load.name, node.load ) ) {
			notIgnored.push(node);
		}
	});
	return notIgnored;
};

transformImport.normalizeExports = function(loader, options) {
	var exports = options.exports;
	var main = loader.main;

	var promises = Object.keys(exports).map(function(oldName){
		return loader.normalize(oldName, main).then(function(name){
			if(name !== oldName) {
				exports[name] = exports[oldName];
				delete exports[oldName];
			}
		});
	});

	return Promise.all(promises);
};

transformImport.matches = matches;


module.exports = transformImport;
