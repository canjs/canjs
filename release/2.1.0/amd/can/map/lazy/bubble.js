/*!
 * CanJS - 2.1.0
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Mon, 05 May 2014 22:15:43 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/library", "can/map/bubble"], function(can) {
	var bubble = can.bubble;

	return can.extend({}, bubble, {
		childrenOf: function (parentMap, eventName) {
			if(parentMap._nestedReference) {
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