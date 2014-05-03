steal('can/util/can.js', 'can/util/attr', 'can/event', 'zepto', 'can/util/object/isplain',
	'can/util/fragment.js', 'can/util/deferred.js', 'can/util/array/each.js', 'can/util/inserted',
	function (can, attr, event) {
		// data.js
		// ---------
		// _jQuery-like data methods._
		var $ = Zepto;

		// data.js
		// ---------
		// _jQuery-like data methods._
		var data = {}, dataAttr = $.fn.data,
			uuid = $.uuid = +new Date(),
			exp = $.expando = 'Zepto' + uuid;

		function getData(node, name) {
			var id = node[exp],
				store = id && data[id];
			return name === undefined ? store || setData(node) :
				(store && store[name]) || dataAttr.call($(node), name);
		}

		function setData(node, name, value) {
			var id = node[exp] || (node[exp] = ++uuid),
				store = data[id] || (data[id] = {});
			if (name !== undefined) {
				store[name] = value;
			}
			return store;
		}

		$.fn.data = function (name, value) {
			return value === undefined ?
				this.length === 0 ? undefined : getData(this[0], name) :
				this.each(function (idx) {
					setData(this, name, $.isFunction(value) ?
						value.call(this, idx, getData(this, name)) : value);
				});
		};
		$.cleanData = function (elems) {
			// trigger all the events ... then remove the data
			for (var i = 0, elem;
				(elem = elems[i]) !== undefined; i++) {
				can.trigger(elem, "removed", [], false);
			}
			for (i = 0;
				(elem = elems[i]) !== undefined; i++) {
				var id = elem[exp];
				delete data[id];
			}

		};

		// zepto.js
		// ---------
		// _Zepto node list._

		var oldEach = can.each;
		// Extend what you can out of Zepto.
		$.extend(can, Zepto);
		can.each = oldEach;
		can.attr = attr;
		can.event = event;
		var arrHas = function (obj, name) {
			return obj[0] && obj[0][name] || obj[name];
		};

		// Do what's similar for jQuery.
		can.trigger = function (obj, event, args, bubble) {
			if (obj.trigger) {
				obj.trigger(event, args);
			} else if (arrHas(obj, "dispatchEvent")) {
				if (bubble === false) {
					$([obj])
						.triggerHandler(event, args);
				} else {
					$([obj])
						.trigger(event, args);
				}

			} else {
				if (typeof event === "string") {
					event = {
						type: event
					};
				}
				event.target = event.target || obj;
				can.dispatch.call(obj, event, args);
			}

		};

		can.$ = Zepto;

		can.bind = function (ev, cb) {
			// If we can bind to it...
			if (this.bind && this.bind !== can.bind) {
				this.bind(ev, cb);
			} else if (arrHas(this, "addEventListener")) {
				$([this])
					.bind(ev, cb);
			} else {
				can.addEvent.call(this, ev, cb);
			}
			return this;
		};
		can.unbind = function (ev, cb) {
			// If we can bind to it...
			if (this.unbind && this.unbind !== can.unbind) {
				this.unbind(ev, cb);
			} else if (arrHas(this, "addEventListener")) {
				$([this])
					.unbind(ev, cb);
			} else {
				can.removeEvent.call(this, ev, cb);
			}
			return this;
		};

		// Alias on/off to bind/unbind respectively
		can.on = can.bind;
		can.off = can.unbind;

		can.delegate = function (selector, ev, cb) {
			if (!selector) {
				// Zepto fails with no selector
				can.bind.call(this, ev, cb);
			} else if (this.delegate) {
				this.delegate(selector, ev, cb);
			} else if (arrHas(this, "addEventListener")) {
				$([this])
					.delegate(selector, ev, cb);
			} else {
				// Make it bind-able...
				can.addEvent.call(this, ev, cb);
			}
		};
		can.undelegate = function (selector, ev, cb) {
			if (!selector) {
				// Zepto fails with no selector
				can.unbind.call(this, ev, cb);
			} else if (this.undelegate) {
				this.undelegate(selector, ev, cb);
			} else if (arrHas(this, "addEventListener")) {
				$([this])
					.undelegate(selector, ev, cb);
			} else {
				// Make it bind-able...
				can.removeEvent.call(this, ev, cb);
			}
		};

		$.each(["append", "filter", "addClass", "remove", "data", "has"], function (i, name) {
			can[name] = function (wrapped) {
				return wrapped[name].apply(wrapped, can.makeArray(arguments)
					.slice(1));
			};
		});

		can.makeArray = function (arr) {
			var ret = [];
			can.each(arr, function (a, i) {
				ret[i] = a;
			});
			return ret;
		};

		can.proxy = function (f, ctx) {
			return function () {
				return f.apply(ctx, arguments);
			};
		};

		// Make ajax.
		var XHR = $.ajaxSettings.xhr;
		$.ajaxSettings.xhr = function () {
			var xhr = XHR();
			var open = xhr.open;
			xhr.open = function (type, url, async) {
				open.call(this, type, url, ASYNC === undefined ? true : ASYNC);
			};
			return xhr;
		};
		var ASYNC;
		var AJAX = $.ajax;
		var updateDeferred = function (xhr, d) {
			for (var prop in xhr) {
				if (typeof d[prop] === 'function') {
					d[prop] = function () {
						xhr[prop].apply(xhr, arguments);
					};
				} else {
					d[prop] = prop[xhr];
				}
			}
		};
		can.ajax = function (options) {

			var success = options.success,
				error = options.error;
			var d = can.Deferred();

			options.success = function (data) {

				updateDeferred(xhr, d);
				d.resolve.call(d, data);
				if (success) {
					success.apply(this, arguments);
				}
			};
			options.error = function () {
				updateDeferred(xhr, d);
				d.reject.apply(d, arguments);
				if (error) {
					error.apply(this, arguments);
				}
			};
			if (options.async === false) {
				ASYNC = false;
			}
			var xhr = AJAX(options);
			ASYNC = undefined;
			updateDeferred(xhr, d);
			return d;
		};

		// Make destroyed and empty work.
		var $_empty = $.fn.empty;
		$.fn.empty = function () {
			this.each(function () {
				$.cleanData(this.getElementsByTagName('*'));
				this.innerHTML = '';
			});
			return $_empty.call(this);
		};

		var $_remove = $.fn.remove;
		$.fn.remove = function () {
			this.each(function () {
				if (this.getElementsByTagName) {
					$.cleanData([this].concat(can.makeArray(this.getElementsByTagName('*'))));
				}
			});
			return $_remove.call(this);
		};

		can.trim = function (str) {
			return str.trim();
		};
		can.isEmptyObject = function (object) {
			var name;
			for (name in object) {}
			return name === undefined;
		};

		// Make extend handle `true` for deep.
		can.extend = function (first) {
			if (first === true) {
				var args = can.makeArray(arguments);
				args.shift();
				return $.extend.apply($, args);
			}
			return $.extend.apply($, arguments);
		};

		can.get = function (wrapped, index) {
			return wrapped[index];
		};

		// setup inserted calls
		can.each(['after', 'prepend', 'before', 'append', 'html'], function (name) {
			var original = Zepto.fn[name];
			Zepto.fn[name] = function () {
				var elems,
					args = can.makeArray(arguments);

				if (args[0] != null) {
					// documentFragment
					if (typeof args[0] === "string") {
						args[0] = $.zepto.fragment(args[0]);
					}
					if (args[0].nodeType === 11) {
						elems = can.makeArray(args[0].childNodes);
					} else {
						elems = [args[0]];
					}
				}

				var ret = original.apply(this, args);

				can.inserted(elems);

				return ret;
			};
		});

		// Setup attributes events

		// turn off mutation events for zepto
		delete attr.MutationObserver;

		var oldAttr = $.fn.attr;
		$.fn.attr = function (attrName, value) {
			var isString = typeof attrName === "string",
				oldValue,
				newValue;
			if (value !== undefined && isString) {
				oldValue = oldAttr.call(this, attrName);
			}
			var res = oldAttr.apply(this, arguments);
			if (value !== undefined && isString) {
				newValue = oldAttr.call(this, attrName);
			}
			if (newValue !== oldValue) {
				can.attr.trigger(this[0], attrName, oldValue);
			}
			return res;
		};
		var oldRemove = $.fn.removeAttr;
		$.fn.removeAttr = function (attrName) {
			var oldValue = oldAttr.call(this, attrName),
				res = oldRemove.apply(this, arguments);

			if (oldValue != null) {
				can.attr.trigger(this[0], attrName, oldValue);
			}
			return res;
		};

		var oldBind = $.fn.bind,
			oldUnbind = $.fn.unbind;

		$.fn.bind = function (event) {
			if (event === "attributes") {
				this.each(function () {
					var el = can.$(this);
					can.data(el, "canHasAttributesBindings", (can.data(el, "canHasAttributesBindings") || 0) + 1);
				});
			}
			return oldBind.apply(this, arguments);
		};

		$.fn.unbind = function (event) {
			if (event === "attributes") {
				this.each(function () {
					var el = can.$(this),
						cur = can.data(el, "canHasAttributesBindings") || 0;
					if (cur <= 0) {
						can.data(el, "canHasAttributesBindings", 0);
					} else {
						can.data(el, "canHasAttributesBindings", cur - 1);
					}
				});
			}
			return oldUnbind.apply(this, arguments);
		};

		return can;
	});
