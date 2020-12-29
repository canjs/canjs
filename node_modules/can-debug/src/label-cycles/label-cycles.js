"use strict";
var Graph = require("../graph/graph");

// Returns a new graph with all the arrows not involved in a circuit
module.exports = function labelCycles(graph) {
	var visited = new Map();
	var result = new Graph();

	// copy over all nodes
	graph.nodes.forEach(function(node) {
		result.addNode(node);
	});

	var visit = function visit(node) {
		visited.set(node, true);

		graph.getNeighbors(node).forEach(function(adj) {
			// back arrow found
			if (visited.has(adj)) {
				// if isTwoWay is false it means the cycle involves more than 2 nodes,
				// e.g: A -> B -> C -> A
				// what to do in these cases? (currently ignoring these)
				var isTwoWay = graph.hasArrow(node, adj);

				if (isTwoWay) {
					result.addArrow(adj, node, { kind: "twoWay" });
				}
			// copy over arrows not involved in a cycle
			} else {
				result.addArrow(node, adj, graph.getArrowMeta(node, adj));
				visit(adj);
			}
		});
	};

	visit(graph.nodes[0]);
	return result;
};
