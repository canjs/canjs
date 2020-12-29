/*!
 * CanJS - 2.3.10
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 15 Jan 2016 00:42:09 GMT
 * Licensed MIT
 */

/*can@2.3.10#map/lazy/bubble*/
var can = require('../../util/util.js');
require('../bubble.js');
var bubble = can.bubble;
module.exports = can.extend({}, bubble, {
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