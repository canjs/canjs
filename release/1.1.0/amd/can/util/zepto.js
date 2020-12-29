define(['can/util/can', 'can/util/zepto/data', 'can/util/event', 'can/util/fragment'], function (can) {
	// zepto.js
	// ---------
	// _Zepto node list._
	// Extend what you can out of Zepto.
	$.extend(can, Zepto);

	var arrHas = function (obj, name) {
		return obj[0] && obj[0][name] || obj[name]
	}

	// Do what's similar for jQuery.
	can.trigger = function (obj, event, args, bubble) {
		if (obj.trigger) {
			obj.trigger(event, args)
		} else if (arrHas(obj, "dispatchEvent")) {
			if (bubble === false) {
				$([obj]).triggerHandler(event, args)
			} else {
				$([obj]).trigger(event, args)
			}

		} else {
			if (typeof event == "string") {
				event = {
					type: event
				}
			}
			event.target = event.target || obj;
			event.data = args;
			can.dispatch.call(obj, event)
		}

	}

	can.$ = Zepto

	can.bind = function (ev, cb) {
		// If we can bind to it...
		if (this.bind) {
			this.bind(ev, cb)
		} else if (arrHas(this, "addEventListener")) {
			$([this]).bind(ev, cb)
		} else {
			can.addEvent.call(this, ev, cb)
		}
		return this;
	}
	can.unbind = function (ev, cb) {
		// If we can bind to it...
		if (this.unbind) {
			this.unbind(ev, cb)
		} else if (arrHas(this, "addEventListener")) {
			$([this]).unbind(ev, cb)
		} else {
			can.removeEvent.call(this, ev, cb)
		}
		return this;
	}
	can.delegate = function (selector, ev, cb) {
		if (this.delegate) {
			this.delegate(selector, ev, cb)
		} else {
			$([this]).delegate(selector, ev, cb)
		}
	}
	can.undelegate = function (selector, ev, cb) {
		if (this.undelegate) {
			this.undelegate(selector, ev, cb)
		} else {
			$([this]).undelegate(selector, ev, cb)
		}
	}

	$.each(["append", "filter", "addClass", "remove", "data"], function (i, name) {
		can[name] = function (wrapped) {
			return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1))
		}
	})


	can.makeArray = function (arr) {
		var ret = []
		can.each(arr, function (a, i) {
			ret[i] = a
		})
		return ret;
	};

	can.proxy = function (f, ctx) {
		return function () {
			return f.apply(ctx, arguments)
		}
	}

	// Make ajax.
	var XHR = $.ajaxSettings.xhr;
	$.ajaxSettings.xhr = function () {
		var xhr = XHR()
		var open = xhr.open;
		xhr.open = function (type, url, async) {
			open.call(this, type, url, ASYNC === undefined ? true : ASYNC)
		}
		return xhr;
	}
	var ASYNC;
	var AJAX = $.ajax;
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

		var success = options.success,
			error = options.error;
		var d = can.Deferred();

		options.success = function (data) {

			updateDeferred(xhr, d);
			d.resolve.call(d, data);
			success && success.apply(this, arguments);
		}
		options.error = function () {
			updateDeferred(xhr, d);
			d.reject.apply(d, arguments);
			error && error.apply(this, arguments);
		}
		if (options.async === false) {
			ASYNC = false
		}
		var xhr = AJAX(options);
		ASYNC = undefined;
		updateDeferred(xhr, d);
		return d;
	};






	// Make destroyed and empty work.
	$.fn.empty = function () {
		return this.each(function () {
			$.cleanData(this.getElementsByTagName('*'))
			this.innerHTML = ''
		})
	}

	$.fn.remove = function () {
		$.cleanData(this);
		this.each(function () {
			if (this.parentNode != null) {
				// might be a text node
				this.getElementsByTagName && $.cleanData(this.getElementsByTagName('*'))
				this.parentNode.removeChild(this);
			}
		});
		return this;
	}


	can.trim = function (str) {
		return str.trim();
	}
	can.isEmptyObject = function (object) {
		var name;
		for (name in object) {};
		return name === undefined;
	}

	// Make extend handle `true` for deep.
	can.extend = function (first) {
		if (first === true) {
			var args = can.makeArray(arguments);
			args.shift();
			return $.extend.apply($, args)
		}
		return $.extend.apply($, arguments)
	}

	can.get = function (wrapped, index) {
		return wrapped[index];
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

		function (can) {
			can.each = function (elements, callback, context) {
				var i = 0,
					key;
				if (elements) {
					if (typeof elements.length === 'number' && elements.pop) {
						if (elements.attr) {
							elements.attr('length');
						}
						for (key = elements.length; i < key; i++) {
							if (callback.call(context || elements[i], elements[i], i, elements) === false) {
								break;
							}
						}
					} else if (elements.hasOwnProperty) {
						for (key in elements) {
							if (elements.hasOwnProperty(key)) {
								if (callback.call(context || elements[key], elements[key], key, elements) === false) {
									break;
								}
							}
						}
					}
				}
				return elements;
			};

			return can;
		})