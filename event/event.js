var can = require('../util/can');

can.assign(can, require('can-event'));
can.batch = require('can-event/batch/batch');

module.exports = can;
