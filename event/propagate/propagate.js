steal('can/event', function() {
	// Adds propagation of events
	// can.extend(Class.prototype, can.event, { __propagate: 'prop' })
	var dispatch = can.dispatch;
	can.dispatch = can.event.dispatch = function (event, args) {
		var propagate = (this.__bindEvents && this.__propagate) || false;

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
			var stop = false;
			event.target = event.target || this;
			event.stopPropagation = function() {
				stop = true;
			};
			event.isPropagationStopped = function() {
				return stop;
			};
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
