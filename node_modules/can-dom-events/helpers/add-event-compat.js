'use strict';
/*
	This module conforms to the can-util 3.x custom event
	overriding behavior. This module is a compatibility
	layer for using new custom events.
*/

var util = require('./util');
var addDomContext = util.addDomContext;
var removeDomContext = util.removeDomContext;

function isDomEvents (obj) {
	return !!(obj && obj.addEventListener && obj.removeEventListener && obj.dispatch);
}

function isNewEvents (obj) {
	return typeof obj.addEvent === 'function';
}

module.exports = function addEventCompat (domEvents, customEvent, customEventType) {
	if (!isDomEvents(domEvents)) {
		throw new Error ('addEventCompat() must be passed can-dom-events or can-util/dom/events/events');
	}

	customEventType = customEventType || customEvent.defaultEventType;
	if (isNewEvents(domEvents)) {
		return domEvents.addEvent(customEvent, customEventType);
	}

	var registry = domEvents._compatRegistry;
	if (!registry) {
		registry = domEvents._compatRegistry = {};
	}

	if (registry[customEventType]) {
		return function noopRemoveOverride () {};
	}

	registry[customEventType] = customEvent;

	var newEvents = {
		addEventListener: function () {
			var data = removeDomContext(this, arguments);
			return domEvents.addEventListener.apply(data.context, data.args);
		},
		removeEventListener: function () {
			var data = removeDomContext(this, arguments);
			return domEvents.removeEventListener.apply(data.context, data.args);
		},
		dispatch: function () {
			var data = removeDomContext(this, arguments);
			// in can-util, dispatch had args as its own parameter
			var eventData = data.args[0];
			var eventArgs = typeof eventData === 'object' ? eventData.args : [];
			data.args.splice(1, 0, eventArgs);
			return domEvents.dispatch.apply(data.context, data.args);
		}
	};

	var isOverriding = true;
	var oldAddEventListener = domEvents.addEventListener;
	var addEventListener = domEvents.addEventListener = function addEventListener (eventName) {
		if (isOverriding && eventName === customEventType) {
			var args = addDomContext(this, arguments);
			customEvent.addEventListener.apply(newEvents, args);
		}
		return oldAddEventListener.apply(this, arguments);
	};

	var oldRemoveEventListener = domEvents.removeEventListener;
	var removeEventListener = domEvents.removeEventListener = function removeEventListener (eventName) {
		if (isOverriding && eventName === customEventType) {
			var args = addDomContext(this, arguments);
			customEvent.removeEventListener.apply(newEvents, args);
		}
		return oldRemoveEventListener.apply(this, arguments);
	};

	return function removeOverride () {
		isOverriding = false;
		registry[customEventType] = null;
		if (domEvents.addEventListener === addEventListener) {
			domEvents.addEventListener = oldAddEventListener;
		}
		if (domEvents.removeEventListener === removeEventListener) {
			domEvents.removeEventListener = oldRemoveEventListener;
		}
	};
};
