/*!
 * CanJS - 2.3.23
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 08 Apr 2016 17:58:15 GMT
 * Licensed MIT
 */

/*can@2.3.23#map/bubble*/
var can = require('../util/util.js');
var bubble = can.bubble = {
    bind: function (parent, eventName) {
        if (!parent.__inSetup) {
            var bubbleEvents = bubble.events(parent, eventName), len = bubbleEvents.length, bubbleEvent;
            if (!parent._bubbleBindings) {
                parent._bubbleBindings = {};
            }
            for (var i = 0; i < len; i++) {
                bubbleEvent = bubbleEvents[i];
                if (!parent._bubbleBindings[bubbleEvent]) {
                    parent._bubbleBindings[bubbleEvent] = 1;
                    bubble.childrenOf(parent, bubbleEvent);
                } else {
                    parent._bubbleBindings[bubbleEvent]++;
                }
            }
        }
    },
    unbind: function (parent, eventName) {
        var bubbleEvents = bubble.events(parent, eventName), len = bubbleEvents.length, bubbleEvent;
        for (var i = 0; i < len; i++) {
            bubbleEvent = bubbleEvents[i];
            if (parent._bubbleBindings) {
                parent._bubbleBindings[bubbleEvent]--;
            }
            if (parent._bubbleBindings && !parent._bubbleBindings[bubbleEvent]) {
                delete parent._bubbleBindings[bubbleEvent];
                bubble.teardownChildrenFrom(parent, bubbleEvent);
                if (can.isEmptyObject(parent._bubbleBindings)) {
                    delete parent._bubbleBindings;
                }
            }
        }
    },
    add: function (parent, child, prop) {
        if (child instanceof can.Map && parent._bubbleBindings) {
            for (var eventName in parent._bubbleBindings) {
                if (parent._bubbleBindings[eventName]) {
                    bubble.teardownFromParent(parent, child, eventName);
                    bubble.toParent(child, parent, prop, eventName);
                }
            }
        }
    },
    addMany: function (parent, children) {
        for (var i = 0, len = children.length; i < len; i++) {
            bubble.add(parent, children[i], i);
        }
    },
    remove: function (parent, child) {
        if (child instanceof can.Map && parent._bubbleBindings) {
            for (var eventName in parent._bubbleBindings) {
                if (parent._bubbleBindings[eventName]) {
                    bubble.teardownFromParent(parent, child, eventName);
                }
            }
        }
    },
    removeMany: function (parent, children) {
        for (var i = 0, len = children.length; i < len; i++) {
            bubble.remove(parent, children[i]);
        }
    },
    set: function (parent, prop, value, current) {
        if (can.isMapLike(value)) {
            bubble.add(parent, value, prop);
        }
        if (can.isMapLike(current)) {
            bubble.remove(parent, current);
        }
        return value;
    },
    events: function (map, boundEventName) {
        return map.constructor._bubbleRule(boundEventName, map);
    },
    toParent: function (child, parent, prop, eventName) {
        can.listenTo.call(parent, child, eventName, function () {
            var args = can.makeArray(arguments), ev = args.shift();
            args[0] = (can.List && parent instanceof can.List ? parent.indexOf(child) : prop) + (args[0] ? '.' + args[0] : '');
            ev.triggeredNS = ev.triggeredNS || {};
            if (ev.triggeredNS[parent._cid]) {
                return;
            }
            ev.triggeredNS[parent._cid] = true;
            can.trigger(parent, ev, args);
            if (eventName === 'change') {
                can.trigger(parent, args[0], [
                    args[2],
                    args[3]
                ]);
            }
        });
    },
    childrenOf: function (parent, eventName) {
        parent._each(function (child, prop) {
            if (child && child.bind) {
                bubble.toParent(child, parent, prop, eventName);
            }
        });
    },
    teardownFromParent: function (parent, child, eventName) {
        if (child && child.unbind) {
            can.stopListening.call(parent, child, eventName);
        }
    },
    teardownChildrenFrom: function (parent, eventName) {
        parent._each(function (child) {
            bubble.teardownFromParent(parent, child, eventName);
        });
    },
    isBubbling: function (parent, eventName) {
        return parent._bubbleBindings && parent._bubbleBindings[eventName];
    }
};
module.exports = bubble;