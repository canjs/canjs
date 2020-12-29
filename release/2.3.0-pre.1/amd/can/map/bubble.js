/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.1#map/lazy/bubble*/
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