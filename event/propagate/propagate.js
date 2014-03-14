steal('can/event', function() {
	// Adds propagation of events
	// can.extend(Class.prototype, can.event, { __propagate: 'prop' })
	var dispatch = can.dispatch;
	can.dispatch = can.event.dispatch = can.event.trigger = function (event, args) {
		var propagate = this.__propagate || false;

		// Inject propagation into event, when applicable
		if (propagate && typeof event.isPropagationStopped === 'undefined') {
			// Initialize the event into an object
			if (typeof event === 'string') {
				event = {
					type: event
				};
			}

			// Add extra event properties
			// This could be done with can.simpleExtend, but this avoids extra logic execution
			var stop = false,
				prevent = false;
			event.currentTarget = this;
			event.target = event.target || this;
			event.descendants = event.target === event.currentTarget ? [] : [event.target];
			event.stopPropagation = function() {
				stop = true;
			};
			event.isPropagationStopped = function() {
				return stop;
			};
			event.preventDefault = function() {
				prevent = true;
			};
			event.isDefaultPrevented = function() {
				return prevent;
			};
		}
		else if (propagate) {
			// Set the current target when propagating
			event = can.simpleExtend({}, event);
			event.descendants = [event.currentTarget].concat(event.descendants);
			event.currentTarget = this;
		}

		// Call original dispatch
		dispatch.call(this, event, args);

		// Call propagated events
		if (propagate && !event.isPropagationStopped() && this[propagate]) {
			// Call the propagated can.dispatch (otherwise it'll only propagate one level)
			can.dispatch.call(this[propagate], event, args);
		}
	};

	return can.event;
});
