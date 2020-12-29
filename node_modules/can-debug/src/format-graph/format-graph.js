"use strict";
var canReflect = require("can-reflect");
var canAssign = require("can-assign");

// Converts the graph into a data structure that vis.js requires to draw the graph
module.exports = function formatGraph(graph) {
	// { [node]: Number }
	var nodeIdMap = new Map();
	graph.nodes.forEach(function(node, index) {
		nodeIdMap.set(node, index + 1);
	});

	// collects nodes in the shape of { id: Number, label: String }
	var nodesDataSet = graph.nodes.map(function(node) {
		return {
			shape: "box",
			id: nodeIdMap.get(node),
			label:
				canReflect.getName(node.obj) +
				(node.key ? "." + node.key : "")
		};
	});

	var getArrowData = function getArrowData(meta) {
		var regular = { arrows: "to" };
		var withDashes = { arrows: "to", dashes: true };

		var map = {
			derive: regular,
			mutate: withDashes
		};

		return map[meta.kind];
	};

	// collect edges in the shape of { from: Id, to: Id }
	var visited = new Map();
	var arrowsDataSet = [];
	graph.nodes.forEach(function(node) {
		var visit = function(node) {
			if (!visited.has(node)) {
				visited.set(node, true);
				var arrows = graph.arrows.get(node);
				var headId = nodeIdMap.get(node);

				arrows.forEach(function(neighbor) {
					var tailId = nodeIdMap.get(neighbor);
					var meta = graph.arrowsMeta.get(node).get(neighbor);

					arrowsDataSet.push(
						canAssign(
							{ from: headId, to: tailId },
							getArrowData(meta)
						)
					);

					visit(neighbor);
				});
			}
		};

		visit(node);
	});
	
	return {
		nodes: nodesDataSet,
		edges: arrowsDataSet
	};
};
