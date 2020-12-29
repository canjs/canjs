/*!
 * CanJS - 2.1.3
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Mon, 25 Aug 2014 21:51:29 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
// Loads all observable core modules
steal("can/util", "can/map", "can/list", "can/compute", function (can) {
	can.Observe = can.Map;
	can.Observe.startBatch = can.batch.start;
	can.Observe.stopBatch = can.batch.stop;
	can.Observe.triggerBatch = can.batch.trigger;
	return can;
});
