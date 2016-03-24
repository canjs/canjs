/*jshint -W014 */
var isFunction = require('can/util/isFunction');
var isPlainObject = require('can/util/isPlainObject');
var isString = require('can/util/isString');
var zid = require('can/util/zid');
var nodeList = require('can/util/node-list');
var contains = require('can/util/dom-contains');
var each = require('can/util/array/each');
var extend = require('can/util/extend');

// The following code is lovingly lifted from Zepto.js
var domEvents = {
	fn: {}
};
var slice = Array.prototype.slice;
var handlers = {};
var specialEvents = {};
var focusinSupported = 'onfocusin' in window;
var domFocus = {
	focus: 'focusin',
	blur: 'focusout'
}; // jshint ignore: line
var hover = {
	mouseenter: 'mouseover',
	mouseleave: 'mouseout'
};

specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';

function findHandlers(element, event, fn, selector) {
	event = parse(event);
	var matcher;
	if (event.ns) {
		matcher = matcherFor(event.ns);
	}
	return (handlers[zid(element)] || []).filter(function(handler) {
		return handler && (!event.e || handler.e === event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || zid(handler.fn) === zid(fn)) && (!selector || handler.sel === selector);
	});
}


function parse(event) {
	var parts = ('' + event).split('.');
	return {
		e: parts[0],
		ns: parts.slice(1).sort().join(' ')
	};
}

function matcherFor(ns) {
	return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
}

function eventCapture(handler, captureSetting) {
	return handler.del &&
		(!focusinSupported && (handler.e in domFocus)) ||
		!!captureSetting;
}

function realEvent(type) {
	return hover[type] || (focusinSupported && domFocus[type]) || type;
}

function add(element, events, fn, data, selector, delegator, capture) {
	var id = zid(element),
		set = (handlers[id] || (handlers[id] = []));
	events.split(/\s/).forEach(function(event) {
		if (event === 'ready') {
			return nodeList(document).ready(fn);
		}
		var handler = parse(event);
		handler.fn = fn;
		handler.sel = selector;
		// emulate mouseenter, mouseleave
		if (handler.e in hover) {
			fn = function(e) {
				var related = e.relatedTarget;
				if (!related || (related !== this && !contains(this, related))) {
					return handler.fn.apply(this, arguments);
				}
			};
		}

		handler.del = delegator;
		var callback = delegator || fn;
		handler.proxy = function(e) {
			e = compatible(e);
			if (e.isImmediatePropagationStopped()) {
				return;
			}
			e.data = data;
			var result = callback.apply(element, e._args === undefined ? [e] : [e].concat(e._args));
			if (result === false) {
				e.preventDefault();
				e.stopPropagation();
			}
			return result;
		};
		handler.i = set.length;
		set.push(handler);
		if ('addEventListener' in element) {
			element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
		}
	});
}

function remove(element, events, fn, selector, capture) {
	var id = zid(element);
	(events || '').split(/\s/).forEach(function(event) {
		findHandlers(element, event, fn, selector).forEach(function(handler) {
			delete handlers[id][handler.i];
			if ('removeEventListener' in element) {
				element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
			}
		});
	});
}

function trigger( event, data, elem, onlyHandlers ) {
	var fn = onlyHandlers ? domEvents.fn.triggerHandler : domEvents.fn.trigger;
	return fn.call(elem, event, data);
}

domEvents.event = {
	add: add,
	remove: remove,
	trigger: trigger
};

domEvents.fn.bind = function(event, data, callback) {
	return this.on(event, data, callback);
};
domEvents.fn.unbind = function(event, callback) {
	return this.off(event, callback);
};
domEvents.fn.one = function(event, selector, data, callback) {
	return this.on(event, selector, data, callback, 1);
};

var returnTrue = function() {
		return true;
	},
	returnFalse = function() {
		return false;
	},
	ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
	eventMethods = {
		preventDefault: 'isDefaultPrevented',
		stopImmediatePropagation: 'isImmediatePropagationStopped',
		stopPropagation: 'isPropagationStopped'
	};

function compatible(event, source) {
	if (source || !event.isDefaultPrevented) {
		source || (source = event); // jshint ignore: line

		each(eventMethods, function(predicate, name) {
			var sourceMethod = source[name];
			event[name] = function() {
				this[predicate] = returnTrue;
				return sourceMethod && sourceMethod.apply(source, arguments);
			};
			event[predicate] = returnFalse;
		});

		if (source.defaultPrevented !== undefined ? source.defaultPrevented :
			'returnValue' in source ? source.returnValue === false :
			source.getPreventDefault && source.getPreventDefault()) {
			event.isDefaultPrevented = returnTrue;
		}
	}
	return event;
}

