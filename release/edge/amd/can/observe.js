/*!
 * CanJS - 2.1.2-pre
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Thu, 12 Jun 2014 22:19:03 GMT
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