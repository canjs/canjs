/*!
 * CanJS - 2.3.32
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Wed, 13 Sep 2017 22:08:47 GMT
 * Licensed MIT
 */

/*can@2.3.32#map/lazy/bubble*/
define([
    'can/util/library',
    'can/bubble'
], function (can) {
    var bubble = can.bubble;
    return can.extend({}, bubble, {
        childrenOf: function (parentMap, eventName) {
            if (parentMap._nestedReference) {
                parentMap._nestedReference.each(function (child, ref) {
                    if (child && child.bind) {
                        bubble.toParent(child, parentMap, ref(), eventName);
                    }
                });
            } else {
                bubble._each.apply(this, arguments);
            }
        }
    });
});