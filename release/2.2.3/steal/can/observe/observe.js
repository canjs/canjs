/*!
 * CanJS - 2.2.3
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 03 Apr 2015 15:31:35 GMT
 * Licensed MIT
 */

/*can@2.2.3#observe/observe*/
// Loads all observable core modules
steal("can/util", "can/map", "can/list", "can/compute", function (can) {
	can.Observe = can.Map;
	can.Observe.startBatch = can.batch.start;
	can.Observe.stopBatch = can.batch.stop;
	can.Observe.triggerBatch = can.batch.trigger;
	return can;
});

