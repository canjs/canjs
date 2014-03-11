steal('can/event', 'can/event/propagate', 'can/construct', function() {

	can.event.delegate = function(selector, event, handler) {
		var parts = selector.split(/\s+/),
			delegate = function(ev) {
				// Verify descendants against the selector
				for (var i = 0, j = 0, descendant; j < parts.length && (descendant = ev.descendants[i]); i++) {
					if (descendant.constructor && (parts[j] === descendant.constructor._shortName || parts[j] === descendant.constructor.shortName)) {
						j++;
					}
				}

				// Only if every part of the selector was matched, execute the handler
				if (j >= parts.length) {
					return handler.apply(this, arguments);
				}
			};

		// Cache the handler, so that we can undelegate later
		delegate.handler = handler;
		delegate.selector = selector;
		return can.addEvent.call(this, event, delegate);
	};

	can.event.undelegate = function(selector, event, handler) {
		if (!this.__bindEvents) {
			return this;
		}
		var events = this.__bindEvents[event] || [],
			i = 0,
			ev, isFunction = typeof handler === 'function';
		while (i < events.length) {
			ev = events[i];
			if (isFunction && (ev.handler === handler || (ev.handler.handler === handler && ev.handler.selector === selector)) || !isFunction && ev.cid === handler) {
				events.splice(i, 1);
			} else {
				i++;
			}
		}
		return this;
	};
});
