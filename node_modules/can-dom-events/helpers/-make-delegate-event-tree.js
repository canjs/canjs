"use strict";
var KeyTree = require('can-key-tree');
var canReflect = require('can-reflect');

// Some events do not bubble, so delegating them requires registering the handler in the
// capturing phase.
// http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
var useCapture = function(eventType) {
	return eventType === 'focus' || eventType === 'blur';
};

function makeDelegator (domEvents) {
	var Delegator = function Delegator (parentKey){
		this.element = parentKey; // HTMLElement
		this.events = {}; // {[eventType: string]: Array<(event) -> void>}
		this.delegated = {}; // {[eventType: string]: (event) -> void}
	};

	canReflect.assignSymbols( Delegator.prototype, {
		"can.setKeyValue": function(eventType, handlersBySelector){
			var handler = this.delegated[eventType] = function(ev){
				var cur = ev.target;
				var propagate = true;
				var origStopPropagation = ev.stopPropagation;
				ev.stopPropagation = function() {
					origStopPropagation.apply(this, arguments);
					propagate = false;
				};
				var origStopImmediatePropagation = ev.stopImmediatePropagation;
				ev.stopImmediatePropagation = function() {
					origStopImmediatePropagation.apply(this, arguments);
					propagate = false;
				};
				do {
					// document does not implement `.matches` but documentElement does
					var el = cur === document ? document.documentElement : cur;
					var matches = el.matches || el.msMatchesSelector;

					canReflect.each(handlersBySelector, function(handlers, selector){
						// Text and comment nodes may be included in mutation event targets
						//  but will never match selectors (and do not implement matches)
						if (matches && matches.call(el, selector)) {
							handlers.forEach(function(handler){
								handler.call(el, ev);
							});
						}
					});
					// since `el` points to `documentElement` when `cur` === document,
					// we need to continue using `cur` as the loop pointer, otherwhise
					// it will never end as documentElement.parentNode === document
					cur = cur.parentNode;
				} while ((cur && cur !== ev.currentTarget) && propagate);
			};
			this.events[eventType] = handlersBySelector;
			domEvents.addEventListener(this.element, eventType, handler, useCapture(eventType));
		},
		"can.getKeyValue": function(eventType) {
			return this.events[eventType];
		},
		"can.deleteKeyValue": function(eventType) {
			domEvents.removeEventListener(this.element, eventType, this.delegated[eventType], useCapture(eventType));
			delete this.delegated[eventType];
			delete this.events[eventType];
		},
		"can.getOwnEnumerableKeys": function() {
			return Object.keys(this.events);
		}
	});

	return Delegator;
}

module.exports = function makeDelegateEventTree (domEvents) {
	var Delegator = makeDelegator(domEvents);
	return new KeyTree([Map, Delegator, Object, Array]);
};
