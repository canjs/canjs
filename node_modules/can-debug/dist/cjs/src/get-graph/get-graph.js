/*can-debug@2.0.6#src/get-graph/get-graph*/
define('can-debug/src/get-graph/get-graph', [
    'require',
    'exports',
    'module',
    'can-debug/src/graph/graph',
    'can-debug/src/get-graph/make-node',
    'can-reflect',
    'can-reflect-dependencies'
], function (require, exports, module) {
    'use strict';
    var Graph = require('can-debug/src/graph/graph');
    var makeNode = require('can-debug/src/get-graph/make-node');
    var canReflect = require('can-reflect');
    var mutateDeps = require('can-reflect-dependencies');
    module.exports = function getGraph(obj, key) {
        var order = 0;
        var graph = new Graph();
        var gotKey = arguments.length === 2;
        var addArrow = function addArrow(direction, parent, child, meta) {
            switch (direction) {
            case 'whatIChange':
                graph.addArrow(parent, child, meta);
                break;
            case 'whatChangesMe':
                graph.addArrow(child, parent, meta);
                break;
            default:
                throw new Error('Unknown direction value: ', meta.direction);
            }
        };
        var visitKeyDependencies = function visitKeyDependencies(source, meta, cb) {
            canReflect.eachKey(source.keyDependencies || {}, function (keys, obj) {
                canReflect.each(keys, function (key) {
                    cb(obj, meta, key);
                });
            });
        };
        var visitValueDependencies = function visitValueDependencies(source, meta, cb) {
            canReflect.eachIndex(source.valueDependencies || [], function (obj) {
                cb(obj, meta);
            });
        };
        var visit = function visit(obj, meta, key) {
            var gotKey = arguments.length === 3;
            var node = graph.findNode(function (node) {
                return gotKey ? node.obj === obj && node.key === key : node.obj === obj;
            });
            if (node) {
                if (meta.parent) {
                    addArrow(meta.direction, meta.parent, node, {
                        kind: meta.kind,
                        direction: meta.direction
                    });
                }
                return graph;
            }
            order += 1;
            node = gotKey ? makeNode(obj, key) : makeNode(obj);
            node.order = order;
            graph.addNode(node);
            if (meta.parent) {
                addArrow(meta.direction, meta.parent, node, {
                    kind: meta.kind,
                    direction: meta.direction
                });
            }
            var nextMeta;
            var data = gotKey ? mutateDeps.getDependencyDataOf(obj, key) : mutateDeps.getDependencyDataOf(obj);
            if (data && data.whatIChange) {
                nextMeta = {
                    direction: 'whatIChange',
                    parent: node
                };
                canReflect.eachKey(data.whatIChange, function (dependencyRecord, kind) {
                    nextMeta.kind = kind;
                    visitKeyDependencies(dependencyRecord, nextMeta, visit);
                    visitValueDependencies(dependencyRecord, nextMeta, visit);
                });
            }
            if (data && data.whatChangesMe) {
                nextMeta = {
                    direction: 'whatChangesMe',
                    parent: node
                };
                canReflect.eachKey(data.whatChangesMe, function (dependencyRecord, kind) {
                    nextMeta.kind = kind;
                    visitKeyDependencies(dependencyRecord, nextMeta, visit);
                    visitValueDependencies(dependencyRecord, nextMeta, visit);
                });
            }
            return graph;
        };
        return gotKey ? visit(obj, {}, key) : visit(obj, {});
    };
});