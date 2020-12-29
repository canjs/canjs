"use strict";
var definition = require('../can-event-dom-enter');
var domEvents = require('can-dom-events');
module.exports = domEvents.addEvent(definition);
