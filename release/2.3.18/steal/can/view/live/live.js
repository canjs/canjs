/*!
 * CanJS - 2.3.18
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 03 Mar 2016 17:58:31 GMT
 * Licensed MIT
 */

/*can@2.3.18#view/live/live*/
steal('can/util', 'can/view/elements.js', 'can/view', 'can/view/node_lists', 'can/view/parser', 'can/util/array/diff.js', function (can, elements, view, nodeLists, parser, diff) {
    elements = elements || can.view.elements;
    nodeLists = nodeLists || can.view.NodeLists;
    parser = parser || can.view.parser;
    var setup = function (el, bind, unbind) {
            var tornDown = false, teardown = function () {
                    if (!tornDown) {
                        tornDown = true;
                        unbind(data);
                        can.unbind.call(el, 'removed', teardown);
                    }
                    return true;
                }, data = {
                    teardownCheck: function (parent) {
                        return parent ? false : teardown();
                    }
                };
            can.bind.call(el, 'removed', teardown);
            bind(data);
            return data;
        }, getChildNodes = function (node) {
            var childNodes = node.childNodes;
            if ('length' in childNodes) {
                return childNodes;
            } else {
                var cur = node.firstChild;
                var nodes = [];
                while (cur) {
                    nodes.push(cur);
                    cur = cur.nextSibling;
                }
                return nodes;
            }
        }, listen = function (el, compute, change) {
            return setup(el, function () {
                compute.computeInstance.bind('change', change);
            }, function (data) {
                compute.computeInstance.unbind('change', change);
                if (data.nodeList) {
                    nodeLists.unregister(data.nodeList);
                }
            });
        }, getAttributeParts = function (newVal) {
            var attrs = {}, attr;
            parser.parseAttrs(newVal, {
                attrStart: function (name) {
                    attrs[name] = '';
                    attr = name;
                },
                attrValue: function (value) {
                    attrs[attr] += value;
                },
                attrEnd: function () {
                }
            });
            return attrs;
        }, splice = [].splice, isNode = function (obj) {
            return obj && obj.nodeType;
        }, addTextNodeIfNoChildren = function (frag) {
            if (!frag.firstChild) {
                frag.appendChild(frag.ownerDocument.createTextNode(''));
            }
        }, getLiveFragment = function (itemHTML) {
            var gotText = typeof itemHTML === 'string', itemFrag = can.frag(itemHTML);
            return gotText ? can.view.hookup(itemFrag) : itemFrag;
        }, renderAndAddToNodeLists = function (newNodeLists, parentNodeList, render, context, args) {
            var itemNodeList = [];
            if (parentNodeList) {
                nodeLists.register(itemNodeList, null, parentNodeList, true);
                itemNodeList.parentList = parentNodeList;
                itemNodeList.expression = '#each SUBEXPRESSION';
            }
            var itemHTML = render.apply(context, args.concat([itemNodeList])), itemFrag = getLiveFragment(itemHTML);
            var childNodes = can.makeArray(getChildNodes(itemFrag));
            if (parentNodeList) {
                nodeLists.update(itemNodeList, childNodes);
                newNodeLists.push(itemNodeList);
            } else {
                newNodeLists.push(nodeLists.register(childNodes));
            }
            return itemFrag;
        }, removeFromNodeList = function (masterNodeList, index, length) {
            var removedMappings = masterNodeList.splice(index + 1, length), itemsToRemove = [];
            can.each(removedMappings, function (nodeList) {
                var nodesToRemove = nodeLists.unregister(nodeList);
                [].push.apply(itemsToRemove, nodesToRemove);
            });
            return itemsToRemove;
        }, addFalseyIfEmpty = function (list, falseyRender, masterNodeList, nodeList) {
            if (falseyRender && list.length === 0) {
                var falseyNodeLists = [];
                var falseyFrag = renderAndAddToNodeLists(falseyNodeLists, nodeList, falseyRender, list, [list]);
                elements.after([masterNodeList[0]], falseyFrag);
                masterNodeList.push(falseyNodeLists[0]);
            }
        }, childMutationCallbacks = {};
    var live = {
        registerChildMutationCallback: function (tag, callback) {
            if (callback) {
                childMutationCallbacks[tag] = callback;
            } else {
                return childMutationCallbacks[tag];
            }
        },
        callChildMutationCallback: function (el) {
            var callback = el && childMutationCallbacks[el.nodeName.toLowerCase()];
            if (callback) {
                callback(el);
            }
        },
        list: function (el, compute, render, context, parentNode, nodeList, falseyRender) {
            var masterNodeList = nodeList || [el], indexMap = [], afterPreviousEvents = false, isTornDown = false, add = function (ev, items, index) {
                    if (!afterPreviousEvents) {
                        return;
                    }
                    var frag = text.ownerDocument.createDocumentFragment(), newNodeLists = [], newIndicies = [];
                    can.each(items, function (item, key) {
                        var itemIndex = can.compute(key + index), itemFrag = renderAndAddToNodeLists(newNodeLists, nodeList, render, context, [
                                item,
                                itemIndex
                            ]);
                        frag.appendChild(itemFrag);
                        newIndicies.push(itemIndex);
                    });
                    var masterListIndex = index + 1;
                    if (!indexMap.length) {
                        var falseyItemsToRemove = removeFromNodeList(masterNodeList, 0, masterNodeList.length - 1);
                        can.remove(can.$(falseyItemsToRemove));
                    }
                    if (!masterNodeList[masterListIndex]) {
                        elements.after(masterListIndex === 1 ? [text] : [nodeLists.last(masterNodeList[masterListIndex - 1])], frag);
                    } else {
                        var el = nodeLists.first(masterNodeList[masterListIndex]);
                        can.insertBefore(el.parentNode, frag, el);
                    }
                    splice.apply(masterNodeList, [
                        masterListIndex,
                        0
                    ].concat(newNodeLists));
                    splice.apply(indexMap, [
                        index,
                        0
                    ].concat(newIndicies));
                    for (var i = index + newIndicies.length, len = indexMap.length; i < len; i++) {
                        indexMap[i](i);
                    }
                    if (ev.callChildMutationCallback !== false) {
                        live.callChildMutationCallback(text.parentNode);
                    }
                }, set = function (ev, newVal, index) {
                    remove({}, { length: 1 }, index, true);
                    add({}, [newVal], index);
                }, remove = function (ev, items, index, duringTeardown, fullTeardown) {
                    if (!afterPreviousEvents) {
                        return;
                    }
                    if (!duringTeardown && data.teardownCheck(text.parentNode)) {
                        return;
                    }
                    if (index < 0) {
                        index = indexMap.length + index;
                    }
                    var itemsToRemove = removeFromNodeList(masterNodeList, index, items.length);
                    indexMap.splice(index, items.length);
                    for (var i = index, len = indexMap.length; i < len; i++) {
                        indexMap[i](i);
                    }
                    if (!fullTeardown) {
                        addFalseyIfEmpty(list, falseyRender, masterNodeList, nodeList);
                        can.remove(can.$(itemsToRemove));
                        if (ev.callChildMutationCallback !== false) {
                            live.callChildMutationCallback(text.parentNode);
                        }
                    } else {
                        nodeLists.unregister(masterNodeList);
                    }
                }, move = function (ev, item, newIndex, currentIndex) {
                    if (!afterPreviousEvents) {
                        return;
                    }
                    newIndex = newIndex + 1;
                    currentIndex = currentIndex + 1;
                    var referenceNodeList = masterNodeList[newIndex];
                    var movedElements = can.frag(nodeLists.flatten(masterNodeList[currentIndex]));
                    var referenceElement;
                    if (currentIndex < newIndex) {
                        referenceElement = nodeLists.last(referenceNodeList).nextSibling;
                    } else {
                        referenceElement = nodeLists.first(referenceNodeList);
                    }
                    var parentNode = masterNodeList[0].parentNode;
                    parentNode.insertBefore(movedElements, referenceElement);
                    var temp = masterNodeList[currentIndex];
                    [].splice.apply(masterNodeList, [
                        currentIndex,
                        1
                    ]);
                    [].splice.apply(masterNodeList, [
                        newIndex,
                        0,
                        temp
                    ]);
                    newIndex = newIndex - 1;
                    currentIndex = currentIndex - 1;
                    var indexCompute = indexMap[currentIndex];
                    [].splice.apply(indexMap, [
                        currentIndex,
                        1
                    ]);
                    [].splice.apply(indexMap, [
                        newIndex,
                        0,
                        indexCompute
                    ]);
                    var i = Math.min(currentIndex, newIndex);
                    var len = indexMap.length;
                    for (i, len; i < len; i++) {
                        indexMap[i](i);
                    }
                    if (ev.callChildMutationCallback !== false) {
                        live.callChildMutationCallback(text.parentNode);
                    }
                }, text = el.ownerDocument.createTextNode(''), list, teardownList = function (fullTeardown) {
                    if (list && list.unbind) {
                        list.unbind('add', add).unbind('set', set).unbind('remove', remove).unbind('move', move);
                    }
                    remove({ callChildMutationCallback: !!fullTeardown }, { length: masterNodeList.length - 1 }, 0, true, fullTeardown);
                }, updateList = function (ev, newList, oldList) {
                    if (isTornDown) {
                        return;
                    }
                    afterPreviousEvents = true;
                    if (newList && oldList) {
                        list = newList || [];
                        var patches = diff(oldList, newList);
                        if (oldList.unbind) {
                            oldList.unbind('add', add).unbind('set', set).unbind('remove', remove).unbind('move', move);
                        }
                        for (var i = 0, patchLen = patches.length; i < patchLen; i++) {
                            var patch = patches[i];
                            if (patch.deleteCount) {
                                remove({ callChildMutationCallback: false }, { length: patch.deleteCount }, patch.index, true);
                            }
                            if (patch.insert.length) {
                                add({ callChildMutationCallback: false }, patch.insert, patch.index);
                            }
                        }
                    } else {
                        if (oldList) {
                            teardownList();
                        }
                        list = newList || [];
                        add({ callChildMutationCallback: false }, list, 0);
                        addFalseyIfEmpty(list, falseyRender, masterNodeList, nodeList);
                    }
                    live.callChildMutationCallback(text.parentNode);
                    afterPreviousEvents = false;
                    if (list.bind) {
                        list.bind('add', add).bind('set', set).bind('remove', remove).bind('move', move);
                    }
                    can.batch.afterPreviousEvents(function () {
                        afterPreviousEvents = true;
                    });
                };
            parentNode = elements.getParentNode(el, parentNode);
            var data = setup(parentNode, function () {
                if (can.isFunction(compute)) {
                    compute.bind('change', updateList);
                }
            }, function () {
                if (can.isFunction(compute)) {
                    compute.unbind('change', updateList);
                }
                teardownList(true);
            });
            if (!nodeList) {
                live.replace(masterNodeList, text, data.teardownCheck);
            } else {
                elements.replace(masterNodeList, text);
                nodeLists.update(masterNodeList, [text]);
                nodeList.unregistered = function () {
                    data.teardownCheck();
                    isTornDown = true;
                };
            }
            updateList({}, can.isFunction(compute) ? compute() : compute);
        },
        html: function (el, compute, parentNode, nodeList) {
            var data;
            parentNode = elements.getParentNode(el, parentNode);
            data = listen(parentNode, compute, function (ev, newVal, oldVal) {
                var attached = nodeLists.first(nodes).parentNode;
                if (attached) {
                    makeAndPut(newVal);
                }
                var pn = nodeLists.first(nodes).parentNode;
                data.teardownCheck(pn);
                live.callChildMutationCallback(pn);
            });
            var nodes = nodeList || [el], makeAndPut = function (val) {
                    var isFunction = typeof val === 'function', aNode = isNode(val), frag = can.frag(isFunction ? '' : val), oldNodes = can.makeArray(nodes);
                    addTextNodeIfNoChildren(frag);
                    if (!aNode && !isFunction) {
                        frag = can.view.hookup(frag, parentNode);
                    }
                    oldNodes = nodeLists.update(nodes, getChildNodes(frag));
                    if (isFunction) {
                        val(frag.firstChild);
                    }
                    elements.replace(oldNodes, frag);
                };
            data.nodeList = nodes;
            if (!nodeList) {
                nodeLists.register(nodes, data.teardownCheck);
            } else {
                nodeList.unregistered = data.teardownCheck;
            }
            makeAndPut(compute());
        },
        replace: function (nodes, val, teardown) {
            var oldNodes = nodes.slice(0), frag = can.frag(val);
            nodeLists.register(nodes, teardown);
            if (typeof val === 'string') {
                frag = can.view.hookup(frag, nodes[0].parentNode);
            }
            nodeLists.update(nodes, getChildNodes(frag));
            elements.replace(oldNodes, frag);
            return nodes;
        },
        text: function (el, compute, parentNode, nodeList) {
            var parent = elements.getParentNode(el, parentNode);
            var data = listen(parent, compute, function (ev, newVal, oldVal) {
                if (typeof node.nodeValue !== 'unknown') {
                    node.nodeValue = can.view.toStr(newVal);
                }
                data.teardownCheck(node.parentNode);
            });
            var node = el.ownerDocument.createTextNode(can.view.toStr(compute()));
            if (nodeList) {
                nodeList.unregistered = data.teardownCheck;
                data.nodeList = nodeList;
                nodeLists.update(nodeList, [node]);
                elements.replace([el], node);
            } else {
                data.nodeList = live.replace([el], node, data.teardownCheck);
            }
        },
        setAttributes: function (el, newVal) {
            var attrs = getAttributeParts(newVal);
            for (var name in attrs) {
                can.attr.set(el, name, attrs[name]);
            }
        },
        attributes: function (el, compute, currentValue) {
            var oldAttrs = {};
            var setAttrs = function (newVal) {
                var newAttrs = getAttributeParts(newVal), name;
                for (name in newAttrs) {
                    var newValue = newAttrs[name], oldValue = oldAttrs[name];
                    if (newValue !== oldValue) {
                        can.attr.set(el, name, newValue);
                    }
                    delete oldAttrs[name];
                }
                for (name in oldAttrs) {
                    elements.removeAttr(el, name);
                }
                oldAttrs = newAttrs;
            };
            listen(el, compute, function (ev, newVal) {
                setAttrs(newVal);
            });
            if (arguments.length >= 3) {
                oldAttrs = getAttributeParts(currentValue);
            } else {
                setAttrs(compute());
            }
        },
        attributePlaceholder: '__!!__',
        attributeReplace: /__!!__/g,
        attribute: function (el, attributeName, compute) {
            listen(el, compute, function (ev, newVal) {
                elements.setAttr(el, attributeName, hook.render());
            });
            var wrapped = can.$(el), hooks;
            hooks = can.data(wrapped, 'hooks');
            if (!hooks) {
                can.data(wrapped, 'hooks', hooks = {});
            }
            var attr = String(elements.getAttr(el, attributeName)), parts = attr.split(live.attributePlaceholder), goodParts = [], hook;
            goodParts.push(parts.shift(), parts.join(live.attributePlaceholder));
            if (hooks[attributeName]) {
                hooks[attributeName].computes.push(compute);
            } else {
                hooks[attributeName] = {
                    render: function () {
                        var i = 0, newAttr = attr ? attr.replace(live.attributeReplace, function () {
                                return elements.contentText(hook.computes[i++]());
                            }) : elements.contentText(hook.computes[i++]());
                        return newAttr;
                    },
                    computes: [compute],
                    batchNum: undefined
                };
            }
            hook = hooks[attributeName];
            goodParts.splice(1, 0, compute());
            elements.setAttr(el, attributeName, goodParts.join(''));
        },
        specialAttribute: function (el, attributeName, compute) {
            listen(el, compute, function (ev, newVal) {
                elements.setAttr(el, attributeName, getValue(newVal));
            });
            elements.setAttr(el, attributeName, getValue(compute()));
        },
        simpleAttribute: function (el, attributeName, compute) {
            listen(el, compute, function (ev, newVal) {
                elements.setAttr(el, attributeName, newVal);
            });
            elements.setAttr(el, attributeName, compute());
        }
    };
    live.attr = live.simpleAttribute;
    live.attrs = live.attributes;
    live.getAttributeParts = getAttributeParts;
    var newLine = /(\r|\n)+/g;
    var getValue = function (val) {
        var regexp = /^["'].*["']$/;
        val = val.replace(elements.attrReg, '').replace(newLine, '');
        return regexp.test(val) ? val.substr(1, val.length - 2) : val;
    };
    can.view.live = live;
    return live;
});