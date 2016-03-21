var can = require('can/util/can');
var general = require('can/util/util/general');
var events = require('can/util/util/events');
var inserted = require('can/util/inserted/inserted');
var deferred = require('can/util/deferred');
var dom = require('can/util/util/dom');

general.extend(can, general, events, dom, deferred, inserted);

module.exports = can;
