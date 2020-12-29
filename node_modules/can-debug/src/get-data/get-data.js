"use strict";
var labelCycles = require("../label-cycles/label-cycles");

var isDisconnected = function isDisconnected(data) {
	return (
		!data.derive.length &&
		!data.mutations.length &&
		!data.twoWay.length
	);
};

// Returns a deeply nested object from the graph
module.exports = function getDebugData(inputGraph, direction) {
	var visited = new Map();

	var graph = labelCycles(
		direction === "whatChangesMe" ? inputGraph.reverse() : inputGraph
	);

	var visit = function visit(node) {
		var data = { node: node, derive: [], mutations: [], twoWay: [] };

		visited.set(node, true);

		graph.getNeighbors(node).forEach(function(adj) {
			var meta = graph.getArrowMeta(node, adj);

			if (!visited.has(adj)) {
				switch (meta.kind) {
					case "twoWay":
						data.twoWay.push(visit(adj));
						break;

					case "derive":
						data.derive.push(visit(adj));
						break;

					case "mutate":
						data.mutations.push(visit(adj));
						break;

					default:
						throw new Error("Unknow meta.kind value: ", meta.kind);
				}
			}
		});

		return data;
	};

	// discard data if there are no arrows registered, this happens when
	// [direction] is passed in and no arrow metadada matches its value
	var result = visit(graph.nodes[0]);
	return isDisconnected(result) ? null : result;
};
