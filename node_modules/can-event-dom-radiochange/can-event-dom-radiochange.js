'use strict';

var getDocument = require('can-globals/document/document');
var namespace = require('can-namespace');

function getRoot () {
	return getDocument().documentElement;
}

function findParentForm (el) {
	while (el) {
		if (el.nodeName === 'FORM') {
			break;
		}
		el = el.parentNode;
	}
	return el;
}

function shouldReceiveEventFromRadio (source, dest) {
	// Must have the same name attribute and parent form
	var name = source.getAttribute('name');
	return (
		name &&
		name === dest.getAttribute('name') &&
		findParentForm(source) === findParentForm(dest)
	);
}

function isRadioInput (el) {
	return el.nodeName === 'INPUT' && el.type === 'radio';
}


function attachRootListener (domEvents, eventTypeTargets) {
	var root = getRoot();
	var newListener = function (event) {
		var target = event.target;
		if (!isRadioInput(target)) {
			return;
		}

		for (var eventType in eventTypeTargets) {
			var newEvent = {type: eventType};
			var listeningNodes = eventTypeTargets[eventType];
			listeningNodes.forEach(function (el) {
				if (shouldReceiveEventFromRadio(target, el)) {
					domEvents.dispatch(el, newEvent, false);
				}
			});
		}
	};
	domEvents.addEventListener(root, 'change', newListener);
	return newListener;
}

function detachRootListener (domEvents, listener) {
	var root = getRoot();
	domEvents.removeEventListener(root, 'change', listener);
}

/**
 * @module {events} can-event-dom-radiochange
 * @parent can-dom-utilities
 * @collection can-infrastructure
 * @package ./package.json
 *
 * A custom event for listening to changes of inputs with type "radio",
 * which fires when a conflicting radio input changes. A "conflicting"
 * radio button has the same "name" attribute and exists within in the
 * same form, or lack thereof. This event coordinates state bound to
 * whether a radio is checked. The "change" event does not fire for deselected
 * radios. By using this event instead, deselected radios receive notification.
 *
 * ```js
 * var domEvents = require('can-dom-events');
 * var radioChange = require('can-event-dom-radiochange');
 * domEvents.addEvent(radioChange);
 *
 * var target = document.createElement('input');
 *
 * function handler () {
 * 	console.log('radiochange event fired');
 * }
 *
 * domEvents.addEventListener(target, 'radiochange', handler);
 * domEvents.removeEventListener(target, 'radiochange', handler);
 * ```
 */
var radioChangeEvent = {
	defaultEventType: 'radiochange',

	addEventListener: function (target, eventType, handler) {
		if (!isRadioInput(target)) {
			throw new Error('Listeners for ' + eventType + ' must be radio inputs');
		}

		var eventTypeTrackedRadios = radioChangeEvent._eventTypeTrackedRadios;
		if (!eventTypeTrackedRadios) {
			eventTypeTrackedRadios = radioChangeEvent._eventTypeTrackedRadios = {};
			if (!radioChangeEvent._rootListener) {
				radioChangeEvent._rootListener = attachRootListener(this, eventTypeTrackedRadios);
			}			
		}

		var trackedRadios = radioChangeEvent._eventTypeTrackedRadios[eventType];
		if (!trackedRadios) {
			trackedRadios = radioChangeEvent._eventTypeTrackedRadios[eventType] = new Set();
		}

		trackedRadios.add(target);
		target.addEventListener(eventType, handler);
	},

	removeEventListener: function (target, eventType, handler) {
		target.removeEventListener(eventType, handler);

		var eventTypeTrackedRadios = radioChangeEvent._eventTypeTrackedRadios;
		if (!eventTypeTrackedRadios) {
			return;
		}

		var trackedRadios = eventTypeTrackedRadios[eventType];
		if (!trackedRadios) {
			return;
		}
	
		trackedRadios.delete(target);
		if (trackedRadios.size === 0) {
			delete eventTypeTrackedRadios[eventType];
			for (var key in eventTypeTrackedRadios) {
				if (eventTypeTrackedRadios.hasOwnProperty(key)) {
					return;
				}						
			}
			delete radioChangeEvent._eventTypeTrackedRadios;
			detachRootListener(this, radioChangeEvent._rootListener);
			delete radioChangeEvent._rootListener;
		}
	}
};

module.exports = namespace.domEventRadioChange = radioChangeEvent;
