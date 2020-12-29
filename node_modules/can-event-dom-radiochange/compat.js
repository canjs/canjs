"use strict";
var addEventCompat = require('can-dom-events/helpers/add-event-compat');
var radioChange = require('./can-event-dom-radiochange');

module.exports = function (domEvents, eventType) {
	return addEventCompat(domEvents, radioChange, eventType);
};