function createProxy(event) {
	var key, proxy = {
		originalEvent: event
	};
	for (key in event) {
		if (!ignoreProperties.test(key) && event[key] !== undefined) {
			proxy[key] = event[key];
		}
	}

	return compatible(proxy, event);
}

domEvents.fn.delegate = function(selector, event, callback) {
	return this.on(event, selector, callback);
};
domEvents.fn.undelegate = function(selector, event, callback) {
	return this.off(event, selector, callback);
};

domEvents.fn.live = function(event, callback) {
	nodeList(document.body).delegate(this.selector, event, callback);
	return this;
};
domEvents.fn.die = function(event, callback) {
	nodeList(document.body).undelegate(this.selector, event, callback);
	return this;
};

domEvents.fn.on = function(event, selector, data, callback, one) {
	var autoRemove, delegator, $this = this;
	if (event && !isString(event)) {
		each(event, function(fn, type) {
			$this.on(type, selector, data, fn, one);
		});
		return $this;
	}

	if (!isString(selector) && !isFunction(callback) && callback !== false) {
		callback = data;
		data = selector;
		selector = undefined;
	}
	if (callback === undefined || data === false) {
		callback = data;
		data = undefined;
	}

	if (callback === false) {
		callback = returnFalse;
	}

	return $this.each(function(_, element) {
		if (one) {
			autoRemove = function(e) {
				remove(element, e.type, callback);
				return callback.apply(this, arguments);
			};
		}

		if (selector) {
			delegator = function(e) {
				var evt, match = nodeList(e.target).closest(selector, element).get(0);
				if (match && match !== element) {
					evt = extend(createProxy(e), {
						currentTarget: match,
						liveFired: element
					});
					return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
				}
			};
		}

		add(element, event, callback, data, selector, delegator || autoRemove);
	});
};

domEvents.fn.off = function(event, selector, callback) {
	var $this = this;
	if (event && !isString(event)) {
		each(event, function(fn, type) {
			$this.off(type, selector, fn);
		});
		return $this;
	}

	if (!isString(selector) && !isFunction(callback) && callback !== false) {
		callback = selector;
		selector = undefined;
	}

	if (callback === false) {
		callback = returnFalse;
	}

	return $this.each(function() {
		remove(this, event, callback, selector);
	});
};

domEvents.fn.trigger = function(event, args) {
	event = (isString(event) || isPlainObject(event)) ? domEvents.Event(event) : compatible(event);
	event._args = args;
	return nodeList(this).each(function() {
		// handle focus(), blur() by calling them directly
		if (event.type in domFocus && typeof this[event.type] === "function") {
			this[event.type]();
		}
		// items in the collection might not be DOM elements
		else if ('dispatchEvent' in this) {
			this.dispatchEvent(event);
		}
		else {
			nodeList(this).triggerHandler(event, args);
		}
	});
};

// triggers event handlers on current element just as if an event occurred,
// doesn't trigger an actual event, doesn't bubble
domEvents.fn.triggerHandler = function(event, args) {
	var e, result;
	nodeList(this).each(function(i, element) {
		e = createProxy(isString(event) ? domEvents.Event(event) : event);
		e._args = args;
		e.target = element;
		each(findHandlers(element, event.type || event), function(handler, i) {
			result = handler.proxy(e);
			if (e.isImmediatePropagationStopped()) {
				return false;
			}
		});
	});
	return result;
}

// shortcut methods for `.bind(event, fn)` for each event type
;
('focusin focusout focus blur load resize scroll unload click dblclick ' +
	'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
	'change select keydown keypress keyup error').split(' ').forEach(function(event) {
	domEvents.fn[event] = function(callback) {
		return (0 in arguments) ?
			this.bind(event, callback) :
			this.trigger(event);
	};
});

domEvents.Event = function(type, props) {
	if (!isString(type)) {
		props = type;
		type = props.type;
	}
	var event = document.createEvent(specialEvents[type] || 'Events'),
		bubbles = true;
	if (props) {
		for (var name in props) {
			if (name === 'bubbles') {
				bubbles = !!props[name];
			} else {
				event[name] = props[name];
			}
		}
	}
	event.initEvent(type, bubbles, true);
	return compatible(event);
};

module.exports = domEvents;
