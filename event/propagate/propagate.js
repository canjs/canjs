steal('can/event', function(event) {
	// Adds propagation of events
	// can.extend(Class.prototype, can.event, { __propagate: 'prop' })
	var dispatch = event.dispatch;
	event.dispatch = can.dispatch = function (ev, args) {
		var propagate = (this.__bindEvents && this.__propagate) || false;

		// Inject propagation into event, when applicable
		if (propagate && typeof ev.isPropagationStopped === 'undefined') {
			// Initialize the event into an object
			if (typeof ev === 'string') {
				ev = {
					type: ev
				};
			}

			// Add extra event properties
			// This could be done with can.simpleExtend, but this avoids extra logic execution
			var stop = false;
			ev.target = ev.target || this;
			ev.stopPropagation = function() {
				stop = true;
			};
			ev.isPropagationStopped = function() {
				return stop;
			};
		}

		// Call original dispatch
		dispatch.call(this, ev, args);

		// Call propagated events
		if (propagate && !ev.isPropagationStopped() && this[propagate]) {
			can.dispatch.call(this[propagate], ev, args);
		}
	};

	return event;
});
