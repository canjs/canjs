var multiBuild = require("./lib/build/multi");
var transform = require("./lib/build/transform");
var exporter = require("./lib/build/export");

module.exports = {
	build: multiBuild,
	transform: transform,
	graph: {
		each: require("./lib/graph/each_dependencies"),
		map: require("./lib/graph/map_dependencies"),
		make: require("./lib/graph/make_graph"),
		makeOrderedTranspiledMinified:
			require("./lib/graph/make_ordered_transpiled_minified_graph.js")
	},
	"export": exporter,


	// Streaming API
	streams: {
		graph: require("./lib/graph/make_graph_with_bundles")
			.createBundleGraphStream,

		transpile: require("./lib/stream/transpile"),
		minify: require("./lib/stream/minify"),
		bundle: require("./lib/stream/bundle"),
		concat: require("./lib/bundle/concat_stream"),
		write: require("./lib/bundle/write_bundles")
			.createWriteStream

	}

};
