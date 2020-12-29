'use strict';
/*
	This module makes can-dom-event custom events
	work with jQuery instead of can-dom-events.
*/

var util = require('./util');

module.exports = function addEventJQuery (jQuery, customEvent, customEventType) {
	customEventType = customEventType || customEvent.defaultEventType;
	var existingEvent = jQuery.event.special[customEventType];
	if (existingEvent) {
		throw new Error('Special event type "' + customEventType + '" already exists');
	}

	var domEvents = {
		addEventListener: function (target, eventType, handler) {
			$(target).on(eventType, handler);
		},
		removeEventListener: function (target, eventType, handler) {
			$(target).off(eventType, handler);
		},
		dispatch: function (target) {
			var event = util.createEvent.apply(null, arguments);
			$(target).trigger(event);
		}
	};

	var event = {
		add: function (handleObj) {
			var target = this;
			var eventType = handleObj.origType;
			var handler = handleObj.handler;
			customEvent.addEventListener.call(domEvents, target, eventType, handler);
		},
		remove: function (handleObj) {
			var target = this;
			var eventType = handleObj.origType;
			var handler = handleObj.handler;
			customEvent.removeEventListener.call(domEvents, target, eventType, handler);
		}
	};

	jQuery.event.special[customEventType] = event;
	return function removeEventJQuery () {
		delete jQuery.event.special[customEventType];
	};
};
