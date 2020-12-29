"use strict";
var Graph = require("../graph/graph");
var makeNode = require("./make-node");
var canReflect = require("can-reflect");
var mutateDeps = require("can-reflect-dependencies");

// Returns a directed graph of the dependencies of obj (key is optional)
//
// Signature:
//	getDirectedGraph(obj)
//	getDirectedGraph(obj, key)
module.exports = function getGraph(obj, key) {
	var order = 0;
	var graph = new Graph();
	var gotKey = arguments.length === 2;

	var addArrow = function addArrow(direction, parent, child, meta) {
		switch (direction) {
			case "whatIChange":
				graph.addArrow(parent, child, meta); break;
			case "whatChangesMe":
				graph.addArrow(child, parent, meta); break;
			default:
				throw new Error("Unknown direction value: ", meta.direction);
		}
	};

	// keyDependencies :: Map<obj, Set<key>>
	var visitKeyDependencies = function visitKeyDependencies(source, meta, cb) {
		canReflect.eachKey(source.keyDependencies || {}, function(keys, obj) {
			canReflect.each(keys, function(key) {
				cb(obj, meta, key);
			});
		});
	};

	// valueDependencies :: Set<obj>
	var visitValueDependencies = function visitValueDependencies(source, meta, cb) {
		canReflect.eachIndex(source.valueDependencies || [], function(obj) {
			cb(obj, meta);
		});
	};

	var visit = function visit(obj, meta, key) {
		var gotKey = arguments.length === 3;

		var node = graph.findNode(function(node) {
			return gotKey ?
				node.obj === obj && node.key === key :
				node.obj === obj;
		});

		// if there is a node already in the graph, add the arrow and prevent
		// infinite calls to `visit` by returning early
		if (node) {
			if (meta.parent) {
				addArrow(meta.direction, meta.parent, node, {
					kind: meta.kind,
					direction: meta.direction
				});
			}
			return graph;
		}

		// create and add a node to the graph
		order += 1;
		node = gotKey ? makeNode(obj, key) : makeNode(obj);
		node.order = order;
		graph.addNode(node);

		// if there is a known parent node, add the arrow in the given direction
		if (meta.parent) {
			addArrow(meta.direction, meta.parent, node, {
				kind: meta.kind,
				direction: meta.direction
			});
		}

		// get the dependencies of the new node and recursively visit those
		var nextMeta;
		var data = gotKey ?
			mutateDeps.getDependencyDataOf(obj, key) :
			mutateDeps.getDependencyDataOf(obj);

		if (data && data.whatIChange) {
			nextMeta = { direction: "whatIChange", parent: node };

			// kind :: derive | mutate
			canReflect.eachKey(data.whatIChange, function(dependencyRecord, kind) {
				nextMeta.kind = kind;
				visitKeyDependencies(dependencyRecord, nextMeta, visit);
				visitValueDependencies(dependencyRecord, nextMeta, visit);
			});
		}

		if (data && data.whatChangesMe) {
			nextMeta = { direction: "whatChangesMe", parent: node };

			// kind :: derive | mutate
			canReflect.eachKey(data.whatChangesMe, function(dependencyRecord, kind) {
				nextMeta.kind = kind;
				visitKeyDependencies(dependencyRecord, nextMeta, visit);
				visitValueDependencies(dependencyRecord, nextMeta, visit);
			});
		}

		return graph;
	};

	return gotKey ? visit(obj, {}, key) : visit(obj, {});
};
