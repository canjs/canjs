steal('can/event', function(event) {
	// Adds propagation of events
	// can.extend(Class.prototype, can.event, { __propagate: 'prop' })
	var dispatch = event.dispatch;
	event.dispatch = can.dispatch = function (ev, args) {
		var propagate = (this.__bindEvents && this.__propagate) || false;

		// Inject propagation into event, when applicable
		if (propagate && typeof ev.__stop === 'undefined') {
			ev = can.simpleExtend(
				typeof ev === 'string' ? { type: ev } : ev,
				{
					__stop: false,
					stopPropagation: function() {
						this.__stop = true;
					},
					target: this
				}
			);
		}

		// Call original dispatch
		dispatch.call(this, ev, args);

		// Call propagated events
		if (propagate && !ev.__stop && this[propagate]) {
			can.dispatch.call(this[propagate], ev, args);
		}
	};

	return event;
});
