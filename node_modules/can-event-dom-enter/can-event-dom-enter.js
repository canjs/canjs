'use strict';
var namespace = require('can-namespace');

var baseEventType = 'keyup';

function isEnterEvent (event) {
	var hasEnterKey = event.key === 'Enter';
	var hasEnterCode = event.keyCode === 13;
	return hasEnterKey || hasEnterCode;
}

/**
 * @module {events} can-event-dom-enter
 * @parent can-dom-utilities
 * @collection can-infrastructure
 * @group can-event-dom-enter.modules modules
 * @package ./package.json
 *
 * Watch for when enter keys are pressed on a DomEventTarget.
 *
 * ```js
 * var domEvents = require('can-dom-events');
 * var enterEvent = require('can-event-dom-enter');
 *
 * domEvents.addEvent(enterEvent);
 *
 * var input = document.createElement('input');
 * function enterEventHandler() {
 * 	console.log('enter key pressed');
 * }
 *
 * domEvents.addEventHandler(input, 'enter', enterEventHandler);
 * domEvents.dispatch(input, {
 *   type: 'keyup',
 *   keyCode: keyCode
 * });
 * ```
 */
var enterEvent = {
	defaultEventType: 'enter',

	addEventListener: function (target, eventType, handler) {
		var keyHandler = function (event) {
			if (isEnterEvent(event)) {
				return handler.apply(this, arguments);
			}
		};

		var handlerMap = enterEvent._eventTypeHandlerMap[eventType];
		if (!handlerMap) {
			handlerMap = enterEvent._eventTypeHandlerMap[eventType] = new Map();
		}

		handlerMap.set(handler, keyHandler);
		this.addEventListener(target, baseEventType, keyHandler);
	},

	removeEventListener: function (target, eventType, handler) {
		var handlerMap = enterEvent._eventTypeHandlerMap[eventType];
		if (handlerMap) {
			var keyHandler = handlerMap.get(handler);
			if (keyHandler) {
				handlerMap.delete(handler);
				if (handlerMap.size === 0) {
					delete enterEvent._eventTypeHandlerMap[eventType];
				}
				this.removeEventListener(target, baseEventType, keyHandler);
			}
		}
	},

	// {[eventType: string]: WeakMap<OriginalHandler, KeyEventHandler>}
	_eventTypeHandlerMap: {}
};

module.exports = namespace.domEventEnter = enterEvent;
