/*!
 * CanJS - 2.0.6
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Fri, 14 Mar 2014 21:59:09 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
define(["can/util/library", "can/map", "can/list", "can/compute"], function (can) {
	can.Observe = can.Map;
	can.Observe.startBatch = can.batch.start;
	can.Observe.stopBatch = can.batch.stop;
	can.Observe.triggerBatch = can.batch.trigger;
	return can;
});