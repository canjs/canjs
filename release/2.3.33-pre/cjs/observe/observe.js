/*!
 * CanJS - 2.3.32
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Wed, 13 Sep 2017 22:08:47 GMT
 * Licensed MIT
 */

/*can@2.3.32#observe/observe*/
var can = require('../util/util.js');
require('../map/map.js');
require('../list/list.js');
require('../compute/compute.js');
can.Observe = can.Map;
can.Observe.startBatch = can.batch.start;
can.Observe.stopBatch = can.batch.stop;
can.Observe.triggerBatch = can.batch.trigger;
module.exports = can;