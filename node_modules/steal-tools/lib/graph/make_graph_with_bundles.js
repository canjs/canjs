var clone = require("lodash/clone");
var assign = require("lodash/assign");
var includes = require("lodash/includes");
var dependencyGraph = require("./make_graph");
var normalizeBundle = require("../loader/normalize_bundle");
var through = require("through2");
var fs = require("fs-extra");
var assignDefaultOptions = require("../assign_default_options");

var slice = Array.prototype.slice;

function addBundleOnEveryModule (graph, bundle){
	for(var name in graph) {
		addBundle( graph[name],bundle );
	}
}

function addBundle (node, bundle) {
	if(!node.bundles) {
		node.bundles = [bundle];
	} else if(node.bundles.indexOf(bundle) == -1) {
		node.bundles.push(bundle);
	}
}

function hasNewDeps(nodeA, nodeB) {
	// Not all modules are guaranteed to have deps
	if(!nodeA.load.metadata.deps || !nodeB.load.metadata.deps) {
		return false;
	}
	return nodeA.load.metadata.deps.length !== nodeB.load.metadata.deps.length;
}

// merges everything in `newGraph` into `masterGraph` and make sure it lists
// `bundle` as one of its bundles.
function mergeIntoMasterAndAddBundle(opts) {
	var mains = opts.mains;
	var loader = opts.loader;
	var newGraph = opts.newGraph;
	var bundleName = opts.bundleName;
	var masterGraph = opts.masterGraph;

	for(var name in newGraph) {
		var oldNode = masterGraph[name];
		var newNode = newGraph[name];

		if(!oldNode || hasNewDeps(oldNode, newNode)) {
			masterGraph[name] = newGraph[name];
		}
		// If it's a plugin we'll use the new node but need to copy any previous
		// bundles onto the new node
		else if(masterGraph[name] && masterGraph[name].isPlugin) {
			var oldBundle = masterGraph[name].bundles || [];
			masterGraph[name] = newGraph[name];
			oldBundle.forEach(function(bundle){
				addBundle(masterGraph[name], bundle);
			});
		}
		// If this is the configMain like package.json!npm we need to override
		// the source every time because it continuously changes.
		else if(masterGraph[name] && name === loader.configMain) {
			var node = masterGraph[name];
			node.load.source = newGraph[name].load.source;
		}

		// do not track bundles of entry point modules (a.k.a mains) unless
		// it is its own bundle.
		if (name === bundleName || !includes(mains, name)) {
			addBundle(masterGraph[name], bundleName);
		}
	}
}

// Create temporary files for virtual modules.
function createModuleConfig(loader) {
	var tmp = require("tmp");
	var config = {};
	var virtualModules = loader.virtualModules || {};
	for(var moduleName in virtualModules) {
		var filename = tmp.fileSync().name;
		var source = virtualModules[moduleName];
		fs.writeFileSync(filename, source, "utf8");

		var paths = config.paths = config.paths || {};
		paths[moduleName] = "file:"+filename;
	}
	return config;
}

// If `prop` exists in the `src` object, it copies its value to `dest`
function copyIfSet(src, dest, prop) {
	if (src[prop]) {
		dest[prop] = src[prop];
	}
}

var makeBundleGraph = module.exports = function makeBundleGraph(config, options) {
	if(!options) options = {};
	options = assignDefaultOptions(config, options);

	// the names of everything we are going to load
	var bundleNames = [];

	var cfg = clone(config, true);
	if( Array.isArray(cfg.main) ) {
		bundleNames = slice.call(cfg.main);
		cfg.main = bundleNames.shift();
	}
	// Get the first dependency graph
	return dependencyGraph(cfg, options)
		.then(normalizeBundle)
		.then(function(data){

		// TODO I left off here, need to make sure main is normalized.

		var masterGraph = data.graph,
			main = data.steal.System.main;

		// add the "main" bundle to everything currently on the main dependency graph;
		addBundleOnEveryModule(masterGraph, main);

		// Get the bundles of the loader
		var loader = data.steal.System;
		bundleNames = bundleNames.concat(loader.bundle.slice(0));

		// Get config for virtual modules
		options.system = createModuleConfig(loader);
		options.previousLoader = data.loader;

		// Get the next bundle name and gets a graph for it.
		// Merges those nodes into the masterGraph
		var getNextGraphAndMerge = function(){
			var nextBundle = bundleNames.shift();

			var mains = Array.isArray(config.main) ?
				config.main.slice(0) : [data.loader.main];

			var mainsPromise = Promise.all(mains.map(function(main){
				return data.loader.normalize(main);
			}));

			if(!nextBundle) {
				return mainsPromise.then(function(nmains) {
					// If there are no more bundles, return data
					return {
						graph: masterGraph,
						steal: data.steal,
						loader: data.loader,
						buildLoader: data.buildLoader,
						mains: nmains,
						config: config,
						options: options
					};
				});
			}
			else {
				var nmains;
				var copy = assign(clone(cfg), { main: nextBundle });

				// share these objects among steal instances so the configuration
				// from all bundles can be collected in a single object, otherwise
				// each time the dependency graph of a bundle is created; any
				// plugin/extension used by the bundle will set its configuration
				// to a fresh object reference that's lost after the dependency
				// graph is created.
				copyIfSet(data.loader, options, "slimConfig");

				return mainsPromise
					.then(function(normalised) {
						nmains = normalised;
						return dependencyGraph(copy, options);
					})
					.then(function(data){
						mergeIntoMasterAndAddBundle({
							masterGraph: masterGraph,
							newGraph: data.graph,
							bundleName: data.steal.System.main,
							loader: data.loader,
							mains: nmains
						});

						options.previousLoader = data.loader;
						return getNextGraphAndMerge();
					});
			}
		};

		return getNextGraphAndMerge();
	});
};

// A Stream version of makeBundleGraph
makeBundleGraph.createBundleGraphStream = function(){
	var args = arguments;
	var stream = through.obj(function(moduleName, enc, done){
		return makeBundleGraph.apply(null, args).then(function(data){
			done(null, data);
		}, done);
	});
	stream.write();
	return stream;
};
