/*can-debug@2.0.6#src/label-cycles/label-cycles*/
define('can-debug/src/label-cycles/label-cycles', [
    'require',
    'exports',
    'module',
    'can-debug/src/graph/graph'
], function (require, exports, module) {
    'use strict';
    var Graph = require('can-debug/src/graph/graph');
    module.exports = function labelCycles(graph) {
        var visited = new Map();
        var result = new Graph();
        graph.nodes.forEach(function (node) {
            result.addNode(node);
        });
        var visit = function visit(node) {
            visited.set(node, true);
            graph.getNeighbors(node).forEach(function (adj) {
                if (visited.has(adj)) {
                    var isTwoWay = graph.hasArrow(node, adj);
                    if (isTwoWay) {
                        result.addArrow(adj, node, { kind: 'twoWay' });
                    }
                } else {
                    result.addArrow(node, adj, graph.getArrowMeta(node, adj));
                    visit(adj);
                }
            });
        };
        visit(graph.nodes[0]);
        return result;
    };
});