"use strict";
var canAssign = require("can-assign");

function Graph() {
	this.nodes = [];
	this.arrows = new Map();
	this.arrowsMeta = new Map();
}

// Adds the node, but it does not check if the node exists, callers will have
// to check that through [findNode]
Graph.prototype.addNode = function addNode(node) {
	this.nodes.push(node);
	this.arrows.set(node, new Set());
};

// Adds an arrow from head to tail with optional metadata
// The method does not check whether head and tail are already
// nodes in the graph, this should be done by the caller.
Graph.prototype.addArrow = function addArrow(head, tail, meta) {
	var graph = this;

	graph.arrows.get(head).add(tail);

	// optional
	if (meta) {
		addArrowMeta(graph, head, tail, meta);
	}
};

// Tests whether there is an arrow from head to tail
Graph.prototype.hasArrow = function hasArrow(head, tail) {
	return this.getNeighbors(head).has(tail);
};

// Returns the metadata associated to the head -> tail arrow
Graph.prototype.getArrowMeta = function getArrowMeta(head, tail) {
	return this.arrowsMeta.get(head) && this.arrowsMeta.get(head).get(tail);
};

// Sets metadata about the arrow from head to tail
// Merges the passed object into existing metadata
Graph.prototype.setArrowMeta = function setArrowMeta(head, tail, meta) {
	addArrowMeta(this, head, tail, meta);
};

// Returns a Set of all nodes 'y' such that there is an arrow
// from the node 'x' to the node 'y'.
Graph.prototype.getNeighbors = function getNeighbors(node) {
	return this.arrows.get(node);
};

// Returns the first node that satisfies the provided testing function.
// The Graph is traversed using depth first search
Graph.prototype.findNode = function findNode(cb) {
	var found = null;
	var graph = this;
	var i, node;

	for (i=0; i<graph.nodes.length; i++) {
		node = graph.nodes[i];
		if (cb(node)) {
			found = node;
			break;
		}
	}

	return found;
};

Graph.prototype.bfs = function bfs(visit) {
	var graph = this;

	var node = graph.nodes[0];
	var queue = [node];
	var visited = new Map();
	visited.set(node, true);

	while (queue.length) {
		node = queue.shift();

		visit(node);

		graph.arrows.get(node).forEach(function(adj) {
			if (!visited.has(adj)) {
				queue.push(adj);
				visited.set(adj, true);
			}
		});
	}
};

Graph.prototype.dfs = function dfs(visit) {
	var graph = this;

	var node = graph.nodes[0];
	var stack = [node];
	var visited = new Map();

	while (stack.length) {
		node = stack.pop();

		visit(node);

		if (!visited.has(node)) {
			visited.set(node, true);
			graph.arrows.get(node).forEach(function(adj) {
				stack.push(adj);
			});
		}
	}
};

// Returns a new graph where the arrows point to the opposite direction, that is:
// For each arrow (u, v) in [this], there will be a (v, u) in the returned graph
// This is also called Transpose or Converse a graph
Graph.prototype.reverse = function reverse() {
	var graph = this;
	var reversed = new Graph();

	// copy over the nodes
	graph.nodes.forEach(reversed.addNode.bind(reversed));

	graph.nodes.forEach(function(node) {
		graph.getNeighbors(node).forEach(function(adj) {
			// add the arrow in the opposite direction, copy over metadata
			var meta = graph.getArrowMeta(node, adj);
			reversed.addArrow(adj, node, meta);
		});
	});

	return reversed;
};

// Helpers
function addArrowMeta(graph, head, tail, meta) {
	var entry = graph.arrowsMeta.get(head);

	if (entry) {
		var arrowMeta = entry.get(tail);
		if (!arrowMeta) {
			arrowMeta = {};
		}
		entry.set(tail, canAssign(arrowMeta, meta));
	} else {
		entry = new Map();
		entry.set(tail, meta);
		graph.arrowsMeta.set(head, entry);
	}
}

module.exports = Graph;
