// Copyright 2014, 2015 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var path							= require("path");
var urix							= require("urix");
var sourceMap					= require("bitovi-source-map");
var SourceNode				= sourceMap.SourceNode;
var SourceMapConsumer = sourceMap.SourceMapConsumer;

function concat(files, options) {
	options = options || {};

	var concatenated = new SourceNode();

	files.forEach(function(file, index) {
		if(file.code.length === 0){
			return;
		}

		if (options.delimiter && index !== 0) {
			concatenated.add(options.delimiter);
		}

		var node;
		var map = file.map;
		if (map) {
			if(file.node.sourceNode) {
				node = file.node.sourceNode;
				node.prependModuleName = false;
			} else {
				if (typeof map.toJSON === "function") {
					map = map.toJSON();
				}
				node = file.node.sourceNode = SourceNode.fromStringWithSourceMap(
					file.code,
					new SourceMapConsumer(map),
					urix(path.relative(
						path.dirname( options.mapPath || "." ),
						path.dirname( file.sourcesRelativeTo || "." )
					))
				);
			}
		} else {
			node = new SourceNode(null, null, null, file.code);
		}

		if (options.process) {
			options.process(node, file, index);
		}

		concatenated.add(node);
	});

	return concatenated;
}

module.exports = concat;
