var makeBundleGraph = require("./make_graph_with_bundles");
var through = require("through2");
var clone = require("lodash").clone;
var getDependencies = require("../node_trace");
var xor = require("lodash").xor;
var removeActiveSourceKeys = require("./remove_active_source_keys");

/**
 * @module regraph
 * @description Consumes a Dependency Graph and can regenerate another when
 * modules change.
 */
module.exports = function(config, options){
	var cachedData;

	// Regenerate a new bundle graph and copy over the transforms so they can
	// be reused.
	function regenerate(moduleName, done){
		var cfg = clone(config, true);
		// if the moduleName is not in the graph, make it the main.
		if(moduleName && !cachedData.graph[moduleName]) {
			cfg.main = moduleName;
		}

		makeBundleGraph(cfg, options).then(function(data){
			var graph = data.graph;
			var oldGraph = cachedData ? cachedData.graph : {};
			for(var name in graph){
				if(name !== moduleName && oldGraph[name]) {
					graph[name].transforms = oldGraph[name].transforms;
				}
			}
			cachedData = cloneData(data);
			done(null, data);
		}, done);
	}

	function clean(node, newSource) {
		node.load.source = newSource;
		delete node.transforms;
		delete node.sourceNode;
	}

	function cloneData(data) {
		var newData = clone(data);
		newData.graph = clone(newData.graph);
		return newData;
	}

	function cached(data, enc, next){
		// This will only happen the first time, just to cache.
		if(typeof data === "object") {
			// Looks like:
			// { graph, steal, loader, buildLoader, mains }
			cachedData = cloneData(data);
			next(null, data);
		} else {
			var moduleName = data;

			// Reload happened before the graph was loaded.
			if(false && !cachedData) {
				next(null, {});
				return;
			}

			// Get the old node and check to see if it has any new dependencies,
			// if so just regenerate the entire graph.
			var node = cachedData && cachedData.graph[moduleName];
			if(node) {
				diff(node).then(function(result){
					if(result.same) {
						removeActiveSourceKeys(cachedData.graph);
						// don't pass the local `cachedData` variable down the
						// stream, it might be mutated
						var oldCachedData = cachedData;
						cachedData = cloneData(cachedData);
						return next(null, oldCachedData);
					}
					regenerate(moduleName, next);
				}, function(err){
					err.moduleName = moduleName;
					next(err);
				});
			} else {
				// Either load the module name, which is not part of the graph
				// or will pass null thus reloading the main graph.
				regenerate(moduleName || null, next);
			}
		}
	}

	/**
	 * Check to see if the node has changed. Do this by looking at the source
	 * and running it through System.instantiate to see if new deps were added.
	 * Recursively do the same for any System.defined modules.
	 */
	function diff(node) {
		var oldBundle = (cachedData.loader.bundle || []).slice();

		return getDependencies(node.load).then(function(result){
			var newBundle = (cachedData.loader.bundle || []).slice();

			// If the deps are the same we can return the existing graph.
			if(same(node.deps, result.deps) &&
			   same(oldBundle, newBundle)) {
				clean(node, result.source);

				if(result.virtualModules.length) {
					var promises = result.virtualModules.map(function(l){
						var node = cachedData.graph[l.name];
						node.load.source = l.source;
						node.load.metadata.useSource = true;
						return diff(node);
					});

					return Promise.all(promises).then(function(results){
						result.same = results.every(function(res){
							return res.same;
						});
						return result;
					});
				}

				result.same = true;
			}
			return result;
		});

	}

	return through.obj(cached);
};

function same(a, b){
	return !xor(a, b).length;
}
