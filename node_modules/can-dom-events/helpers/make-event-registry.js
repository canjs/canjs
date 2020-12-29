'use strict';

function EventRegistry () {
	this._registry = {};
}

/**
 * @module can-dom-events/helpers/make-event-registry
 * @parent can-dom-events.helpers
 * @description Create an event registry.
 * @signature `makeEventRegistry()`
 *   @return {can-dom-events/EventRegistry}
 * @hide
 * 
 * @body
 *
 * ```js
 * var makeEventRegistry = require('can-dom-events/helpers/make-event-registry');
 * var registry = makeEventRegistry();
 *
 * var radioChange = require('can-events-dom-radiochange');
 * var removeRadioChange = registry.add(radioChange);
 *
 * registry.has('radiochange'); // => true
 * registry.get('radiochange'); // => radioChange
 *
 * removeRadioChange();
 * ```
 */
module.exports = function makeEventRegistry () {
	return new EventRegistry();
};

/**
 * @function make-event-registry.has eventRegistry.has
 *
 * Check whether an event type has already been registered.
 *
 * @signature `eventRegistry.has( eventType )`
 * @parent can-dom-events/EventRegistry
 * @param {String} eventType The event type for which to check.
 * @return {Boolean} Whether the event type is registered.
*/
EventRegistry.prototype.has = function (eventType) {
	return !!this._registry[eventType];
};

/**
 * @function make-event-registry.get eventRegistry.get
 *
 * Retrieve an event type which has already been registered.
 *
 * @signature `eventRegistry.get( eventType )`
 * @parent can-dom-events/EventRegistry
 * @param {String} eventType The event type for which to retrieve.
 * @return {EventDefinition} The registered event definition, or undefined if unregistered.
*/
EventRegistry.prototype.get = function (eventType) {
	return this._registry[eventType];
};

/**
 * @function make-event-registry.add eventRegistry.add
 *
 * Add an event to the registry.
 *
 * @signature `eventRegistry.add( event [, eventType ] )`
 * @parent can-dom-events/EventRegistry
 * @param {EventDefinition} event The event definition to register.
 * @param {String} eventType The event type with which to register the event.
 * @return {function} The callback to remove the event from the registry.
*/
EventRegistry.prototype.add = function (event, eventType) {
	if (!event) {
		throw new Error('An EventDefinition must be provided');
	}
	if (typeof event.addEventListener !== 'function') {
		throw new TypeError('EventDefinition addEventListener must be a function');
	}
	if (typeof event.removeEventListener !== 'function') {
		throw new TypeError('EventDefinition removeEventListener must be a function');
	}

	eventType = eventType || event.defaultEventType;
	if (typeof eventType !== 'string') {
		throw new TypeError('Event type must be a string, not ' + eventType);
	}

	if (this.has(eventType)) {
		throw new Error('Event "' + eventType + '" is already registered');
	}

	this._registry[eventType] = event;
	var self = this;
	return function remove () {
		self._registry[eventType] = undefined;
	};
};
