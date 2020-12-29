var omit = require("lodash/omit");
var through = require("through2");
var assign = require("lodash/assign");

module.exports = function() {
	return through.obj(function(data, enc, done) {
		convertSlimConfig(data)
			.then(function(mutatedData) {
				done(null, mutatedData);
			})
			.catch(done);
	});
};

function convertSlimConfig(data) {
	var map = {};
	var graph = data.graph;
	var loader = data.loader;
	var config = data.loader.slimConfig;

	function getSlimId(id) {
		if (graph[id]) {
			return graph[id].load.uniqueId;
		} else {
			throw new Error("Cannot find module: " + id + " in the graph.");
		}
	}

	return new Promise(function(resolve) {
		var idsToBeMapped = config.toMap.map(function(id) {
			return loader.normalize(id).then(function(name) {
				map[id] = getSlimId(name);
			});
		});

		Promise.all(idsToBeMapped).then(function() {
			// mutates the slimConfig property!
			loader.slimConfig = assign({}, omit(config, ["toMap"]), {
				map: map,
				extensions: config.extensions.map(getSlimId)
			});

			resolve(data);
		});
	});
}
