// Loads all observable core modules
var can = require('can/util/util');
require('can/compute/compute');
require('can/map/map');
require('can/list/list');

can.Observe = can.Map;
can.Observe.startBatch = can.batch.start;
can.Observe.stopBatch = can.batch.stop;
can.Observe.triggerBatch = can.batch.trigger;

module.exports = exports = can;
