/*!
 * CanJS - 2.3.9
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Mon, 11 Jan 2016 23:51:29 GMT
 * Licensed MIT
 */

/*can@2.3.9#map/lazy/bubble*/
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