/*can-debug@2.0.6#src/graph/graph*/
define('can-debug/src/graph/graph', [
    'require',
    'exports',
    'module',
    'can-assign'
], function (require, exports, module) {
    'use strict';
    var canAssign = require('can-assign');
    function Graph() {
        this.nodes = [];
        this.arrows = new Map();
        this.arrowsMeta = new Map();
    }
    Graph.prototype.addNode = function addNode(node) {
        this.nodes.push(node);
        this.arrows.set(node, new Set());
    };
    Graph.prototype.addArrow = function addArrow(head, tail, meta) {
        var graph = this;
        graph.arrows.get(head).add(tail);
        if (meta) {
            addArrowMeta(graph, head, tail, meta);
        }
    };
    Graph.prototype.hasArrow = function hasArrow(head, tail) {
        return this.getNeighbors(head).has(tail);
    };
    Graph.prototype.getArrowMeta = function getArrowMeta(head, tail) {
        return this.arrowsMeta.get(head) && this.arrowsMeta.get(head).get(tail);
    };
    Graph.prototype.setArrowMeta = function setArrowMeta(head, tail, meta) {
        addArrowMeta(this, head, tail, meta);
    };
    Graph.prototype.getNeighbors = function getNeighbors(node) {
        return this.arrows.get(node);
    };
    Graph.prototype.findNode = function findNode(cb) {
        var found = null;
        var graph = this;
        var i, node;
        for (i = 0; i < graph.nodes.length; i++) {
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
            graph.arrows.get(node).forEach(function (adj) {
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
                graph.arrows.get(node).forEach(function (adj) {
                    stack.push(adj);
                });
            }
        }
    };
    Graph.prototype.reverse = function reverse() {
        var graph = this;
        var reversed = new Graph();
        graph.nodes.forEach(reversed.addNode.bind(reversed));
        graph.nodes.forEach(function (node) {
            graph.getNeighbors(node).forEach(function (adj) {
                var meta = graph.getArrowMeta(node, adj);
                reversed.addArrow(adj, node, meta);
            });
        });
        return reversed;
    };
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
});