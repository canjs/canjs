/*!
 * CanJS - 2.3.29
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Tue, 21 Feb 2017 00:42:50 GMT
 * Licensed MIT
 */

/*can@2.3.29#view/target/target*/
define([
    'can/util/library',
    'can/elements'
], function (can, elements, vdom) {
    var processNodes = function (nodes, paths, location, document) {
            var frag = document.createDocumentFragment();
            for (var i = 0, len = nodes.length; i < len; i++) {
                var node = nodes[i];
                frag.appendChild(processNode(node, paths, location.concat(i), document));
            }
            return frag;
        }, keepsTextNodes = typeof document !== 'undefined' && function () {
            var testFrag = document.createDocumentFragment();
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(''));
            div.appendChild(document.createTextNode(''));
            testFrag.appendChild(div);
            var cloned = testFrag.cloneNode(true);
            return can.childNodes(cloned.firstChild).length === 2;
        }(), clonesWork = typeof document !== 'undefined' && function () {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            var clone = a.cloneNode(true);
            return clone.innerHTML === '<xyz></xyz>';
        }(), namespacesWork = typeof document !== 'undefined' && !!document.createElementNS, setAttribute = can.attr.setAttribute;
    var cloneNode = clonesWork ? function (el) {
        return el.cloneNode(true);
    } : function (node) {
        var copy;
        if (node.nodeType === 1) {
            copy = document.createElement(node.nodeName);
        } else if (node.nodeType === 3) {
            copy = document.createTextNode(node.nodeValue);
        } else if (node.nodeType === 8) {
            copy = document.createComment(node.nodeValue);
        } else if (node.nodeType === 11) {
            copy = document.createDocumentFragment();
        }
        if (node.attributes) {
            var attributes = can.makeArray(node.attributes);
            can.each(attributes, function (node) {
                if (node && node.specified) {
                    setAttribute(copy, node.nodeName, node.nodeValue);
                }
            });
        }
        if (node.childNodes) {
            can.each(node.childNodes, function (child) {
                copy.appendChild(cloneNode(child));
            });
        }
        return copy;
    };
    function processNode(node, paths, location, document) {
        var callback, loc = location, nodeType = typeof node, el, p, i, len;
        var getCallback = function () {
            if (!callback) {
                callback = {
                    path: location,
                    callbacks: []
                };
                paths.push(callback);
                loc = [];
            }
            return callback;
        };
        var setAttr = function (el, attr) {
            var value = node.attrs[attr];
            if (typeof value === 'function') {
                getCallback().callbacks.push({ callback: value });
            } else {
                setAttribute(el, attr, value);
            }
        };
        if (nodeType === 'object') {
            if (node.tag) {
                if (namespacesWork && node.namespace) {
                    el = document.createElementNS(node.namespace, node.tag);
                } else {
                    el = document.createElement(node.tag);
                }
                if (node.attrs) {
                    if (node.tag === 'input' && node.attrs.type) {
                        setAttr(el, 'type');
                        delete node.attrs.type;
                    }
                    for (var attrName in node.attrs) {
                        setAttr(el, attrName);
                    }
                }
                if (node.attributes) {
                    for (i = 0, len = node.attributes.length; i < len; i++) {
                        getCallback().callbacks.push({ callback: node.attributes[i] });
                    }
                }
                if (node.children && node.children.length) {
                    if (callback) {
                        p = callback.paths = [];
                    } else {
                        p = paths;
                    }
                    el.appendChild(processNodes(node.children, p, loc, document));
                }
            } else if (node.comment) {
                el = document.createComment(node.comment);
                if (node.callbacks) {
                    for (i = 0, len = node.attributes.length; i < len; i++) {
                        getCallback().callbacks.push({ callback: node.callbacks[i] });
                    }
                }
            }
        } else if (nodeType === 'string') {
            el = document.createTextNode(node);
        } else if (nodeType === 'function') {
            if (keepsTextNodes) {
                el = document.createTextNode('');
                getCallback().callbacks.push({ callback: node });
            } else {
                el = document.createComment('~');
                getCallback().callbacks.push({
                    callback: function () {
                        var el = document.createTextNode('');
                        elements.replace([this], el);
                        return node.apply(el, arguments);
                    }
                });
            }
        }
        return el;
    }
    function getCallbacks(el, pathData, elementCallbacks) {
        var path = pathData.path, callbacks = pathData.callbacks, paths = pathData.paths, child = el, pathLength = path ? path.length : 0, pathsLength = paths ? paths.length : 0;
        for (var i = 0; i < pathLength; i++) {
            child = child.childNodes.item(path[i]);
        }
        for (i = 0; i < pathsLength; i++) {
            getCallbacks(child, paths[i], elementCallbacks);
        }
        elementCallbacks.push({
            element: child,
            callbacks: callbacks
        });
    }
    function hydrateCallbacks(callbacks, args) {
        var len = callbacks.length, callbacksLength, callbackElement, callbackData;
        for (var i = 0; i < len; i++) {
            callbackData = callbacks[i];
            callbacksLength = callbackData.callbacks.length;
            callbackElement = callbackData.element;
            for (var c = 0; c < callbacksLength; c++) {
                callbackData.callbacks[c].callback.apply(callbackElement, args);
            }
        }
    }
    function makeTarget(nodes, doc) {
        var paths = [];
        var frag = processNodes(nodes, paths, [], doc || can.global.document);
        return {
            paths: paths,
            clone: frag,
            hydrate: function () {
                var cloned = cloneNode(this.clone);
                var args = can.makeArray(arguments);
                var callbacks = [];
                for (var i = 0; i < paths.length; i++) {
                    getCallbacks(cloned, paths[i], callbacks);
                }
                hydrateCallbacks(callbacks, args);
                return cloned;
            }
        };
    }
    makeTarget.keepsTextNodes = keepsTextNodes;
    can.view.target = makeTarget;
    return makeTarget;
});