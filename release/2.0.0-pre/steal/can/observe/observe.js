/*!
 * CanJS - 2.0.0-pre
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 16 Oct 2013 21:43:53 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
// Loads all observable core modules
steal("can/util","can/map","can/list","can/compute",function(can){
	can.Observe = can.Map;
	can.Observe.startBatch = can.batch.start;
	can.Observe.stopBatch = can.batch.stop;

	return can;
});
