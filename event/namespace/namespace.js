steal('can/util/can.js', 'can/event', function(can) {
	var addEvent = can.addEvent;
	can.addEvent = can.event.addEvent = can.event.on = can.event.bind = function(event, fn) {
		// Split the namespaces out
		if (event.indexOf('.') > -1) {
			var namespaces = event.split('.');
			event = namespaces[0];
		}

		addEvent.call(this, event, fn);

		// Inject namespaces if applicable
		if (namespaces && namespaces.length > 1) {
			var events = this.__bindEvents[event];
			events[events.length-1].namespaces = namespaces.slice(1);
		}

		return this;
	};

	var removeEvent = can.removeEvent;
	can.removeEvent = can.event.removeEvent = can.event.off = can.event.unbind = function(event, fn, __validate) {
		// Split the namespaces out
		if (event && event.indexOf('.') > -1) {
			var namespaces = event.split('.');
			event = namespaces.splice(0,1)[0];
		}

		// Handle namespace-only (no event)
		if (!event && namespaces && namespaces.length > 0) {
			var allEvents = this.__bindEvents || {},
				self = this;
			can.each(allEvents, function(events, event) {
				can.removeEvent.call(self, event + '.' + namespaces.join('.'), fn, __validate);
			});
			return this;
		}
		// Handle normal events (with namespace validation where applicable)
		else {
			var isFunction = typeof fn === 'function';
			return removeEvent.call(this, event, fn, namespaces ? function(ev) {
				if (ev.namespaces && (__validate ? __validate(ev, event, fn) : (isFunction && ev.handler === fn || !isFunction && (ev.cid === fn || !fn)))) {
					for (var i = 0; i < namespaces.length; i++) {
						if (can.inArray(namespaces[i], ev.namespaces) === -1) {
							return false;
						}
					}
					return true;
				}
				return false;
			} : __validate);
		}
	};

	return can.event;
});
