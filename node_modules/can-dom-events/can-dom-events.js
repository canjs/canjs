'use strict';

var namespace = require('can-namespace');
var util = require('./helpers/util');
var makeEventRegistry = require('./helpers/make-event-registry');
var makeDelegateEventTree = require('./helpers/-make-delegate-event-tree');


var domEvents = {
	_eventRegistry: makeEventRegistry(),

	/**
	* @function can-dom-events.addEvent addEvent
	* @parent can-dom-events.static
	*
	* Add a custom event to the global event registry.
	*
	* @signature `addEvent( event [, eventType ] )`
	*
	* ```js
	* var removeReturnEvent = domEvents.addEvent(enterEvent, "return");
	* ```
	*
	* @param {can-dom-events/EventDefinition} event The custom event definition.
	* @param {String} eventType The event type to associated with the custom event.
	* @return {function} The callback to remove the custom event from the registry.
	*/
	addEvent: function(event, eventType) {
		return this._eventRegistry.add(event, eventType);
	},

	/**
	* @function can-dom-events.addEventListener addEventListener
	*
	* Add an event listener for eventType to the target.
	*
	* @signature `addEventListener( target, eventType, ...eventArgs )`
	* @parent can-dom-events.static
	* @param {DomEventTarget} target The object to which to add the listener.
	* @param {String} eventType The event type with which to register.
	* @param {*} eventArgs The arguments which configure the associated event's behavior. This is usually a
	* function event handler.
	*/
	addEventListener: function(target, eventType) {
		var hasCustomEvent = domEvents._eventRegistry.has(eventType);
		if (hasCustomEvent) {
			var event = domEvents._eventRegistry.get(eventType);
			return event.addEventListener.apply(domEvents, arguments);
		}

		var eventArgs = Array.prototype.slice.call(arguments, 1);
		return target.addEventListener.apply(target, eventArgs);
	},

	/**
	* @function can-dom-events.removeEventListener removeEventListener
	*
	* Remove an event listener for eventType from the target.
	*
	* @signature `removeEventListener( target, eventType, ...eventArgs )`
	* @parent can-dom-events.static
	* @param {DomEventTarget} target The object from which to remove the listener.
	* @param {String} eventType The event type with which to unregister.
	* @param {*} eventArgs The arguments which configure the associated event's behavior. This is usually a
	* function event handler.
	*/
	removeEventListener: function(target, eventType) {
		var hasCustomEvent = domEvents._eventRegistry.has(eventType);
		if (hasCustomEvent) {
			var event = domEvents._eventRegistry.get(eventType);
			return event.removeEventListener.apply(domEvents, arguments);
		}

		var eventArgs = Array.prototype.slice.call(arguments, 1);
		return target.removeEventListener.apply(target, eventArgs);
	},

	/**
	* @function can-dom-events.addDelegateListener addDelegateListener
	*
	* Attach a handler for an event for all elements that match the selector,
	* now or in the future, based on a root element.
	*
	* @signature `addDelegateListener( target, eventType, selector, handler )`
	*
	* ```js
	* // Prevents all anchor elements from changing the page
	* domEvents.addDelegateListener(document.body,"click", "a", function(event){
	*   event.preventDefault();
	* })
	* ```
	* @parent can-dom-events.static
	* @param {DomEventTarget} root The html element to listen to events that match selector within.
	* @param {String} eventType The event name to listen to.
	* @param {String} selector A selector to filter the elements that trigger the event.
	* @param {function} handler A function to execute at the time the event is triggered.
	*/
	addDelegateListener: function(root, eventType, selector, handler) {
		domEvents._eventTree.add([root, eventType, selector, handler]);
	},
	/**
	* @function can-dom-events.removeDelegateListener removeDelegateListener
	*
	* Remove a handler for an event for all elements that match the selector.
	*
	* @signature `removeDelegateListener( target, eventType, selector, handler )`
	*
	* ```js
	* // Prevents all anchor elements from changing the page
	* function handler(event) {
	*   event.preventDefault();
	* }
	* domEvents.addDelegateListener(document.body,"click", "a", handler);
	*
	* domEvents.removeDelegateListener(document.body,"click", "a", handler);
	* ```
	* @parent can-dom-events.static
	* @param {DomEventTarget} root The html element to listen to events that match selector within.
	* @param {String} eventType The event name to listen to.
	* @param {String} selector A selector to filter the elements that trigger the event.
	* @param {function} handler A function that was previously passed to `addDelegateListener`.
	*/
	removeDelegateListener: function(target, eventType, selector, handler) {
		domEvents._eventTree.delete([target, eventType, selector, handler]);
	},

	/**
	* @function can-dom-events.dispatch dispatch
	*
	* Create and dispatch a configured event on the target.
	*
	* @signature `dispatch( target, eventData [, bubbles ][, cancelable ] )`
	* @parent can-dom-events.static
	* @param {DomEventTarget} target The object on which to dispatch the event.
	* @param {Object | String} eventData The data to be assigned to the event. If it is a string, that will be the event type.
	* @param {Boolean} bubbles Whether the event should bubble; defaults to true.
	* @param {Boolean} cancelable Whether the event can be cancelled; defaults to false.
	* @return {Boolean} notCancelled Whether the event dispatched without being cancelled.
	*/
	dispatch: function(target, eventData, bubbles, cancelable) {
		var event = util.createEvent(target, eventData, bubbles, cancelable);
		var enableForDispatch = util.forceEnabledForDispatch(target, event);
		if(enableForDispatch) {
			target.disabled = false;
		}

		var ret = target.dispatchEvent(event);
		if(enableForDispatch) {
			target.disabled = true;
		}

		return ret;
	}
};

domEvents._eventTree = makeDelegateEventTree(domEvents);





module.exports = namespace.domEvents = domEvents;
