'use strict';

var domMutate = require('../can-dom-mutate');
var namespace = require('can-namespace');

/**
 * @module {{}} can-dom-mutate/events/events
 * @parent can-dom-mutate/modules
 * 
 * @description This adds attributes, inserted and removed attributes to the DOM.
 * @signature `domMutateEvents`
 * 
 * `can-dom-mutate/events/events` Exports an object that allows to listen ```attributes```, ```inserted``` and ```removed``` events 
 *  in the DOM using [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
 * 
 * ```js
 * import domMutateEvents from "can-dom-mutate/events/events";
 * import domEvents from "can-dom-events";
 *
 * domMutateEvents //->
 * {
 *   attributes: {defaultEventType, addEventListener(), removeEventListener()},
 *   inserted: {defaultEventType, addEventListener(), removeEventListener},
 *   removed: {defaultEventType, addEventListener(), removeEventListener()},
 * }
 *
 * // listen to inserted change within an element:
 * // add inserted event to registry
 * domEvents.addEvent(domMutateEvents.inserted);
 * domEvent.addEventListener(document.querySelector("#foo"), "inserted", handler () => {})
 * ```
 */

function makeMutationEvent (defaultEventType, subscription, bubbles) {
	var elementSubscriptions = new Map();
	return {
		_subscriptions: elementSubscriptions,
		defaultEventType: defaultEventType,
		addEventListener: function (target, eventType, handler) {
			var dispatch = this.dispatch;
			var data = elementSubscriptions.get(target);
			if (!data) {
				data = {
					removeListener: null,
					listeners: new Set()
				};
				elementSubscriptions.set(target, data);
			}

			if (data.listeners.size === 0) {
				data.removeListener = subscription(target, function (mutation) {
					var eventData = {type: eventType};
					for (var key in mutation) {
						eventData[key] = mutation[key];
					}

					dispatch(target, eventData, bubbles !== false);
				});
			}

			data.listeners.add(handler);
			target.addEventListener(eventType, handler);
		},
		removeEventListener: function (target, eventType, handler) {
			target.removeEventListener(eventType, handler);
			var data = elementSubscriptions.get(target);
			if (data) {
				data.listeners['delete'](handler);
				if (data.listeners.size === 0) {
					data.removeListener();
					elementSubscriptions['delete'](target);
				}
			}		
		}
	};
}

module.exports = namespace.domMutateDomEvents = {
	attributes: makeMutationEvent('attributes', domMutate.onNodeAttributeChange),
	inserted: makeMutationEvent('inserted', domMutate.onNodeConnected, false),
	removed: makeMutationEvent('removed', domMutate.onNodeDisconnected)
};
