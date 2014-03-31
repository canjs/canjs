// # can/event
//
// Implements a basic event system that can be used with any type of object.
// In addition to adding basic event functionality, it also provides the `can.event` object 
// that can be mixed into objects and prototypes.
//
// Most of the time when this is used, it will be used with the mixin:
//
// ```
// var SomeClass = can.Construct("SomeClass");
// can.extend(SomeClass.prototype, can.event);
// ```

steal('can/util/can.js', function (can) {
	// ## can.event.addEvent
	//
	// Adds a basic event listener to an object.
	// This consists of storing a cache of event listeners on each object,
	// that are iterated through later when events are dispatched.
	/**
	 * Add a basic event listener to an object.
	 *
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @return {Object} this
	 */
	can.addEvent = function (event, handler) {
		// Initialize event cache.
		var allEvents = this.__bindEvents || (this.__bindEvents = {}),
			eventList = allEvents[event] || (allEvents[event] = []);

		// Add the event
		eventList.push({
			handler: handler,
			name: event
		});
		return this;
	};

	// ## can.event.listenTo
	//
	// Listens to an event without know how bind is implemented.
	// The primary use for this is to listen to another's objects event without 
	// having to track the events on that object. Essentially, this is a simple 
	// version of delegation.
	//
	// The API was heavily influenced by BackboneJS: http://backbonejs.org/
	/**
	 * Listens for an event on another object.
	 *
	 * @param {Object} other The object to listen for events on.
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @return {Object} this
	 */
	can.listenTo = function (other, event, handler) {
		// Initialize event cache
		var idedEvents = this.__listenToEvents;
		if (!idedEvents) {
			idedEvents = this.__listenToEvents = {};
		}

		// Identify the other object
		var otherId = can.cid(other);
		var othersEvents = idedEvents[otherId];
		if (!othersEvents) {
			othersEvents = idedEvents[otherId] = {
				obj: other,
				events: {}
			};
		}
		var eventsEvents = othersEvents.events[event];
		if (!eventsEvents) {
			eventsEvents = othersEvents.events[event] = [];
		}

		// Add the event
		eventsEvents.push(handler);
		can.bind.call(other, event, handler);
	};

	// ## ca.nevent.stopListening
	// 
	// Stops listening for events on other objects
	/**
	 * Stops listening for an event on another object.
	 *
	 * @param {Object} other The object to listen for events on.
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @return {Object} this
	 */
	can.stopListening = function (other, event, handler) {
		var idedEvents = this.__listenToEvents,
			iterIdedEvents = idedEvents,
			i = 0;
		if (!idedEvents) {
			return this;
		}
		if (other) {
			var othercid = can.cid(other);
			(iterIdedEvents = {})[othercid] = idedEvents[othercid];
			// you might be trying to listen to something that is not there
			if (!idedEvents[othercid]) {
				return this;
			}
		}

		// Clean up events on the other object
		for (var cid in iterIdedEvents) {
			var othersEvents = iterIdedEvents[cid],
				eventsEvents;
			other = idedEvents[cid].obj;
			if (!event) {
				eventsEvents = othersEvents.events;
			} else {
				(eventsEvents = {})[event] = othersEvents.events[event];
			}
			for (var eventName in eventsEvents) {
				var handlers = eventsEvents[eventName] || [];
				i = 0;
				while (i < handlers.length) {
					if (handler && handler === handlers[i] || !handler) {
						can.unbind.call(other, eventName, handlers[i]);
						handlers.splice(i, 1);
					} else {
						i++;
					}
				}
				// no more handlers?
				if (!handlers.length) {
					delete othersEvents.events[eventName];
				}
			}
			if (can.isEmptyObject(othersEvents.events)) {
				delete idedEvents[cid];
			}
		}
		return this;
	};

	// ## can.event.removeEvent
	//
	// Removes a basic event listener from an object.
	// This removes event handlers from the cache of listened events.
	/**
	 * Removes a basic event listener from an object.
	 *
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @param {Function} [__validate] An extra function that can validate an event handler 
	 *                                as a match. This is an internal parameter and only used 
	 *                                for `can/event` plugins.
	 * @return {Object} this
	 */
	can.removeEvent = function (event, fn, __validate) {
		if (!this.__bindEvents) {
			return this;
		}
		var events = this.__bindEvents[event] || [],
			i = 0,
			ev, isFunction = typeof fn === 'function';
		while (i < events.length) {
			ev = events[i];
			// Determine whether this event handler is "equivalent" to the one requested
			// Generally this requires the same event/function, but a validation function 
			// can be included for extra conditions. This is used in some plugins like `can/event/namespace`.
			if (__validate ? __validate(ev, event, fn) : isFunction && ev.handler === fn || !isFunction && (ev.cid === fn || !fn)) {
				events.splice(i, 1);
			} else {
				i++;
			}
		}
		return this;
	};

	// ## can.event.dispatch
	//
	// Dispatches/triggers a basic event on an object.
	/**
	 * Dispatches/triggers a basic event on an object.
	 *
	 * @param {String|Object} event The event to dispatch
	 * @param {Array} [args] Additional arguments to pass to event handlers
	 * @return {Object} this
	 */
	can.dispatch = function (event, args) {
		var events = this.__bindEvents;
		if (!events) {
			return;
		}

		// Initialize the event object
		if (typeof event === 'string') {
			event = {
				type: event
			};
		}

		// Grab event listeners
		var eventName = event.type,
			handlers = (events[eventName] || []).slice(0);
		
		// Execute handlers listening for this event.
		args = [event].concat(args || []);
		for (var i = 0, len = handlers.length; i < len; i++) {
			handlers[i].handler.apply(this, args);
		}
	};
	
	// ## can.event.one
	//
	// Adds a basic event listener that listens to an event once and only once.
	/**
	 * Adds a basic event listener that listens to an event once and only once.
	 *
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @return {Object} this
	 */
	can.one = function(event, handler) {
		// Unbind the listener after it has been executed
		var one = function() {
			can.unbind.call(this, event, one);
			return handler.apply(this, arguments);
		};

		// Bind the altered listener
		can.bind.call(this, event, one);
		return this;
	};

	// ## can.event
	// Create and export the `can.event` mixin
	can.event = {
		// Event method aliases
		on: can.addEvent,
		off: can.removeEvent,
		one: can.one,
		bind: can.addEvent,
		unbind: can.removeEvent,
		delegate: function(selector, event, handler) {
			return can.addEvent.call(event, handler);
		},
		undelegate: function(selector, event, handler) {
			return can.removeEvent.call(event, handler);
		},
		trigger: can.dispatch,

		// Normal can/event methods
		addEvent: can.addEvent,
		removeEvent: can.removeEvent,
		listenTo: can.listenTo,
		stopListening: can.stopListening,
		dispatch: can.dispatch
	};

	return can.event;
});
