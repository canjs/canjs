'use strict';

var domEvents = require('../can-dom-events');
var namespace = require('can-namespace');

/**
 * @function can-dom-events/helpers/add-jquery-events ./helpers/add-jquery-events
 * @parent can-dom-events.helpers
 * @description Add jQuery’s special events to the global registry.
 * @signature `addJQueryEvents(jQuery)`
 * @param {jQuery} jQuery Your instance of jQuery.
 * @return {function} The callback to remove the jQuery events from the registry.
 *
 * @body
 *
 * ```js
 * const $ = require("jquery");
 * const addJQueryEvents = require("can-dom-events/helpers/add-jquery-events");
 * const domEvents = require("can-dom-events");
 * // Require another module that registers itself with jQuery.event.special,
 * // e.g. jQuery++ registers events such as draginit, dragmove, etc.
 *
 * const removeJQueryEvents = addJQueryEvents($);
 *
 * // Listen for an event in code; this might also be accomplished through a
 * // can-stache-binding such as <li on:draginit="listener()">
 * domEvents.addEventListener(listItemElement, "draginit", function listener() {
 *   // Will fire after a jQuery draginit event has been fired
 * });
 *
 * // Some other code that fires a jQuery event; this will probably be in the
 * // package you’re using…
 * $(listItemElement).trigger("draginit");
 *
 * // Later in your code… ready to stop listening for those jQuery events? Call
 * // the function returned by addJQueryEvents()
 * removeJQueryEvents();
 * ```
 */
module.exports = namespace.addJQueryEvents = function addJQueryEvents(jQuery) {
	var jQueryEvents = jQuery.event.special;
	var removeEvents = [];

	for (var eventType in jQueryEvents) {
		if (!domEvents._eventRegistry.has(eventType)) {
			var eventDefinition = {
				defaultEventType: eventType,
				addEventListener: function (target, eventType, handler) {
					$(target).on(eventType, handler);
				},
				removeEventListener: function (target, eventType, handler) {
					$(target).off(eventType, handler);
				}
			};
			var removeEvent = domEvents.addEvent(eventDefinition);
			removeEvents.push(removeEvent);
		}
	}

	return function removeJQueryEvents() {
		removeEvents.forEach(function(removeEvent) {
			removeEvent();
		});
	};
};
