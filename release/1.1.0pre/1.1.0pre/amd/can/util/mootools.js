define(['can/util/can', 'can/util/mootools/mootools-core-1.4.3', 'can/util/event', 'can/util/fragment', 'can/util/array/each', 'can/util/object/isplain', 'can/util/object/extend'], function (can) {
	// mootools.js
	// ---------
	// _MooTools node list._
	// 
	// Map string helpers.
	can.trim = function (s) {
		return s && s.trim()
	}

	// Map array helpers.
	can.makeArray = function (item) {
		// All other libraries return a copy if item is an array.
		// The original Mootools Array.from returned the same item so we need to slightly modify it
		if (item == null) return [];
		try {
			return (Type.isEnumerable(item) && typeof item != 'string') ? Array.prototype.slice.call(item) : [item];
		} catch (ex) {
			// some things like DOMNodeChildCollections don't slice so good.
			// This pains me, but it has to be done.
			var arr = [],
				i;
			for (i = 0; i < item.length; ++i) {
				arr.push(item[i]);
			}
			return arr;
		}
	}

	can.isArray = function (arr) {
		return typeOf(arr) === 'array'
	};
	can.inArray = function (item, arr) {
		if (!arr) {
			return -1;
		}
		return Array.prototype.indexOf.call(arr, item);
	}
	can.map = function (arr, fn) {
		return Array.from(arr || []).map(fn);
	}

	// Map object helpers.
	can.param = function (object) {
		return Object.toQueryString(object)
	}
	can.isEmptyObject = function (object) {
		return Object.keys(object).length === 0;
	}
	// Map function helpers.
	can.proxy = function (func) {
		var args = can.makeArray(arguments),
			func = args.shift();

		return func.bind.apply(func, args)
	}
	can.isFunction = function (f) {
		return typeOf(f) == 'function'
	}
	// Make this object so you can bind on it.
	can.bind = function (ev, cb) {
		// If we can bind to it...
		if (this.bind && this.bind !== can.bind) {
			this.bind(ev, cb)
		} else if (this.addEvent) {
			this.addEvent(ev, cb)
		} else {
			// Make it bind-able...
			can.addEvent.call(this, ev, cb)
		}
		return this;
	}
	can.unbind = function (ev, cb) {
		// If we can bind to it...
		if (this.unbind && this.unbind !== can.unbind) {
			this.unbind(ev, cb)
		} else if (this.removeEvent) {
			this.removeEvent(ev, cb)
		} else {
			// Make it bind-able...
			can.removeEvent.call(this, ev, cb)
		}
		return this;
	}
	can.trigger = function (item, event, args, bubble) {
		// Defaults to `true`.
		bubble = (bubble === undefined ? true : bubble);
		args = args || []
		if (item.fireEvent) {
			item = item[0] || item;
			// walk up parents to simulate bubbling .
			while (item) {
				// Handle walking yourself.
				if (!event.type) {
					event = {
						type: event,
						target: item
					}
				}
				var events = (item !== window ? can.$(item).retrieve('events')[0] : item.retrieve('events'));
				if (events && events[event.type]) {
					events[event.type].keys.each(function (fn) {
						fn.apply(this, [event].concat(args));
					}, this);
				}
				// If we are bubbling, get parent node.
				if (bubble && item.parentNode) {
					item = item.parentNode
				} else {
					item = null;
				}

			}


		} else {
			if (typeof event === 'string') {
				event = {
					type: event
				}
			}
			event.target = event.target || item;
			event.data = args
			can.dispatch.call(item, event)
		}
	}
	can.delegate = function (selector, ev, cb) {
		if (this.delegate) {
			this.delegate(selector, ev, cb)
		}
		else if (this.addEvent) {
			this.addEvent(ev + ":relay(" + selector + ")", cb)
		} else {
			// make it bind-able ...
		}
		return this;
	}
	can.undelegate = function (selector, ev, cb) {
		if (this.undelegate) {
			this.undelegate(selector, ev, cb)
		}
		else if (this.removeEvent) {
			this.removeEvent(ev + ":relay(" + selector + ")", cb)
		} else {
			// make it bind-able ...
		}
		return this;
	}
	var optionsMap = {
		type: "method",
		success: undefined,
		error: undefined
	}
	var updateDeferred = function (xhr, d) {
		for (var prop in xhr) {
			if (typeof d[prop] == 'function') {
				d[prop] = function () {
					xhr[prop].apply(xhr, arguments)
				}
			} else {
				d[prop] = prop[xhr]
			}
		}
	}
	can.ajax = function (options) {
		var d = can.Deferred(),
			requestOptions = can.extend({}, options);
		// Map jQuery options to MooTools options.
		for (var option in optionsMap) {
			if (requestOptions[option] !== undefined) {
				requestOptions[optionsMap[option]] = requestOptions[option];
				delete requestOptions[option]
			}
		}
		// Mootools defaults to 'post', but Can expects a default of 'get'
		requestOptions.method = requestOptions.method || 'get';

		var success = options.success,
			error = options.error;

		requestOptions.onSuccess = function (responseText, xml) {
			var data = responseText;
			if (options.dataType === 'json') {
				data = eval("(" + data + ")")
			}
			updateDeferred(request.xhr, d);
			d.resolve(data, "success", request.xhr);
			success && success(data, "success", request.xhr);
		}
		requestOptions.onError = function () {
			updateDeferred(request.xhr, d);
			d.reject(request.xhr, "error");
			error(request.xhr, "error");
		}

		var request = new Request(requestOptions);
		request.send();
		updateDeferred(request.xhr, d);
		return d;

	}
	// Element -- get the wrapped helper.
	can.$ = function (selector) {
		if (selector === window) {
			return window;
		}
		return $$(selector)
	}

	// Add `document` fragment support.
	var old = document.id;
	document.id = function (el) {
		if (el && el.nodeType === 11) {
			return el
		} else {
			return old.apply(document, arguments);
		}
	};
	can.append = function (wrapped, html) {
		if (typeof html === 'string') {
			html = can.buildFragment(html)
		}
		return wrapped.grab(html)
	}
	can.filter = function (wrapped, filter) {
		return wrapped.filter(filter);
	}
	can.data = function (wrapped, key, value) {
		if (value === undefined) {
			return wrapped[0].retrieve(key)
		} else {
			return wrapped.store(key, value)
		}
	}
	can.addClass = function (wrapped, className) {
		return wrapped.addClass(className);
	}
	can.remove = function (wrapped) {
		// We need to remove text nodes ourselves.
		var filtered = wrapped.filter(function (node) {
			if (node.nodeType !== 1) {
				node.parentNode.removeChild(node);
			} else {
				return true;
			}
		})
		filtered.destroy();
		return filtered;
	}

	// Destroyed method.
	var destroy = Element.prototype.destroy;
	Element.implement({
		destroy: function () {
			can.trigger(this, "destroyed", [], false)
			var elems = this.getElementsByTagName("*");
			for (var i = 0, elem;
			(elem = elems[i]) !== undefined; i++) {
				can.trigger(elem, "destroyed", [], false);
			}
			destroy.apply(this, arguments)
		}
	});
	can.get = function (wrapped, index) {
		return wrapped[index];
	}

	// Overwrite to handle IE not having an id.
	// IE barfs if text node.
	var idOf = Slick.uidOf;
	Slick.uidOf = function (node) {
		if (node.nodeType === 1 || node === window) {
			return idOf(node);
		} else {
			return Math.random();
		}


	}

	function (can) {

		// deferred.js
		// ---------
		// _Lightweight, jQuery style deferreds._
		var Deferred = function (func) {
			if (!(this instanceof Deferred)) return new Deferred();

			this._doneFuncs = [];
			this._failFuncs = [];
			this._resultArgs = null;
			this._status = "";

			// Check for option `function` -- call it with this as context and as first 
			// parameter, as specified in jQuery API.
			func && func.call(this, this);
		};
		can.Deferred = Deferred;
		can.when = Deferred.when = function () {
			var args = can.makeArray(arguments);
			if (args.length < 2) {
				var obj = args[0];
				if (obj && (can.isFunction(obj.isResolved) && can.isFunction(obj.isRejected))) {
					return obj;
				} else {
					return Deferred().resolve(obj);
				}
			} else {

				var df = Deferred(),
					done = 0,
					// Resolve params -- params of each resolve, we need to track them down 
					// to be able to pass them in the correct order if the master 
					// needs to be resolved.
					rp = [];

				can.each(args, function (arg, j) {
					arg.done(function () {
						rp[j] = (arguments.length < 2) ? arguments[0] : arguments;
						if (++done == args.length) {
							df.resolve.apply(df, rp);
						}
					}).fail(function () {
						df.reject(arguments);
					});
				});

				return df;

			}
		}

		var resolveFunc = function (type, _status) {
			return function (context) {
				var args = this._resultArgs = (arguments.length > 1) ? arguments[1] : [];
				return this.exec(context, this[type], args, _status);
			}
		},
			doneFunc = function (type, _status) {
				return function () {
					var self = this;
					// In Safari, the properties of the `arguments` object are not enumerable, 
					// so we have to convert arguments to an `Array` that allows `can.each` to loop over them.
					can.each(Array.prototype.slice.call(arguments), function (v, i, args) {
						if (!v) return;
						if (v.constructor === Array) {
							args.callee.apply(self, v)
						} else {
							// Immediately call the `function` if the deferred has been resolved.
							if (self._status === _status) v.apply(self, self._resultArgs || []);

							self[type].push(v);
						}
					});
					return this;
				}
			};

		can.extend(Deferred.prototype, {
			pipe: function (done, fail) {
				var d = can.Deferred();
				this.done(function () {
					d.resolve(done.apply(this, arguments));
				});

				this.fail(function () {
					if (fail) {
						d.reject(fail.apply(this, arguments));
					} else {
						d.reject.apply(d, arguments);
					}
				});
				return d;
			},
			resolveWith: resolveFunc("_doneFuncs", "rs"),
			rejectWith: resolveFunc("_failFuncs", "rj"),
			done: doneFunc("_doneFuncs", "rs"),
			fail: doneFunc("_failFuncs", "rj"),
			always: function () {
				var args = can.makeArray(arguments);
				if (args.length && args[0]) this.done(args[0]).fail(args[0]);

				return this;
			},

			then: function () {
				var args = can.makeArray(arguments);
				// Fail `function`(s)
				if (args.length > 1 && args[1]) this.fail(args[1]);

				// Done `function`(s)
				if (args.length && args[0]) this.done(args[0]);

				return this;
			},

			state: function () {
				switch (this._status) {
				case 'rs':
					return 'resolved';
				case 'rj':
					return 'rejected';
				default:
					return 'pending';
				}
			},

			isResolved: function () {
				return this._status === "rs";
			},

			isRejected: function () {
				return this._status === "rj";
			},

			reject: function () {
				return this.rejectWith(this, arguments);
			},

			resolve: function () {
				return this.resolveWith(this, arguments);
			},

			exec: function (context, dst, args, st) {
				if (this._status !== "") return this;

				this._status = st;

				can.each(dst, function (d) {
					d.apply(context, args);
				});

				return this;
			}
		});

		return can;
	})