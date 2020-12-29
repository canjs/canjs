var keys = require("lodash/keys");
var through = require("through2");
var assign = require("lodash/assign");

module.exports = function() {
	return through.obj(function(data, enc, next) {
		loadNodeBuilder(data)
			.then(function(newGraph) {
				next(null, assign(data, { graph: newGraph }));
			})
			.catch(next);
	});
};

/**
 * Replaces a node source with its builder module
 * @param {Object} data - The stream's data object
 * @return {Promise.<graph>}
 */
function loadNodeBuilder(data) {
	return new Promise(function(resolve, reject) {
		var graph = data.graph;
		var loader = data.loader;

		var promises = keys(graph).map(function(nodeName) {
			var node = graph[nodeName];

			// pluginBuilder | extensionBuilder is a module identifier that
			// should be loaded to replace the node's source during the build
			var nodeBuilder =
				node.value && (node.value.pluginBuilder || node.value.extensionBuilder);

			// nothing to do in this case, return right away
			if (!nodeBuilder) return;

			return loader
				.normalize(nodeBuilder)
				.then(locate)
				.then(_fetch)
				.then(makeReplace(node));
		});

		function locate(name) {
			return Promise.all([name, loader.locate({ name: name, metadata: {} })]);
		}

		// [ name, address ]
		function _fetch(data) {
			return Promise.all([
				data[1],
				loader.fetch({ name: data[0], address: data[1], metadata: {} })
			]);
		}

		function makeReplace(node) {
			// [ address, load ]
			return function replace(data) {
				node.load = assign(node.load, {
					address: data[0],
					source: data[1],
					metadata: {}
				});
			};
		}

		Promise.all(promises)
			.then(function() {
				resolve(graph);
			})
			.catch(reject);
	});
}
