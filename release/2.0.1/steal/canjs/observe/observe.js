/*!
 * CanJS - 2.0.1
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Tue, 12 Nov 2013 22:05:56 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
// Loads all observable core modules
steal("can/util","can/map","can/list","can/compute",function(can){
	can.Observe = can.Map;
	can.Observe.startBatch = can.batch.start;
	can.Observe.stopBatch = can.batch.stop;
	can.Observe.triggerBatch = can.batch.trigger;
	return can;
});
