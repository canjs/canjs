steal('can/util/can.js', 'can/event', 'can/event/propagate', 'can/construct', function(can) {

	can.event.delegate = function(selector, event, handler) {
		var parts = selector && selector.split(/\s+/),
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

	can.event.undelegate = function(selector, event, fn) {
		var isFunction = typeof fn === 'function';
		return can.removeEvent.call(this, event, fn, function(ev) {
			return isFunction && (ev.handler === fn || (ev.handler.handler === fn && ev.handler.selector === selector)) || !isFunction && ev.cid === fn;
		});
	};
});
