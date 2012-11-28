/*
* CanJS - 1.1.2 (2012-11-28)
* http://canjs.us/
* Copyright (c) 2012 Bitovi
* Licensed MIT
*/
(function (window, $, undefined) {
	// ## can/util/can.js
	var can = window.can || {};
	if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
		window.can = can;
	}

	can.isDeferred = function (obj) {
		var isFunction = this.isFunction;
		// Returns `true` if something looks like a deferred.
		return obj && isFunction(obj.then) && isFunction(obj.pipe);
	};
	// ## can/util/array/each.js
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

	// ## can/util/jquery/jquery.js
	// _jQuery node list._
	$.extend(can, $, {
		trigger: function (obj, event, args) {
			if (obj.trigger) {
				obj.trigger(event, args);
			} else {
				$.event.trigger(event, args, obj, true);
			}
		},
		addEvent: function (ev, cb) {
			$([this]).bind(ev, cb);
			return this;
		},
		removeEvent: function (ev, cb) {
			$([this]).unbind(ev, cb);
			return this;
		},
		// jquery caches fragments, we always needs a new one
		buildFragment: function (result, element) {
			var ret = $.buildFragment([result], $(element));
			return ret.cacheable ? $.clone(ret.fragment) : ret.fragment;
		},
		$: $,
		each: can.each
	});

	// Wrap binding functions.
	$.each(['bind', 'unbind', 'undelegate', 'delegate'], function (i, func) {
		can[func] = function () {
			var t = this[func] ? this : $([this]);
			t[func].apply(t, arguments);
			return this;
		};
	});

	// Wrap modifier functions.
	$.each(["append", "filter", "addClass", "remove", "data", "get"], function (i, name) {
		can[name] = function (wrapped) {
			return wrapped[name].apply(wrapped, can.makeArray(arguments).slice(1));
		};
	});

	// Memory safe destruction.
	var oldClean = $.cleanData;

	$.cleanData = function (elems) {
		$.each(elems, function (i, elem) {
			if (elem) {
				can.trigger(elem, "destroyed", [], false);
			}
		});
		oldClean(elems);
	};

	// ## can/util/string/string.js
	// ##string.js
	// _Miscellaneous string utility functions._  
	// Several of the methods in this plugin use code adapated from Prototype
	// Prototype JavaScript framework, version 1.6.0.1.
	// © 2005-2007 Sam Stephenson
	var undHash = /_|-/,
		colons = /\=\=/,
		words = /([A-Z]+)([A-Z][a-z])/g,
		lowUp = /([a-z\d])([A-Z])/g,
		dash = /([a-z\d])([A-Z])/g,
		replacer = /\{([^\}]+)\}/g,
		quote = /"/g,
		singleQuote = /'/g,

		// Returns the `prop` property from `obj`.
		// If `add` is true and `prop` doesn't exist in `obj`, create it as an 
		// empty object.
		getNext = function (obj, prop, add) {
			return prop in obj ? obj[prop] : (add && (obj[prop] = {}));
		},

		// Returns `true` if the object can have properties (no `null`s).
		isContainer = function (current) {
			return (/^f|^o/).test(typeof current);
		};

	can.extend(can, {
		// Escapes strings for HTML.
		esc: function (content) {
			// Convert bad values into empty strings
			var isInvalid = content === null || content === undefined || (isNaN(content) && ("" + content === 'NaN'));
			return ("" + (isInvalid ? '' : content)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(quote, '&#34;').replace(singleQuote, "&#39;");
		},


		getObject: function (name, roots, add) {

			// The parts of the name we are looking up  
			// `['App','Models','Recipe']`
			var parts = name ? name.split('.') : [],
				length = parts.length,
				current, r = 0,
				ret, i;

			// Make sure roots is an `array`.
			roots = can.isArray(roots) ? roots : [roots || window];

			if (!length) {
				return roots[0];
			}

			// For each root, mark it as current.
			while (roots[r]) {
				current = roots[r];

				// Walk current to the 2nd to last object or until there 
				// is not a container.
				for (i = 0; i < length - 1 && isContainer(current); i++) {
					current = getNext(current, parts[i], add);
				}

				// If we can get a property from the 2nd to last object...
				if (isContainer(current)) {

					// Get (and possibly set) the property.
					ret = getNext(current, parts[i], add);

					// If there is a value, we exit.
					if (ret !== undefined) {
						// If `add` is `false`, delete the property
						if (add === false) {
							delete current[parts[i]];
						}
						return ret;

					}
				}
				r++;
			}
		},
		// Capitalizes a string.
		capitalize: function (s, cache) {
			// Used to make newId.
			return s.charAt(0).toUpperCase() + s.slice(1);
		},

		// Underscores a string.
		underscore: function (s) {
			return s.replace(colons, '/').replace(words, '$1_$2').replace(lowUp, '$1_$2').replace(dash, '_').toLowerCase();
		},
		// Micro-templating.
		sub: function (str, data, remove) {
			var obs = [];

			obs.push(str.replace(replacer, function (whole, inside) {

				// Convert inside to type.
				var ob = can.getObject(inside, data, remove === undefined ? remove : !remove);

				if (ob === undefined) {
					obs = null;
					return "";
				}

				// If a container, push into objs (which will return objects found).
				if (isContainer(ob) && obs) {
					obs.push(ob);
					return "";
				}

				return "" + ob;
			}));

			return obs === null ? obs : (obs.length <= 1 ? obs[0] : obs);
		},

		// These regex's are used throughout the rest of can, so let's make
		// them available.
		replacer: replacer,
		undHash: undHash
	});
	// ## can/construct/construct.js
	// ## construct.js
	// `can.Construct`  
	// _This is a modified version of
	// [John Resig's class](http://ejohn.org/blog/simple-javascript-inheritance/).  
	// It provides class level inheritance and callbacks._
	// A private flag used to initialize a new class instance without
	// initializing it's bindings.
	var initializing = 0;


	can.Construct = function () {
		if (arguments.length) {
			return can.Construct.extend.apply(can.Construct, arguments);
		}
	};


	can.extend(can.Construct, {

		newInstance: function () {
			// Get a raw instance object (`init` is not called).
			var inst = this.instance(),
				arg = arguments,
				args;

			// Call `setup` if there is a `setup`
			if (inst.setup) {
				args = inst.setup.apply(inst, arguments);
			}

			// Call `init` if there is an `init`  
			// If `setup` returned `args`, use those as the arguments
			if (inst.init) {
				inst.init.apply(inst, args || arguments);
			}

			return inst;
		},
		// Overwrites an object with methods. Used in the `super` plugin.
		// `newProps` - New properties to add.  
		// `oldProps` - Where the old properties might be (used with `super`).  
		// `addTo` - What we are adding to.
		_inherit: function (newProps, oldProps, addTo) {
			can.extend(addTo || newProps, newProps || {})
		},
		// used for overwriting a single property.
		// this should be used for patching other objects
		// the super plugin overwrites this
		_overwrite: function (what, oldProps, propName, val) {
			what[propName] = val;
		},
		// Set `defaults` as the merger of the parent `defaults` and this 
		// object's `defaults`. If you overwrite this method, make sure to
		// include option merging logic.
		setup: function (base, fullName) {
			this.defaults = can.extend(true, {}, base.defaults, this.defaults);
		},
		// Create's a new `class` instance without initializing by setting the
		// `initializing` flag.
		instance: function () {

			// Prevents running `init`.
			initializing = 1;

			var inst = new this();

			// Allow running `init`.
			initializing = 0;

			return inst;
		},
		// Extends classes.
		extend: function (fullName, klass, proto) {
			// Figure out what was passed and normalize it.
			if (typeof fullName != 'string') {
				proto = klass;
				klass = fullName;
				fullName = null;
			}

			if (!proto) {
				proto = klass;
				klass = null;
			}
			proto = proto || {};

			var _super_class = this,
				_super = this.prototype,
				name, shortName, namespace, prototype;

			// Instantiate a base class (but only create the instance,
			// don't run the init constructor).
			prototype = this.instance();

			// Copy the properties over onto the new prototype.
			can.Construct._inherit(proto, _super, prototype);

			// The dummy class constructor.


			function Constructor() {
				// All construction is actually done in the init method.
				if (!initializing) {
					return this.constructor !== Constructor && arguments.length ?
					// We are being called without `new` or we are extending.
					arguments.callee.extend.apply(arguments.callee, arguments) :
					// We are being called with `new`.
					this.constructor.newInstance.apply(this.constructor, arguments);
				}
			}

			// Copy old stuff onto class (can probably be merged w/ inherit)
			for (name in _super_class) {
				if (_super_class.hasOwnProperty(name)) {
					Constructor[name] = _super_class[name];
				}
			}

			// Copy new static properties on class.
			can.Construct._inherit(klass, _super_class, Constructor);

			// Setup namespaces.
			if (fullName) {

				var parts = fullName.split('.'),
					shortName = parts.pop(),
					current = can.getObject(parts.join('.'), window, true),
					namespace = current,
					_fullName = can.underscore(fullName.replace(/\./g, "_")),
					_shortName = can.underscore(shortName);



				current[shortName] = Constructor;
			}

			// Set things that shouldn't be overwritten.
			can.extend(Constructor, {
				constructor: Constructor,
				prototype: prototype,

				namespace: namespace,

				shortName: shortName,
				_shortName: _shortName,

				fullName: fullName,
				_fullName: _fullName
			});

			// Make sure our prototype looks nice.
			Constructor.prototype.constructor = Constructor;


			// Call the class `setup` and `init`
			var t = [_super_class].concat(can.makeArray(arguments)),
				args = Constructor.setup.apply(Constructor, t);

			if (Constructor.init) {
				Constructor.init.apply(Constructor, args || t);
			}


			return Constructor;

		}

	});
	// ## can/construct/proxy/proxy.js
	var isFunction = can.isFunction,
		isArray = can.isArray,
		makeArray = can.makeArray,

		proxy = function (funcs) {

			//args that should be curried
			var args = makeArray(arguments),
				self;

			// get the functions to callback
			funcs = args.shift();

			// if there is only one function, make funcs into an array
			if (!isArray(funcs)) {
				funcs = [funcs];
			}

			// keep a reference to us in self
			self = this;


			return function class_cb() {
				// add the arguments after the curried args
				var cur = args.concat(makeArray(arguments)),
					isString, length = funcs.length,
					f = 0,
					func;

				// go through each function to call back
				for (; f < length; f++) {
					func = funcs[f];
					if (!func) {
						continue;
					}

					// set called with the name of the function on self (this is how this.view works)
					isString = typeof func == "string";

					// call the function
					cur = (isString ? self[func] : func).apply(self, cur || []);

					// pass the result to the next function (if there is a next function)
					if (f < length - 1) {
						cur = !isArray(cur) || cur._use_call ? [cur] : cur
					}
				}
				return cur;
			}
		}
		can.Construct.proxy = can.Construct.prototype.proxy = proxy;
	// ## can/construct/super/super.js
	// tests if we can get super in .toString()
	var isFunction = can.isFunction,

		fnTest = /xyz/.test(function () {
			xyz;
		}) ? /\b_super\b/ : /.*/;

	// overwrites a single property so it can still call super
	can.Construct._overwrite = function (addTo, base, name, val) {
		// Check if we're overwriting an existing function
		addTo[name] = isFunction(val) && isFunction(base[name]) && fnTest.test(val) ? (function (name, fn) {
			return function () {
				var tmp = this._super,
					ret;

				// Add a new ._super() method that is the same method
				// but on the super-class
				this._super = base[name];

				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				ret = fn.apply(this, arguments);
				this._super = tmp;
				return ret;
			};
		})(name, val) : val;
	}
	// overwrites an object with methods, sets up _super
	//   newProps - new properties
	//   oldProps - where the old properties might be
	//   addTo - what we are adding to
	can.Construct._inherit = function (newProps, oldProps, addTo) {
		addTo = addTo || newProps
		for (var name in newProps) {
			can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
		}
	}

	// ## can/control/control.js
	// ## control.js
	// `can.Control`  
	// _Controller_
	// Binds an element, returns a function that unbinds.
	var bind = function (el, ev, callback) {

		can.bind.call(el, ev, callback);

		return function () {
			can.unbind.call(el, ev, callback);
		};
	},
		isFunction = can.isFunction,
		extend = can.extend,
		each = can.each,
		slice = [].slice,
		paramReplacer = /\{([^\}]+)\}/g,
		special = can.getObject("$.event.special") || {},

		// Binds an element, returns a function that unbinds.
		delegate = function (el, selector, ev, callback) {
			can.delegate.call(el, selector, ev, callback);
			return function () {
				can.undelegate.call(el, selector, ev, callback);
			};
		},

		// Calls bind or unbind depending if there is a selector.
		binder = function (el, ev, callback, selector) {
			return selector ? delegate(el, can.trim(selector), ev, callback) : bind(el, ev, callback);
		},

		basicProcessor;


	var Control = can.Control = can.Construct(

	{
		// Setup pre-processes which methods are event listeners.
		setup: function () {

			// Allow contollers to inherit "defaults" from super-classes as it 
			// done in `can.Construct`
			can.Construct.setup.apply(this, arguments);

			// If you didn't provide a name, or are `control`, don't do anything.
			if (can.Control) {

				// Cache the underscored names.
				var control = this,
					funcName;

				// Calculate and cache actions.
				control.actions = {};
				for (funcName in control.prototype) {
					if (control._isAction(funcName)) {
						control.actions[funcName] = control._action(funcName);
					}
				}
			}
		},

		// Moves `this` to the first argument, wraps it with `jQuery` if it's an element
		_shifter: function (context, name) {

			var method = typeof name == "string" ? context[name] : name;

			if (!isFunction(method)) {
				method = context[method];
			}

			return function () {
				context.called = name;
				return method.apply(context, [this.nodeName ? can.$(this) : this].concat(slice.call(arguments, 0)));
			};
		},

		// Return `true` if is an action.
		_isAction: function (methodName) {

			var val = this.prototype[methodName],
				type = typeof val;
			// if not the constructor
			return (methodName !== 'constructor') &&
			// and is a function or links to a function
			(type == "function" || (type == "string" && isFunction(this.prototype[val]))) &&
			// and is in special, a processor, or has a funny character
			!! (special[methodName] || processors[methodName] || /[^\w]/.test(methodName));
		},
		// Takes a method name and the options passed to a control
		// and tries to return the data necessary to pass to a processor
		// (something that binds things).
		_action: function (methodName, options) {

			// If we don't have options (a `control` instance), we'll run this 
			// later.  
			paramReplacer.lastIndex = 0;
			if (options || !paramReplacer.test(methodName)) {
				// If we have options, run sub to replace templates `{}` with a
				// value from the options or the window
				var convertedName = options ? can.sub(methodName, [options, window]) : methodName;
				if (!convertedName) {
					return null;
				}
				// If a `{}` template resolves to an object, `convertedName` will be
				// an array
				var arr = can.isArray(convertedName),

					// Get the name
					name = arr ? convertedName[1] : convertedName,

					// Grab the event off the end
					parts = name.split(/\s+/g),
					event = parts.pop();

				return {
					processor: processors[event] || basicProcessor,
					parts: [name, parts.join(" "), event],
					delegate: arr ? convertedName[0] : undefined
				};
			}
		},
		// An object of `{eventName : function}` pairs that Control uses to 
		// hook up events auto-magically.
		processors: {},
		// A object of name-value pairs that act as default values for a 
		// control instance
		defaults: {}
	},

	{
		// Sets `this.element`, saves the control in `data, binds event
		// handlers.
		setup: function (element, options) {

			var cls = this.constructor,
				pluginname = cls.pluginName || cls._fullName,
				arr;

			// Want the raw element here.
			this.element = can.$(element)

			if (pluginname && pluginname !== 'can_control') {
				// Set element and `className` on element.
				this.element.addClass(pluginname);
			}

			(arr = can.data(this.element, "controls")) || can.data(this.element, "controls", arr = []);
			arr.push(this);

			// Option merging.
			this.options = extend({}, cls.defaults, options);

			// Bind all event handlers.
			this.on();

			// Get's passed into `init`.
			return [this.element, this.options];
		},

		on: function (el, selector, eventName, func) {
			if (!el) {

				// Adds bindings.
				this.off();

				// Go through the cached list of actions and use the processor 
				// to bind
				var cls = this.constructor,
					bindings = this._bindings,
					actions = cls.actions,
					element = this.element,
					destroyCB = can.Control._shifter(this, "destroy"),
					funcName, ready;

				for (funcName in actions) {
					// Only push if we have the action and no option is `undefined`
					if (actions.hasOwnProperty(funcName) && (ready = actions[funcName] || cls._action(funcName, this.options))) {
						bindings.push(ready.processor(ready.delegate || element, ready.parts[2], ready.parts[1], funcName, this));
					}
				}


				// Setup to be destroyed...  
				// don't bind because we don't want to remove it.
				can.bind.call(element, "destroyed", destroyCB);
				bindings.push(function (el) {
					can.unbind.call(el, "destroyed", destroyCB);
				});
				return bindings.length;
			}

			if (typeof el == 'string') {
				func = eventName;
				eventName = selector;
				selector = el;
				el = this.element;
			}

			if (func === undefined) {
				func = eventName;
				eventName = selector;
				selector = null;
			}

			if (typeof func == 'string') {
				func = can.Control._shifter(this, func);
			}

			this._bindings.push(binder(el, eventName, func, selector));

			return this._bindings.length;
		},
		// Unbinds all event handlers on the controller.
		off: function () {
			var el = this.element[0]
			each(this._bindings || [], function (value) {
				value(el);
			});
			// Adds bindings.
			this._bindings = [];
		},
		// Prepares a `control` for garbage collection
		destroy: function () {
			var Class = this.constructor,
				pluginName = Class.pluginName || Class._fullName,
				controls;

			// Unbind bindings.
			this.off();

			if (pluginName && pluginName !== 'can_control') {
				// Remove the `className`.
				this.element.removeClass(pluginName);
			}

			// Remove from `data`.
			controls = can.data(this.element, "controls");
			controls.splice(can.inArray(this, controls), 1);

			can.trigger(this, "destroyed"); // In case we want to know if the `control` is removed.
			this.element = null;
		}
	});

	var processors = can.Control.processors,
		// Processors do the binding.
		// They return a function that unbinds when called.  
		// The basic processor that binds events.
		basicProcessor = function (el, event, selector, methodName, control) {
			return binder(el, event, can.Control._shifter(control, methodName), selector);
		};

	// Set common events to be processed as a `basicProcessor`
	each(["change", "click", "contextmenu", "dblclick", "keydown", "keyup", "keypress", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "reset", "resize", "scroll", "select", "submit", "focusin", "focusout", "mouseenter", "mouseleave",
	// #104 - Add touch events as default processors
	// TOOD feature detect?
	"touchstart", "touchmove", "touchcancel", "touchend", "touchleave"], function (v) {
		processors[v] = basicProcessor;
	});

	// ## can/control/plugin/plugin.js
	//used to determine if a control instance is one of controllers
	//controllers can be strings or classes
	var i, isAControllerOf = function (instance, controllers) {
		for (i = 0; i < controllers.length; i++) {
			if (typeof controllers[i] == 'string' ? instance.constructor._shortName == controllers[i] : instance instanceof controllers[i]) {
				return true;
			}
		}
		return false;
	},
		makeArray = can.makeArray,
		old = can.Control.setup;

	can.Control.setup = function () {
		// if you didn't provide a name, or are control, don't do anything
		if (this !== can.Control) {


			var pluginName = this.pluginName || this._fullName;

			// create jQuery plugin
			if (pluginName !== 'can_control') {
				this.plugin(pluginName);
			}

			old.apply(this, arguments);
		}
	};

	$.fn.extend({


		controls: function () {
			var controllerNames = makeArray(arguments),
				instances = [],
				controls, c, cname;
			//check if arguments
			this.each(function () {

				controls = can.$(this).data("controls");
				if (!controls) {
					return;
				}
				for (var i = 0; i < controls.length; i++) {
					c = controls[i];
					if (!controllerNames.length || isAControllerOf(c, controllerNames)) {
						instances.push(c);
					}
				}
			});
			return instances;
		},


		control: function (control) {
			return this.controls.apply(this, arguments)[0];
		}
	});

	can.Control.plugin = function (pluginname) {
		var control = this;

		if (!$.fn[pluginname]) {
			$.fn[pluginname] = function (options) {

				var args = makeArray(arguments),
					//if the arg is a method on this control
					isMethod = typeof options == "string" && $.isFunction(control.prototype[options]),
					meth = args[0],
					returns;
				this.each(function () {
					//check if created
					var plugin = can.$(this).control(control);

					if (plugin) {
						if (isMethod) {
							// call a method on the control with the remaining args
							returns = plugin[meth].apply(plugin, args.slice(1));
						}
						else {
							// call the plugin's update method
							plugin.update.apply(plugin, args);
						}
					}
					else {
						//create a new control instance
						control.newInstance.apply(control, [this].concat(args));
					}
				});
				return returns !== undefined ? returns : this;
			};
		}
	}

	can.Control.prototype.update = function (options) {
		can.extend(this.options, options);
		this.on();
	};

	// ## can/view/view.js
	// ## view.js
	// `can.view`  
	// _Templating abstraction._
	var isFunction = can.isFunction,
		makeArray = can.makeArray,
		// Used for hookup `id`s.
		hookupId = 1,

		$view = can.view = function (view, data, helpers, callback) {
			// Get the result.
			var result = $view.render(view, data, helpers, callback);
			if (isFunction(result)) {
				return result;
			}
			if (can.isDeferred(result)) {
				return result.pipe(function (result) {
					return $view.frag(result);
				});
			}

			// Convert it into a dom frag.
			return $view.frag(result);
		};

	can.extend($view, {
		// creates a frag and hooks it up all at once
		frag: function (result, parentNode) {
			return $view.hookup($view.fragment(result), parentNode);
		},

		// simply creates a frag
		// this is used internally to create a frag
		// insert it
		// then hook it up
		fragment: function (result) {
			var frag = can.buildFragment(result, document.body);
			// If we have an empty frag...
			if (!frag.childNodes.length) {
				frag.appendChild(document.createTextNode(''));
			}
			return frag;
		},

		// Convert a path like string into something that's ok for an `element` ID.
		toId: function (src) {
			return can.map(src.toString().split(/\/|\./g), function (part) {
				// Dont include empty strings in toId functions
				if (part) {
					return part;
				}
			}).join("_");
		},

		hookup: function (fragment, parentNode) {
			var hookupEls = [],
				id, func;

			// Get all `childNodes`.
			can.each(fragment.childNodes ? can.makeArray(fragment.childNodes) : fragment, function (node) {
				if (node.nodeType === 1) {
					hookupEls.push(node);
					hookupEls.push.apply(hookupEls, can.makeArray(node.getElementsByTagName('*')));
				}
			});

			// Filter by `data-view-id` attribute.
			can.each(hookupEls, function (el) {
				if (el.getAttribute && (id = el.getAttribute('data-view-id')) && (func = $view.hookups[id])) {
					func(el, parentNode, id);
					delete $view.hookups[id];
					el.removeAttribute('data-view-id');
				}
			});

			return fragment;
		},


		hookups: {},


		hook: function (cb) {
			$view.hookups[++hookupId] = cb;
			return " data-view-id='" + hookupId + "'";
		},


		cached: {},

		cachedRenderers: {},


		cache: true,


		register: function (info) {
			this.types["." + info.suffix] = info;
		},

		types: {},


		ext: ".ejs",


		registerScript: function () {},


		preload: function () {},


		render: function (view, data, helpers, callback) {
			// If helpers is a `function`, it is actually a callback.
			if (isFunction(helpers)) {
				callback = helpers;
				helpers = undefined;
			}

			// See if we got passed any deferreds.
			var deferreds = getDeferreds(data);

			if (deferreds.length) { // Does data contain any deferreds?
				// The deferred that resolves into the rendered content...
				var deferred = new can.Deferred();

				// Add the view request to the list of deferreds.
				deferreds.push(get(view, true))

				// Wait for the view and all deferreds to finish...
				can.when.apply(can, deferreds).then(function (resolved) {
					// Get all the resolved deferreds.
					var objs = makeArray(arguments),
						// Renderer is the last index of the data.
						renderer = objs.pop(),
						// The result of the template rendering with data.
						result;

					// Make data look like the resolved deferreds.
					if (can.isDeferred(data)) {
						data = usefulPart(resolved);
					}
					else {
						// Go through each prop in data again and
						// replace the defferreds with what they resolved to.
						for (var prop in data) {
							if (can.isDeferred(data[prop])) {
								data[prop] = usefulPart(objs.shift());
							}
						}
					}

					// Get the rendered result.
					result = renderer(data, helpers);

					// Resolve with the rendered view.
					deferred.resolve(result);

					// If there's a `callback`, call it back with the result.
					callback && callback(result);
				});
				// Return the deferred...
				return deferred;
			}
			else {
				// No deferreds! Render this bad boy.
				var response,
				// If there's a `callback` function
				async = isFunction(callback),
					// Get the `view` type
					deferred = get(view, async);

				// If we are `async`...
				if (async) {
					// Return the deferred
					response = deferred;
					// And fire callback with the rendered result.
					deferred.then(function (renderer) {
						callback(data ? renderer(data, helpers) : renderer);
					})
				} else {
					// if the deferred is resolved, call the cached renderer instead
					// this is because it's possible, with recursive deferreds to
					// need to render a view while its deferred is _resolving_.  A _resolving_ deferred
					// is a deferred that was just resolved and is calling back it's success callbacks.
					// If a new success handler is called while resoliving, it does not get fired by
					// jQuery's deferred system.  So instead of adding a new callback
					// we use the cached renderer.
					// We also add __view_id on the deferred so we can look up it's cached renderer.
					// In the future, we might simply store either a deferred or the cached result.
					if (deferred.state() === "resolved" && deferred.__view_id) {
						var currentRenderer = $view.cachedRenderers[deferred.__view_id];
						return data ? currentRenderer(data, helpers) : currentRenderer;
					} else {
						// Otherwise, the deferred is complete, so
						// set response to the result of the rendering.
						deferred.then(function (renderer) {
							response = data ? renderer(data, helpers) : renderer;
						});
					}

				}

				return response;
			}
		},

		registerView: function (id, text, type, def) {
			// Get the renderer function.
			var func = (type || $view.types[$view.ext]).renderer(id, text);
			def = def || new can.Deferred();

			// Cache if we are caching.
			if ($view.cache) {
				$view.cached[id] = def;
				def.__view_id = id;
				$view.cachedRenderers[id] = func;
			}

			// Return the objects for the response's `dataTypes`
			// (in this case view).
			return def.resolve(func);
		}
	});

	// Makes sure there's a template, if not, have `steal` provide a warning.
	var checkText = function (text, url) {
		if (!text.length) {

			throw "can.view: No template or empty template:" + url;
		}
	},
		// `Returns a `view` renderer deferred.  
		// `url` - The url to the template.  
		// `async` - If the ajax request should be asynchronous.  
		// Returns a deferred.
		get = function (url, async) {
			var suffix = url.match(/\.[\w\d]+$/),
				type,
				// If we are reading a script element for the content of the template,
				// `el` will be set to that script element.
				el,
				// A unique identifier for the view (used for caching).
				// This is typically derived from the element id or
				// the url for the template.
				id,
				// The ajax request used to retrieve the template content.
				jqXHR;

			//If the url has a #, we assume we want to use an inline template
			//from a script element and not current page's HTML
			if (url.match(/^#/)) {
				url = url.substr(1);
			}
			// If we have an inline template, derive the suffix from the `text/???` part.
			// This only supports `<script>` tags.
			if (el = document.getElementById(url)) {
				suffix = "." + el.type.match(/\/(x\-)?(.+)/)[2];
			}

			// If there is no suffix, add one.
			if (!suffix && !$view.cached[url]) {
				url += (suffix = $view.ext);
			}

			if (can.isArray(suffix)) {
				suffix = suffix[0]
			}

			// Convert to a unique and valid id.
			id = $view.toId(url);

			// If an absolute path, use `steal` to get it.
			// You should only be using `//` if you are using `steal`.
			if (url.match(/^\/\//)) {
				var sub = url.substr(2);
				url = !window.steal ? sub : steal.config().root.mapJoin(sub);
			}

			// Set the template engine type.
			type = $view.types[suffix];

			// If it is cached, 
			if ($view.cached[id]) {
				// Return the cached deferred renderer.
				return $view.cached[id];

				// Otherwise if we are getting this from a `<script>` element.
			} else if (el) {
				// Resolve immediately with the element's `innerHTML`.
				return $view.registerView(id, el.innerHTML, type);
			} else {
				// Make an ajax request for text.
				var d = new can.Deferred();
				can.ajax({
					async: async,
					url: url,
					dataType: "text",
					error: function (jqXHR) {
						checkText("", url);
						d.reject(jqXHR);
					},
					success: function (text) {
						// Make sure we got some text back.
						checkText(text, url);
						$view.registerView(id, text, type, d)
					}
				});
				return d;
			}
		},
		// Gets an `array` of deferreds from an `object`.
		// This only goes one level deep.
		getDeferreds = function (data) {
			var deferreds = [];

			// pull out deferreds
			if (can.isDeferred(data)) {
				return [data]
			} else {
				for (var prop in data) {
					if (can.isDeferred(data[prop])) {
						deferreds.push(data[prop]);
					}
				}
			}
			return deferreds;
		},
		// Gets the useful part of a resolved deferred.
		// This is for `model`s and `can.ajax` that resolve to an `array`.
		usefulPart = function (resolved) {
			return can.isArray(resolved) && resolved[1] === 'success' ? resolved[0] : resolved
		};


	if (window.steal) {
		steal.type("view js", function (options, success, error) {
			var type = $view.types["." + options.type],
				id = $view.toId(options.id);

			options.text = "steal('" + (type.plugin || "can/view/" + options.type) + "',function(can){return " + "can.view.preload('" + id + "'," + options.text + ");\n})";
			success();
		})
	}

	//!steal-pluginify-remove-start
	can.extend($view, {
		register: function (info) {
			this.types["." + info.suffix] = info;

			if (window.steal) {
				steal.type(info.suffix + " view js", function (options, success, error) {
					var type = $view.types["." + options.type],
						id = $view.toId(options.id + '');

					options.text = type.script(id, options.text)
					success();
				})
			};

			$view[info.suffix] = function (id, text) {
				if (!text) {
					// Return a nameless renderer
					return info.renderer(null, id);
				}

				$view.preload(id, info.renderer(id, text));
				return can.view(id);
			}
		},
		registerScript: function (type, id, src) {
			return "can.view.preload('" + id + "'," + $view.types["." + type].script(id, src) + ");";
		},
		preload: function (id, renderer) {
			$view.cached[id] = new can.Deferred().resolve(function (data, helpers) {
				return renderer.call(data, data, helpers);
			});
			return function () {
				return $view.frag(renderer.apply(this, arguments))
			};
		}

	});
	//!steal-pluginify-remove-end
	// ## can/view/scanner.js
	var newLine = /(\r|\n)+/g,
		tagToContentPropMap = {
			option: "textContent",
			textarea: "value"
		},
		// Escapes characters starting with `\`.
		clean = function (content) {
			return content.split('\\').join("\\\\").split("\n").join("\\n").split('"').join('\\"').split("\t").join("\\t");
		},
		reverseTagMap = {
			tr: "tbody",
			option: "select",
			td: "tr",
			li: "ul"
		},
		// Returns a tagName to use as a temporary placeholder for live content
		// looks forward ... could be slow, but we only do it when necessary
		getTag = function (tagName, tokens, i) {
			// if a tagName is provided, use that
			if (tagName) {
				return tagName;
			} else {
				// otherwise go searching for the next two tokens like "<",TAG
				while (i < tokens.length) {
					if (tokens[i] == "<" && reverseTagMap[tokens[i + 1]]) {
						return reverseTagMap[tokens[i + 1]];
					}
					i++;
				}
			}
		},
		bracketNum = function (content) {
			return (--content.split("{").length) - (--content.split("}").length);
		},
		myEval = function (script) {
			eval(script);
		},
		attrReg = /([^\s]+)[\s]*=[\s]*$/,
		// Commands for caching.
		startTxt = 'var ___v1ew = [];',
		finishTxt = "return ___v1ew.join('')",
		put_cmd = "___v1ew.push(",
		insert_cmd = put_cmd,
		// Global controls (used by other functions to know where we are).
		// Are we inside a tag?
		htmlTag = null,
		// Are we within a quote within a tag?
		quote = null,
		// What was the text before the current quote? (used to get the `attr` name)
		beforeQuote = null,
		// Whether a rescan is in progress
		rescan = null,
		// Used to mark where the element is.
		status = function () {
			// `t` - `1`.
			// `h` - `0`.
			// `q` - String `beforeQuote`.
			return quote ? "'" + beforeQuote.match(attrReg)[1] + "'" : (htmlTag ? 1 : 0);
		};

	can.view.Scanner = Scanner = function (options) {
		// Set options on self
		can.extend(this, {
			text: {},
			tokens: []
		}, options);

		// Cache a token lookup
		this.tokenReg = [];
		this.tokenSimple = {
			"<": "<",
			">": ">",
			'"': '"',
			"'": "'"
		};
		this.tokenComplex = [];
		this.tokenMap = {};
		for (var i = 0, token; token = this.tokens[i]; i++) {


			// Save complex mappings (custom regexp)
			if (token[2]) {
				this.tokenReg.push(token[2]);
				this.tokenComplex.push({
					abbr: token[1],
					re: new RegExp(token[2]),
					rescan: token[3]
				});
			}
			// Save simple mappings (string only, no regexp)
			else {
				this.tokenReg.push(token[1]);
				this.tokenSimple[token[1]] = token[0];
			}
			this.tokenMap[token[0]] = token[1];
		}

		// Cache the token registry.
		this.tokenReg = new RegExp("(" + this.tokenReg.slice(0).concat(["<", ">", '"', "'"]).join("|") + ")", "g");
	};

	Scanner.prototype = {

		helpers: [

		{
			name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
			fn: function (content) {
				var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
					parts = content.match(quickFunc);

				return "function(__){var " + parts[1] + "=can.$(__);" + parts[2] + "}";
			}
		}],

		scan: function (source, name) {
			var tokens = [],
				last = 0,
				simple = this.tokenSimple,
				complex = this.tokenComplex;

			source = source.replace(newLine, "\n");
			source.replace(this.tokenReg, function (whole, part) {
				// offset is the second to last argument
				var offset = arguments[arguments.length - 2];

				// if the next token starts after the last token ends
				// push what's in between
				if (offset > last) {
					tokens.push(source.substring(last, offset));
				}

				// push the simple token (if there is one)
				if (simple[whole]) {
					tokens.push(whole);
				}
				// otherwise lookup complex tokens
				else {
					for (var i = 0, token; token = complex[i]; i++) {
						if (token.re.test(whole)) {
							tokens.push(token.abbr);
							// Push a rescan function if one exists
							if (token.rescan) {
								tokens.push(token.rescan(part));
							}
							break;
						}
					}
				}

				// update the position of the last part of the last token
				last = offset + part.length;
			});

			// if there's something at the end, add it
			if (last < source.length) {
				tokens.push(source.substr(last));
			}

			var content = '',
				buff = [startTxt + (this.text.start || '')],
				// Helper `function` for putting stuff in the view concat.
				put = function (content, bonus) {
					buff.push(put_cmd, '"', clean(content), '"' + (bonus || '') + ');');
				},
				// A stack used to keep track of how we should end a bracket
				// `}`.  
				// Once we have a `<%= %>` with a `leftBracket`,
				// we store how the file should end here (either `))` or `;`).
				endStack = [],
				// The last token, used to remember which tag we are in.
				lastToken,
				// The corresponding magic tag.
				startTag = null,
				// Was there a magic tag inside an html tag?
				magicInTag = false,
				// The current tag name.
				tagName = '',
				// stack of tagNames
				tagNames = [],
				// Declared here.
				bracketCount, i = 0,
				token, tmap = this.tokenMap;

			// Reinitialize the tag state goodness.
			htmlTag = quote = beforeQuote = null;

			for (;
			(token = tokens[i++]) !== undefined;) {
				if (startTag === null) {
					switch (token) {
					case tmap.left:
					case tmap.escapeLeft:
					case tmap.returnLeft:
						magicInTag = htmlTag && 1;
					case tmap.commentLeft:
						// A new line -- just add whatever content within a clean.  
						// Reset everything.
						startTag = token;
						if (content.length) {
							put(content);
						}
						content = '';
						break;
					case tmap.escapeFull:
						// This is a full line escape (a line that contains only whitespace and escaped logic)
						// Break it up into escape left and right
						magicInTag = htmlTag && 1;
						rescan = 1;
						startTag = tmap.escapeLeft;
						if (content.length) {
							put(content);
						}
						rescan = tokens[i++];
						content = rescan.content || rescan;
						if (rescan.before) {
							put(rescan.before);
						}
						tokens.splice(i, 0, tmap.right);
						break;
					case tmap.commentFull:
						// Ignore full line comments.
						break;
					case tmap.templateLeft:
						content += tmap.left;
						break;
					case '<':
						// Make sure we are not in a comment.
						if (tokens[i].indexOf("!--") !== 0) {
							htmlTag = 1;
							magicInTag = 0;
						}
						content += token;
						break;
					case '>':
						htmlTag = 0;
						// content.substr(-1) doesn't work in IE7/8
						var emptyElement = content.substr(content.length - 1) == "/";
						// if there was a magic tag
						// or it's an element that has text content between its tags, 
						// but content is not other tags add a hookup
						// TODO: we should only add `can.EJS.pending()` if there's a magic tag 
						// within the html tags.
						if (magicInTag || tagToContentPropMap[tagNames[tagNames.length - 1]]) {
							// make sure / of /> is on the left of pending
							if (emptyElement) {
								put(content.substr(0, content.length - 1), ",can.view.pending(),\"/>\"");
							} else {
								put(content, ",can.view.pending(),\">\"");
							}
							content = '';
						} else {
							content += token;
						}
						// if it's a tag like <input/>
						if (emptyElement) {
							// remove the current tag in the stack
							tagNames.pop();
							// set the current tag to the previous parent
							tagName = tagNames[tagNames.length - 1];
						}
						break;
					case "'":
					case '"':
						// If we are in an html tag, finding matching quotes.
						if (htmlTag) {
							// We have a quote and it matches.
							if (quote && quote === token) {
								// We are exiting the quote.
								quote = null;
								// Otherwise we are creating a quote.
								// TODO: does this handle `\`?
							} else if (quote === null) {
								quote = token;
								beforeQuote = lastToken;
							}
						}
					default:
						// Track the current tag
						if (lastToken === '<') {
							tagName = token.split(/\s/)[0];
							if (tagName.indexOf("/") === 0 && tagNames.pop() === tagName.substr(1)) {
								// set tagName to the last tagName
								// if there are no more tagNames, we'll rely on getTag.
								tagName = tagNames[tagNames.length - 1];
							} else {
								tagNames.push(tagName);
							}
						}
						content += token;
						break;
					}
				} else {
					// We have a start tag.
					switch (token) {
					case tmap.right:
					case tmap.returnRight:
						switch (startTag) {
						case tmap.left:
							// Get the number of `{ minus }`
							bracketCount = bracketNum(content);

							// We are ending a block.
							if (bracketCount == 1) {

								// We are starting on.
								buff.push(insert_cmd, "can.view.txt(0,'" + getTag(tagName, tokens, i) + "'," + status() + ",this,function(){", startTxt, content);

								endStack.push({
									before: "",
									after: finishTxt + "}));\n"
								});
							}
							else {

								// How are we ending this statement?
								last = // If the stack has value and we are ending a block...
								endStack.length && bracketCount == -1 ? // Use the last item in the block stack.
								endStack.pop() : // Or use the default ending.
								{
									after: ";"
								};

								// If we are ending a returning block, 
								// add the finish text which returns the result of the
								// block.
								if (last.before) {
									buff.push(last.before);
								}
								// Add the remaining content.
								buff.push(content, ";", last.after);
							}
							break;
						case tmap.escapeLeft:
						case tmap.returnLeft:
							// We have an extra `{` -> `block`.
							// Get the number of `{ minus }`.
							bracketCount = bracketNum(content);
							// If we have more `{`, it means there is a block.
							if (bracketCount) {
								// When we return to the same # of `{` vs `}` end with a `doubleParent`.
								endStack.push({
									before: finishTxt,
									after: "}));"
								});
							}

							var escaped = startTag === tmap.escapeLeft ? 1 : 0,
								commands = {
									insert: insert_cmd,
									tagName: tagName,
									status: status()
								};

							for (var ii = 0; ii < this.helpers.length; ii++) {
								// Match the helper based on helper
								// regex name value
								var helper = this.helpers[ii];
								if (helper.name.test(content)) {
									content = helper.fn(content, commands);

									// dont escape partials
									if (helper.name.source == /^>[\s|\w]\w*/.source) {
										escaped = 0;
									}
									break;
								}
							}

							// Handle special cases
							if (typeof content == 'object') {
								if (content.raw) {
									buff.push(content.raw);
								}
							} else {
								// If we have `<%== a(function(){ %>` then we want
								// `can.EJS.text(0,this, function(){ return a(function(){ var _v1ew = [];`.
								buff.push(insert_cmd, "can.view.txt(" + escaped + ",'" + tagName + "'," + status() + ",this,function(){ " + (this.text.escape || '') + "return ", content,
								// If we have a block.
								bracketCount ?
								// Start with startTxt `"var _v1ew = [];"`.
								startTxt :
								// If not, add `doubleParent` to close push and text.
								"}));");
							}

							if (rescan && rescan.after && rescan.after.length) {
								put(rescan.after.length);
								rescan = null;
							}
							break;
						}
						startTag = null;
						content = '';
						break;
					case tmap.templateLeft:
						content += tmap.left;
						break;
					default:
						content += token;
						break;
					}
				}
				lastToken = token;
			}

			// Put it together...
			if (content.length) {
				// Should be `content.dump` in Ruby.
				put(content);
			}
			buff.push(";");

			var template = buff.join(''),
				out = {
					out: 'with(_VIEW) { with (_CONTEXT) {' + template + " " + finishTxt + "}}"
				};

			// Use `eval` instead of creating a function, because it is easier to debug.
			myEval.call(out, 'this.fn = (function(_CONTEXT,_VIEW){' + out.out + '});\r\n//@ sourceURL=' + name + ".js");

			return out;
		}
	};

	// ## can/observe/compute/compute.js

	// returns the
	// - observes and attr methods are called by func
	// - the value returned by func
	// ex: `{value: 100, observed: [{obs: o, attr: "completed"}]}`
	var getValueAndObserved = function (func, self) {

		var oldReading;
		if (can.Observe) {
			// Set a callback on can.Observe to know
			// when an attr is read.
			// Keep a reference to the old reader
			// if there is one.  This is used
			// for nested live binding.
			oldReading = can.Observe.__reading;
			can.Observe.__reading = function (obj, attr) {
				// Add the observe and attr that was read
				// to `observed`
				observed.push({
					obj: obj,
					attr: attr
				});
			};
		}

		var observed = [],
			// Call the "wrapping" function to get the value. `observed`
			// will have the observe/attribute pairs that were read.
			value = func.call(self);

		// Set back so we are no longer reading.
		if (can.Observe) {
			can.Observe.__reading = oldReading;
		}
		return {
			value: value,
			observed: observed
		};
	},
		// Calls `callback(newVal, oldVal)` everytime an observed property
		// called within `getterSetter` is changed and creates a new result of `getterSetter`.
		// Also returns an object that can teardown all event handlers.
		computeBinder = function (getterSetter, context, callback) {
			// track what we are observing
			var observing = {},
				// a flag indicating if this observe/attr pair is already bound
				matched = true,
				// the data to return 
				data = {
					// we will maintain the value while live-binding is taking place
					value: undefined,
					// a teardown method that stops listening
					teardown: function () {
						for (var name in observing) {
							var ob = observing[name];
							ob.observe.obj.unbind(ob.observe.attr, onchanged);
							delete observing[name];
						}
					}
				},
				batchNum;

			// when a property value is changed
			var onchanged = function (ev) {
				if (ev.batchNum === undefined || ev.batchNum !== batchNum) {
					// store the old value
					var oldValue = data.value,
						// get the new value
						newvalue = getValueAndBind();
					// update the value reference (in case someone reads)
					data.value = newvalue;
					// if a change happened
					if (newvalue !== oldValue) {
						callback(newvalue, oldValue);
					}
					batchNum = batchNum = ev.batchNum;
				}


			};

			// gets the value returned by `getterSetter` and also binds to any attributes
			// read by the call
			var getValueAndBind = function () {
				var info = getValueAndObserved(getterSetter, context),
					newObserveSet = info.observed;

				var value = info.value;
				matched = !matched;

				// go through every attribute read by this observe
				can.each(newObserveSet, function (ob) {
					// if the observe/attribute pair is being observed
					if (observing[ob.obj._cid + "|" + ob.attr]) {
						// mark at as observed
						observing[ob.obj._cid + "|" + ob.attr].matched = matched;
					} else {
						// otherwise, set the observe/attribute on oldObserved, marking it as being observed
						observing[ob.obj._cid + "|" + ob.attr] = {
							matched: matched,
							observe: ob
						};
						ob.obj.bind(ob.attr, onchanged);
					}
				});

				// Iterate through oldObserved, looking for observe/attributes
				// that are no longer being bound and unbind them
				for (var name in observing) {
					var ob = observing[name];
					if (ob.matched !== matched) {
						ob.observe.obj.unbind(ob.observe.attr, onchanged);
						delete observing[name];
					}
				}
				return value;
			};
			// set the initial value
			data.value = getValueAndBind();
			data.isListening = !can.isEmptyObject(observing);
			return data;
		}

		// if no one is listening ... we can not calculate every time
		can.compute = function (getterSetter, context) {
			if (getterSetter && getterSetter.isComputed) {
				return getterSetter;
			}
			// get the value right away
			// TODO: eventually we can defer this until a bind or a read
			var computedData, bindings = 0,
				computed, canbind = true;
			if (typeof getterSetter === "function") {
				computed = function (value) {
					if (value === undefined) {
						// we are reading
						if (computedData) {
							// If another compute is calling this compute for the value,
							// it needs to bind to this compute's change so it will re-compute
							// and re-bind when this compute changes.
							if (bindings && can.Observe.__reading) {
								can.Observe.__reading(computed, 'change');
							}
							return computedData.value;
						} else {
							return getterSetter.call(context || this)
						}
					} else {
						return getterSetter.apply(context || this, arguments)
					}
				}

			} else {
				// we just gave it a value
				computed = function (val) {
					if (val === undefined) {
						// If observing, record that the value is being read.
						if (can.Observe.__reading) {
							can.Observe.__reading(computed, 'change');
						}
						return getterSetter;
					} else {
						var old = getterSetter;
						getterSetter = val;
						if (old !== val) {
							can.Observe.triggerBatch(computed, "change", [val, old]);
						}

						return val;
					}

				}
				canbind = false;
			}

			computed.isComputed = true;



			computed.bind = function (ev, handler) {
				can.addEvent.apply(computed, arguments);
				if (bindings === 0 && canbind) {
					// setup live-binding
					computedData = computeBinder(getterSetter, context || this, function (newValue, oldValue) {
						can.Observe.triggerBatch(computed, "change", [newValue, oldValue])
					});
				}
				bindings++;
			}

			computed.unbind = function (ev, handler) {
				can.removeEvent.apply(computed, arguments);
				bindings--;
				if (bindings === 0 && canbind) {
					computedData.teardown();
				}

			};
			return computed;
		};
	can.compute.binder = computeBinder;
	// ## can/view/render.js
	// text node expando test
	var canExpando = true;
	try {
		document.createTextNode()._ = 0;
	} catch (ex) {
		canExpando = false;
	}

	var attrMap = {
		"class": "className",
		"value": "value",
		"textContent": "textContent"
	},
		tagMap = {
			"": "span",
			table: "tr",
			tr: "td",
			ol: "li",
			ul: "li",
			tbody: "tr",
			thead: "tr",
			tfoot: "tr",
			select: "option",
			optgroup: "option"
		},
		attributePlaceholder = '__!!__',
		attributeReplace = /__!!__/g,
		tagToContentPropMap = {
			option: "textContent",
			textarea: "value"
		},
		bool = can.each(["checked", "disabled", "readonly", "required"], function (n) {
			attrMap[n] = n;
		}),
		// a helper to get the parentNode for a given element el
		// if el is in a documentFragment, it will return defaultParentNode
		getParentNode = function (el, defaultParentNode) {
			return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
		},
		setAttr = function (el, attrName, val) {
			var tagName = el.nodeName.toString().toLowerCase(),
				prop = attrMap[attrName];
			// if this is a special property
			if (prop) {
				// set the value as true / false
				el[prop] = can.inArray(attrName, bool) > -1 ? true : val;
				if (prop === "value" && tagName === "input") {
					el.defaultValue = val;
				}
			} else {
				el.setAttribute(attrName, val);
			}
		},
		getAttr = function (el, attrName) {
			// Default to a blank string for IE7/8
			return (attrMap[attrName] ? el[attrMap[attrName]] : el.getAttribute(attrName)) || '';
		},
		removeAttr = function (el, attrName) {
			if (can.inArray(attrName, bool) > -1) {
				el[attrName] = false;
			} else {
				el.removeAttribute(attrName);
			}
		},
		pendingHookups = [],
		// Returns text content for anything other than a live-binding 
		contentText = function (input) {

			// If it's a string, return.
			if (typeof input == 'string') {
				return input;
			}
			// If has no value, return an empty string.
			if (!input && input !== 0) {
				return '';
			}

			// If it's an object, and it has a hookup method.
			var hook = (input.hookup &&

			// Make a function call the hookup method.


			function (el, id) {
				input.hookup.call(input, el, id);
			}) ||

			// Or if it's a `function`, just use the input.
			(typeof input == 'function' && input);

			// Finally, if there is a `function` to hookup on some dom,
			// add it to pending hookups.
			if (hook) {
				pendingHookups.push(hook);
				return '';
			}

			// Finally, if all else is `false`, `toString()` it.
			return "" + input;
		},
		// Returns escaped/sanatized content for anything other than a live-binding
		contentEscape = function (txt) {
			return (typeof txt == 'string' || typeof txt == 'number') ? can.esc(txt) : contentText(txt);
		},
		// a mapping of element ids to nodeList ids
		nodeMap = {},
		// a mapping of ids to text nodes
		textNodeMap = {},
		// a mapping of nodeList ids to nodeList
		nodeListMap = {},
		expando = "ejs_" + Math.random(),
		_id = 0,
		id = function (node) {
			if (canExpando || node.nodeType !== 3) {
				if (node[expando]) {
					return node[expando];
				}
				else {
					return node[expando] = (node.nodeName ? "element_" : "obj_") + (++_id);
				}
			}
			else {
				for (var textNodeID in textNodeMap) {
					if (textNodeMap[textNodeID] === node) {
						return textNodeID;
					}
				}

				textNodeMap["text_" + (++_id)] = node;
				return "text_" + _id;
			}
		},
		// removes a nodeListId from a node's nodeListIds
		removeNodeListId = function (node, nodeListId) {
			var nodeListIds = nodeMap[id(node)];
			if (nodeListIds) {
				var index = can.inArray(nodeListId, nodeListIds);

				if (index >= 0) {
					nodeListIds.splice(index, 1);
				}
				if (!nodeListIds.length) {
					delete nodeMap[id(node)];
				}
			}
		},
		addNodeListId = function (node, nodeListId) {
			var nodeListIds = nodeMap[id(node)];
			if (!nodeListIds) {
				nodeListIds = nodeMap[id(node)] = [];
			}
			nodeListIds.push(nodeListId);
		},
		tagChildren = function (tagName) {
			var newTag = tagMap[tagName] || "span";
			if (newTag === "span") {
				//innerHTML in IE doesn't honor leading whitespace after empty elements
				return "@@!!@@";
			}
			return "<" + newTag + ">" + tagChildren(newTag) + "</" + newTag + ">";
		};

	can.extend(can.view, {

		pending: function () {
			// TODO, make this only run for the right tagName
			var hooks = pendingHookups.slice(0);
			lastHookups = hooks;
			pendingHookups = [];
			return can.view.hook(function (el) {
				can.each(hooks, function (fn) {
					fn(el);
				});
			});
		},

		registerNode: function (nodeList) {
			var nLId = id(nodeList);
			nodeListMap[nLId] = nodeList;

			can.each(nodeList, function (node) {
				addNodeListId(node, nLId);
			});
		},

		unregisterNode: function (nodeList) {
			var nLId = id(nodeList);
			can.each(nodeList, function (node) {
				removeNodeListId(node, nLId);
			});
			delete nodeListMap[nLId];
		},


		txt: function (escape, tagName, status, self, func) {
			// call the "wrapping" function and get the binding information
			var binding = can.compute.binder(func, self, function (newVal, oldVal) {
				// call the update method we will define for each
				// type of attribute
				update(newVal, oldVal);
			});

			// If we had no observes just return the value returned by func.
			if (!binding.isListening) {
				return (escape || status !== 0 ? contentEscape : contentText)(binding.value);
			}

			// The following are helper methods or varaibles that will
			// be defined by one of the various live-updating schemes.
			// The parent element we are listening to for teardown
			var parentElement, nodeList, teardown = function () {
				binding.teardown();
				if (nodeList) {
					can.view.unregisterNode(nodeList);
				}
			},
				// if the parent element is removed, teardown the binding
				setupTeardownOnDestroy = function (el) {
					can.bind.call(el, 'destroyed', teardown);
					parentElement = el;
				},
				// if there is no parent, undo bindings
				teardownCheck = function (parent) {
					if (!parent) {
						teardown();
						can.unbind.call(parentElement, 'destroyed', teardown);
					}
				},
				// the tag type to insert
				tag = (tagMap[tagName] || "span"),
				// this will be filled in if binding.isListening
				update,
				// the property (instead of innerHTML elements) to adjust. For
				// example options should use textContent
				contentProp = tagToContentPropMap[tagName];


			// The magic tag is outside or between tags.
			if (status === 0 && !contentProp) {
				// Return an element tag with a hookup in place of the content
				return "<" + tag + can.view.hook(
				escape ?
				// If we are escaping, replace the parentNode with 
				// a text node who's value is `func`'s return value.


				function (el, parentNode) {
					// updates the text of the text node
					update = function (newVal) {
						node.nodeValue = "" + newVal;
						teardownCheck(node.parentNode);
					};

					var parent = getParentNode(el, parentNode),
						node = document.createTextNode(binding.value);

					parent.insertBefore(node, el);
					parent.removeChild(el);
					setupTeardownOnDestroy(parent);
				} :
				// If we are not escaping, replace the parentNode with a
				// documentFragment created as with `func`'s return value.


				function (span, parentNode) {
					// updates the elements with the new content
					update = function (newVal) {
						// is this still part of the DOM?
						var attached = nodes[0].parentNode;
						// update the nodes in the DOM with the new rendered value
						if (attached) {
							makeAndPut(newVal);
						}
						teardownCheck(nodes[0].parentNode);
					};

					// make sure we have a valid parentNode
					parentNode = getParentNode(span, parentNode);
					// A helper function to manage inserting the contents
					// and removing the old contents
					var nodes, makeAndPut = function (val) {
						// create the fragment, but don't hook it up
						// we need to insert it into the document first
						var frag = can.view.frag(val, parentNode),
							// keep a reference to each node
							newNodes = can.makeArray(frag.childNodes),
							last = nodes ? nodes[nodes.length - 1] : span;

						// Insert it in the `document` or `documentFragment`
						if (last.nextSibling) {
							last.parentNode.insertBefore(frag, last.nextSibling);
						} else {
							last.parentNode.appendChild(frag);
						}
						// nodes hasn't been set yet
						if (!nodes) {
							can.remove(can.$(span));
							nodes = newNodes;
							// set the teardown nodeList
							nodeList = nodes;
							can.view.registerNode(nodes);
						} else {
							can.remove(can.$(nodes));
							can.view.replace(nodes, newNodes);
						}
					};
					// nodes are the nodes that any updates will replace
					// at this point, these nodes could be part of a documentFragment
					makeAndPut(binding.value, [span]);

					setupTeardownOnDestroy(parentNode);
					//children have to be properly nested HTML for buildFragment to work properly
				}) + ">" + tagChildren(tag) + "</" + tag + ">";
				// In a tag, but not in an attribute
			} else if (status === 1) {
				// remember the old attr name
				var attrName = binding.value.replace(/['"]/g, '').split('=')[0];
				pendingHookups.push(function (el) {
					update = function (newVal) {
						var parts = (newVal || "").replace(/['"]/g, '').split('='),
							newAttrName = parts[0];

						// Remove if we have a change and used to have an `attrName`.
						if ((newAttrName != attrName) && attrName) {
							removeAttr(el, attrName);
						}
						// Set if we have a new `attrName`.
						if (newAttrName) {
							setAttr(el, newAttrName, parts[1]);
							attrName = newAttrName;
						}
					};
					setupTeardownOnDestroy(el);
				});

				return binding.value;
			} else { // In an attribute...
				var attributeName = status === 0 ? contentProp : status;
				// if the magic tag is inside the element, like `<option><% TAG %></option>`,
				// we add this hookup to the last element (ex: `option`'s) hookups.
				// Otherwise, the magic tag is in an attribute, just add to the current element's
				// hookups.
				(status === 0 ? lastHookups : pendingHookups).push(function (el) {
					// update will call this attribute's render method
					// and set the attribute accordingly
					update = function () {
						setAttr(el, attributeName, hook.render(), contentProp);
					};

					var wrapped = can.$(el),
						hooks;

					// Get the list of hookups or create one for this element.
					// Hooks is a map of attribute names to hookup `data`s.
					// Each hookup data has:
					// `render` - A `function` to render the value of the attribute.
					// `funcs` - A list of hookup `function`s on that attribute.
					// `batchNum` - The last event `batchNum`, used for performance.
					hooks = can.data(wrapped, 'hooks');
					if (!hooks) {
						can.data(wrapped, 'hooks', hooks = {});
					}

					// Get the attribute value.
					var attr = getAttr(el, attributeName, contentProp),
						// Split the attribute value by the template.
						// Only split out the first __!!__ so if we have multiple hookups in the same attribute, 
						// they will be put in the right spot on first render
						parts = attr.split(attributePlaceholder),
						goodParts = [],
						hook;
					goodParts.push(parts.shift(), parts.join(attributePlaceholder));

					// If we already had a hookup for this attribute...
					if (hooks[attributeName]) {
						// Just add to that attribute's list of `function`s.
						hooks[attributeName].bindings.push(binding);
					} else {
						// Create the hookup data.
						hooks[attributeName] = {
							render: function () {
								var i = 0,
									newAttr = attr.replace(attributeReplace, function () {
										return contentText(hook.bindings[i++].value);
									});
								return newAttr;
							},
							bindings: [binding],
							batchNum: undefined
						};
					}

					// Save the hook for slightly faster performance.
					hook = hooks[attributeName];

					// Insert the value in parts.
					goodParts.splice(1, 0, binding.value);

					// Set the attribute.
					setAttr(el, attributeName, goodParts.join(""), contentProp);

					// Bind on change.
					//liveBind(observed, el, binder,oldObserved);
					setupTeardownOnDestroy(el);
				});
				return attributePlaceholder;
			}
		},

		replace: function (oldNodeList, newNodes) {
			// for each node in the node list
			oldNodeList = can.makeArray(oldNodeList);

			can.each(oldNodeList, function (node) {
				// for each nodeList the node is in
				can.each(can.makeArray(nodeMap[id(node)]), function (nodeListId) {
					var nodeList = nodeListMap[nodeListId],
						startIndex = can.inArray(node, nodeList),
						endIndex = can.inArray(oldNodeList[oldNodeList.length - 1], nodeList);

					// remove this nodeListId from each node
					if (startIndex >= 0 && endIndex >= 0) {
						for (var i = startIndex; i <= endIndex; i++) {
							var n = nodeList[i];
							removeNodeListId(n, nodeListId);
						}

						// swap in new nodes into the nodeLIst
						nodeList.splice.apply(nodeList, [startIndex, endIndex - startIndex + 1].concat(newNodes));

						// tell these new nodes they belong to the nodeList
						can.each(newNodes, function (node) {
							addNodeListId(node, nodeListId);
						});
					} else {
						can.view.unregisterNode(nodeList);
					}
				});
			});
		},

		canExpando: canExpando,
		// Node mappings
		textNodeMap: textNodeMap,
		nodeMap: nodeMap,
		nodeListMap: nodeListMap
	});

	// ## can/view/mustache/mustache.js

	// # mustache.js
	// `can.Mustache`: The Mustache templating engine.
	// See the [Transformation](#section-29) section within *Scanning Helpers* for a detailed explanation 
	// of the runtime render code design. The majority of the Mustache engine implementation 
	// occurs within the *Transformation* scanning helper.
	// ## Initialization
	// Define the view extension.
	can.view.ext = ".mustache";

	// ### Setup internal helper variables and functions.
	// An alias for the context variable used for tracking a stack of contexts.
	// This is also used for passing to helper functions to maintain proper context.
	var CONTEXT = '___c0nt3xt',
		// An alias for the variable used for the hash object that can be passed
		// to helpers via `options.hash`.
		HASH = '___h4sh',
		// An alias for the function that adds a new context to the context stack.
		STACK = '___st4ck',
		// An alias for the most used context stacking call.
		CONTEXT_STACK = STACK + '(' + CONTEXT + ',this)',


		isObserve = function (obj) {
			return can.isFunction(obj.attr) && obj.constructor && !! obj.constructor.canMakeObserve;
		},


		isArrayLike = function (obj) {
			return obj && obj.splice && typeof obj.length == 'number';
		},

		// ## Mustache
		Mustache = function (options) {
			// Support calling Mustache without the constructor.
			// This returns a function that renders the template.
			if (this.constructor != Mustache) {
				var mustache = new Mustache(options);
				return function (data) {
					return mustache.render(data);
				};
			}

			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if (typeof options == "function") {
				this.template = {
					fn: options
				};
				return;
			}

			// Set options on self.
			can.extend(this, options);
			this.template = this.scanner.scan(this.text, this.name);
		};


	// Put Mustache on the `can` object.
	can.Mustache = window.Mustache = Mustache;


	Mustache.prototype.

	render = function (object, extraHelpers) {
		object = object || {};
		return this.template.fn.call(object, object, {
			_data: object
		});
	};

	can.extend(Mustache.prototype, {
		// Share a singleton scanner for parsing templates.
		scanner: new can.view.Scanner({
			// A hash of strings for the scanner to inject at certain points.
			text: {
				// This is the logic to inject at the beginning of a rendered template. 
				// This includes initializing the `context` stack.
				start: 'var ' + CONTEXT + ' = []; ' + CONTEXT + '.' + STACK + ' = true;' + 'var ' + STACK + ' = function(context, self) {' + 'var s;' + 'if (arguments.length == 1 && context) {' + 's = !context.' + STACK + ' ? [context] : context;' + '} else {' + 's = context && context.' + STACK + ' ? context.concat([self]) : ' + STACK + '(context).concat([self]);' + '}' + 'return (s.' + STACK + ' = true) && s;' + '};'
			},

			// An ordered token registry for the scanner.
			// This needs to be ordered by priority to prevent token parsing errors.
			// Each token follows the following structure:
			//		[
			//			// Which key in the token map to match.
			//			"tokenMapName",
			//			// A simple token to match, like "{{".
			//			"token",
			//			// Optional. A complex (regexp) token to match that 
			//			// overrides the simple token.
			//			"[\\s\\t]*{{",
			//			// Optional. A function that executes advanced 
			//			// manipulation of the matched content. This is 
			//			// rarely used.
			//			function(content){   
			//				return content;
			//			}
			//		]
			tokens: [
			// Return unescaped
			["returnLeft", "{{{", "{{[{&]"],
			// Full line comments
			["commentFull", "{{!}}", "^[\\s\\t]*{{!.+?}}\\n"],
			// Inline comments
			["commentLeft", "{{!", "(\\n[\\s\\t]*{{!|{{!)"],
			// Full line escapes
			// This is used for detecting lines with only whitespace and an escaped tag
			["escapeFull", "{{}}", "(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)", function (content) {
				return {
					before: /^\n.+?\n$/.test(content) ? '\n' : '',
					content: content.match(/\{\{(.+?)\}\}/)[1] || ''
				};
			}],
			// Return escaped
			["escapeLeft", "{{"],
			// Close return unescaped
			["returnRight", "}}}"],
			// Close tag
			["right", "}}"]],

			// ## Scanning Helpers
			// This is an array of helpers that transform content that is within escaped tags like `{{token}}`. These helpers are solely for the scanning phase; they are unrelated to Mustache/Handlebars helpers which execute at render time. Each helper has a definition like the following:
			//		{
			//			// The content pattern to match in order to execute.
			//			// Only the first matching helper is executed.
			//			name: /pattern to match/,
			//			// The function to transform the content with.
			//			// @param {String} content   The content to transform.
			//			// @param {Object} cmd       Scanner helper data.
			//			//                           {
			//			//                             insert: "insert command",
			//			//                             tagName: "div",
			//			//                             status: 0
			//			//                           }
			//			fn: function(content, cmd) {
			//				return 'for text injection' || 
			//					{ raw: 'to bypass text injection' };
			//			}
			//		}
			helpers: [
			// ### Partials
			// Partials begin with a greater than sign, like {{> box}}.
			// Partials are rendered at runtime (as opposed to compile time), 
			// so recursive partials are possible. Just avoid infinite loops.
			// For example, this template and partial:
			// 		base.mustache:
			// 			<h2>Names</h2>
			// 			{{#names}}
			// 				{{> user}}
			// 			{{/names}}
			// 		user.mustache:
			// 			<strong>{{name}}</strong>
			{
				name: /^>[\s|\w]\w*/,
				fn: function (content, cmd) {
					// Get the template name and call back into the render method,
					// passing the name and the current context.
					var templateName = can.trim(content.replace(/^>\s?/, ''));
					return "can.view.render('" + templateName + "', " + CONTEXT_STACK + ".pop())";
				}
			},

			// ### Data Hookup
			// This will attach the data property of `this` to the element
			// its found on using the first argument as the data attribute
			// key.
			// For example:
			//		<li id="nameli" {{ data 'name' }}></li>
			// then later you can access it like:
			//		can.$('#nameli').data('name');
			{
				name: /^\s?data\s/,
				fn: function (content, cmd) {
					var attr = content.replace(/(^\s?data\s)|(["'])/g, '');

					// return a function which calls `can.data` on the element
					// with the attribute name with the current context.
					return "can.proxy(function(__){can.data(can.$(__),'" + attr + "', this.pop()); }, " + CONTEXT_STACK + ")";
				}
			},

			// ### Transformation (default)
			// This transforms all content to its interpolated equivalent,
			// including calls to the corresponding helpers as applicable. 
			// This outputs the render code for almost all cases.
			// #### Definitions
			// * `context` - This is the object that the current rendering context operates within. 
			//		Each nested template adds a new `context` to the context stack.
			// * `stack` - Mustache supports nested sections, 
			//		each of which add their own context to a stack of contexts.
			//		Whenever a token gets interpolated, it will check for a match against the 
			//		last context in the stack, then iterate through the rest of the stack checking for matches.
			//		The first match is the one that gets returned.
			// * `Mustache.txt` - This serializes a collection of logic, optionally contained within a section.
			//		If this is a simple interpolation, only the interpolation lookup will be passed.
			//		If this is a section, then an `options` object populated by the truthy (`options.fn`) and 
			//		falsey (`options.inverse`) encapsulated functions will also be passed. This section handling 
			//		exists to support the runtime context nesting that Mustache supports.
			// * `Mustache.get` - This resolves an interpolation reference given a stack of contexts.
			// * `options` - An object containing methods for executing the inner contents of sections or helpers.  
			//		`options.fn` - Contains the inner template logic for a truthy section.  
			//		`options.inverse` - Contains the inner template logic for a falsey section.  
			//		`options.hash` - Contains the merged hash object argument for custom helpers.
			// #### Design
			// This covers the design of the render code that the transformation helper generates.
			// ##### Pseudocode
			// A detailed explanation is provided in the following sections, but here is some brief pseudocode
			// that gives a high level overview of what the generated render code does (with a template similar to  
			// `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`).
			// *Initialize the render code.*
			// 		view = []
			// 		context = []
			// 		stack = fn { context.concat([this]) }
			// *Render the root section.*
			// 		view.push( "string" )
			// 		view.push( can.view.txt(
			// *Render the nested section with `can.Mustache.txt`.*
			// 			txt( 
			// *Add the current context to the stack.*
			// 				stack(), 
			// *Flag this for truthy section mode.*
			// 				"#",
			// *Interpolate and check the `a` variable for truthyness using the stack with `can.Mustache.get`.*
			// 				get( "a", stack() ),
			// *Include the nested section's inner logic.
			// The stack argument is usually the parent section's copy of the stack, 
			// but it can be an override context that was passed by a custom helper.
			// Sections can nest `0..n` times -- **NESTCEPTION**.*
			// 				{ fn: fn(stack) {
			// *Render the nested section (everything between the `{{#a}}` and `{{/a}}` tokens).*
			// 					view = []
			// 					view.push( "string" )
			// 					view.push(
			// *Add the current context to the stack.*
			// 						stack(),
			// *Flag this as interpolation-only mode.*
			// 						null,
			// *Interpolate the `b.c.d.e.name` variable using the stack.*
			// 						get( "b.c.d.e.name", stack() ),
			// 					)
			// 					view.push( "string" )
			// *Return the result for the nested section.*
			// 					return view.join()
			// 				}}
			// 			)
			// 		))
			// 		view.push( "string" )
			// *Return the result for the root section, which includes all nested sections.*
			// 		return view.join()
			// ##### Initialization
			// Each rendered template is started with the following initialization code:
			// 		var ___v1ew = [];
			// 		var ___c0nt3xt = [];
			// 		___c0nt3xt.___st4ck = true;
			// 		var ___st4ck = function(context, self) {
			// 			var s;
			// 			if (arguments.length == 1 && context) {
			// 				s = !context.___st4ck ? [context] : context;
			// 			} else {
			// 				s = context && context.___st4ck 
			//					? context.concat([self]) 
			//					: ___st4ck(context).concat([self]);
			// 			}
			// 			return (s.___st4ck = true) && s;
			// 		};
			// The `___v1ew` is the the array used to serialize the view.
			// The `___c0nt3xt` is a stacking array of contexts that slices and expands with each nested section.
			// The `___st4ck` function is used to more easily update the context stack in certain situations.
			// Usually, the stack function simply adds a new context (`self`/`this`) to a context stack. 
			// However, custom helpers will occasionally pass override contexts that need their own context stack.
			// ##### Sections
			// Each section, `{{#section}} content {{/section}}`, within a Mustache template generates a section 
			// context in the resulting render code. The template itself is treated like a root section, with the 
			// same execution logic as any others. Each section can have `0..n` nested sections within it.
			// Here's an example of a template without any descendent sections.  
			// Given the template: `"{{a.b.c.d.e.name}}" == "Phil"`  
			// Would output the following render code:
			//		___v1ew.push("\"");
			//		___v1ew.push(can.view.txt(1, '', 0, this, function() {
			// 			return can.Mustache.txt(___st4ck(___c0nt3xt, this), null, 
			//				can.Mustache.get("a.b.c.d.e.name", 
			//					___st4ck(___c0nt3xt, this))
			//			);
			//		}));
			//		___v1ew.push("\" == \"Phil\"");
			// The simple strings will get appended to the view. Any interpolated references (like `{{a.b.c.d.e.name}}`) 
			// will be pushed onto the view via `can.view.txt` in order to support live binding.
			// The function passed to `can.view.txt` will call `can.Mustache.txt`, which serializes the object data by doing 
			// a context lookup with `can.Mustache.get`.
			// `can.Mustache.txt`'s first argument is a copy of the context stack with the local context `this` added to it.
			// This stack will grow larger as sections nest.
			// The second argument is for the section type. This will be `"#"` for truthy sections, `"^"` for falsey, 
			// or `null` if it is an interpolation instead of a section.
			// The third argument is the interpolated value retrieved with `can.Mustache.get`, which will perform the 
			// context lookup and return the approriate string or object.
			// Any additional arguments, if they exist, are used for passing arguments to custom helpers.
			// For nested sections, the last argument is an `options` object that contains the nested section's logic.
			// Here's an example of a template with a single nested section.  
			// Given the template: `"{{#a}}{{b.c.d.e.name}}{{/a}}" == "Phil"`  
			// Would output the following render code:
			//		___v1ew.push("\"");
			// 		___v1ew.push(can.view.txt(0, '', 0, this, function() {
			// 			return can.Mustache.txt(___st4ck(___c0nt3xt, this), "#", 
			//				can.Mustache.get("a", ___st4ck(___c0nt3xt, this)), 
			//					[{
			// 					_: function() {
			// 						return ___v1ew.join("");
			// 					}
			// 				}, {
			// 					fn: function(___c0nt3xt) {
			// 						var ___v1ew = [];
			// 						___v1ew.push(can.view.txt(1, '', 0, this, 
			//								function() {
			//  								return can.Mustache.txt(
			// 									___st4ck(___c0nt3xt, this), 
			// 									null, 
			// 									can.Mustache.get("b.c.d.e.name", 
			// 										___st4ck(___c0nt3xt, this))
			// 								);
			// 							}
			// 						));
			// 						return ___v1ew.join("");
			// 					}
			// 				}]
			//			)
			// 		}));
			//		___v1ew.push("\" == \"Phil\"");
			// This is specified as a truthy section via the `"#"` argument. The last argument includes an array of helper methods used with `options`.
			// These act similarly to custom helpers: `options.fn` will be called for truthy sections, `options.inverse` will be called for falsey sections.
			// The `options._` function only exists as a dummy function to make generating the section nesting easier (a section may have a `fn`, `inverse`,
			// or both, but there isn't any way to determine that at compilation time).
			// Within the `fn` function is the section's render context, which in this case will render anything between the `{{#a}}` and `{{/a}}` tokens.
			// This function has `___c0nt3xt` as an argument because custom helpers can pass their own override contexts. For any case where custom helpers
			// aren't used, `___c0nt3xt` will be equivalent to the `___st4ck(___c0nt3xt, this)` stack created by its parent section. The `inverse` function
			// works similarly, except that it is added when `{{^a}}` and `{{else}}` are used. `var ___v1ew = []` is specified in `fn` and `inverse` to 
			// ensure that live binding in nested sections works properly.
			// All of these nested sections will combine to return a compiled string that functions similar to EJS in its uses of `can.view.txt`.
			// #### Implementation
			{
				name: /^.*$/,
				fn: function (content, cmd) {
					var mode = false,
						result = [];

					// Trim the content so we don't have any trailing whitespace.
					content = can.trim(content);

					// Determine what the active mode is.
					// * `#` - Truthy section
					// * `^` - Falsey section
					// * `/` - Close the prior section
					// * `else` - Inverted section (only exists within a truthy/falsey section)
					if (content.length && (mode = content.match(/^([#^/]|else$)/))) {
						mode = mode[0];
						switch (mode) {
							// Open a new section.
						case '#':
						case '^':
							result.push(cmd.insert + 'can.view.txt(0,\'' + cmd.tagName + '\',' + cmd.status + ',this,function(){ return ');
							break;
							// Close the prior section.
						case '/':
							return {
								raw: 'return ___v1ew.join("");}}])}));'
							};
							break;
						}

						// Trim the mode off of the content.
						content = content.substring(1);
					}

					// `else` helpers are special and should be skipped since they don't 
					// have any logic aside from kicking off an `inverse` function.
					if (mode != 'else') {
						var args = [],
							i = 0,
							hashing = false,
							arg, split, m;

						// Parse the helper arguments.
						// This needs uses this method instead of a split(/\s/) so that 
						// strings with spaces can be correctly parsed.
						(can.trim(content) + ' ').replace(/((([^\s]+?=)?('.*?'|".*?"))|.*?)\s/g, function (whole, part) {
							args.push(part);
						});

						// Start the content render block.
						result.push('can.Mustache.txt(' + CONTEXT_STACK + ',' + (mode ? '"' + mode + '"' : 'null') + ',');

						// Iterate through the helper arguments, if there are any.
						for (; arg = args[i]; i++) {
							i && result.push(',');

							// Check for special helper arguments (string/number/boolean/hashes).
							if (i && (m = arg.match(/^(('.*?'|".*?"|[0-9.]+|true|false)|((.+?)=(('.*?'|".*?"|[0-9.]+|true|false)|(.+))))$/))) {
								// Found a native type like string/number/boolean.
								if (m[2]) {
									result.push(m[0]);
								}
								// Found a hash object.
								else {
									// Open the hash object.
									if (!hashing) {
										hashing = true;
										result.push('{' + HASH + ':{');
									}

									// Add the key/value.
									result.push(m[4], ':', m[6] ? m[6] : 'can.Mustache.get("' + m[5].replace(/"/g, '\\"') + '",' + CONTEXT_STACK + ')');

									// Close the hash if this was the last argument.
									if (i == args.length - 1) {
										result.push('}}');
									}
								}
							}
							// Otherwise output a normal interpolation reference.
							else {
								result.push('can.Mustache.get("' +
								// Include the reference name.
								arg.replace(/"/g, '\\"') + '",' +
								// Then the stack of context.
								CONTEXT_STACK +
								// Flag as a helper method to aid performance, 
								// if it is a known helper (anything with > 0 arguments).
								(i == 0 && args.length > 1 ? ',true' : '') + ')');
							}
						}
					}

					// Create an option object for sections of code.
					mode && mode != 'else' && result.push(',[{_:function(){');
					switch (mode) {
						// Truthy section
					case '#':
						result.push('return ___v1ew.join("");}},{fn:function(' + CONTEXT + '){var ___v1ew = [];');
						break;
						// If/else section
						// Falsey section
					case 'else':
					case '^':
						result.push('return ___v1ew.join("");}},{inverse:function(' + CONTEXT + '){var ___v1ew = [];');
						break;
						// Not a section
					default:
						result.push(');');
						break;
					}

					// Return a raw result if there was a section, otherwise return the default string.
					result = result.join('');
					return mode ? {
						raw: result
					} : result;
				}
			}]
		})
	});

	// Add in default scanner helpers first.
	// We could probably do this differently if we didn't 'break' on every match.
	var helpers = can.view.Scanner.prototype.helpers;
	for (var i = 0; i < helpers.length; i++) {
		Mustache.prototype.scanner.helpers.unshift(helpers[i]);
	};


	Mustache.txt = function (context, mode, name) {
		// Grab the extra arguments to pass to helpers.
		var args = Array.prototype.slice.call(arguments, 3),
			// Create a default `options` object to pass to the helper.
			options = can.extend.apply(can, [{
				fn: function () {},
				inverse: function () {}
			}].concat(mode ? args.pop() : [])),
			// An array of arguments to check for truthyness when evaluating sections.
			validArgs = args.length ? args : [name],
			// Whether the arguments meet the condition of the section.
			valid = true,
			result = [],
			i, helper;

		// Validate the arguments based on the section mode.
		if (mode) {
			for (i = 0; i < validArgs.length; i++) {
				// Array-like objects are falsey if their length = 0.
				if (isArrayLike(validArgs[i])) {
					valid = mode == '#' ? valid && !! validArgs[i].length : mode == '^' ? valid && !validArgs[i].length : valid;
				}
				// Otherwise just check if it is truthy or not.
				else {
					valid = mode == '#' ? valid && !! validArgs[i] : mode == '^' ? valid && !validArgs[i] : valid;
				}
			}
		}

		// Check for a registered helper or a helper-like function.
		if (helper = (Mustache.getHelper(name) || (can.isFunction(name) && {
			fn: name
		}))) {
			// Use the most recent context as `this` for the helper.
			var context = (context[STACK] && context[context.length - 1]) || context,
				// Update the options with a function/inverse (the inner templates of a section).
				opts = {
					fn: can.proxy(options.fn, context),
					inverse: can.proxy(options.inverse, context)
				},
				lastArg = args[args.length - 1];

			// Add the hash to `options` if one exists
			if (lastArg && lastArg[HASH]) {
				opts.hash = args.pop()[HASH];
			}
			args.push(opts);

			// Call the helper.
			return helper.fn.apply(context, args) || '';
		}

		// Otherwise interpolate like normal.
		if (valid) {
			switch (mode) {
				// Truthy section.
			case '#':
				// Iterate over arrays
				if (isArrayLike(name)) {
					for (i = 0; i < name.length; i++) {
						result.push(options.fn.call(name[i] || {}, context) || '');
					}
					return result.join('');
				}
				// Normal case.
				else {
					return options.fn.call(name || {}, context) || '';
				}
				break;
				// Falsey section.
			case '^':
				return options.inverse.call(name || {}, context) || '';
				break;
			default:
				// Add + '' to convert things like numbers to strings.
				// This can cause issues if you are trying to
				// eval on the length but this is the more
				// common case.
				return '' + (name !== undefined ? name : '');
				break;
			}
		}

		return '';
	};


	Mustache.get = function (ref, contexts, isHelper) {
		// Split the reference (like `a.b.c`) into an array of key names.
		var names = ref.split('.'),
			// Assume the local object is the last context in the stack.
			obj = contexts[contexts.length - 1],
			// Assume the parent context is the second to last context in the stack.
			context = contexts[contexts.length - 2],
			lastValue, value, name, i, j;

		// Handle `this` references for list iteration: {{.}} or {{this}}
		if (/^\.|this$/.test(ref)) {
			// If context isn't an object, then it was a value passed by a helper so use it as an override.
			if (!/^object|undefined$/.test(typeof context)) {
				return context || '';
			}
			// Otherwise just return the closest object.
			else {
				while (value = contexts.pop()) {
					if (typeof value !== 'undefined') {
						return value;
					}
				}
				return '';
			}
		}
		// Handle object resolution (like `a.b.c`).
		else if (!isHelper) {
			// Reverse iterate through the contexts (last in, first out).
			for (i = contexts.length - 1; i >= 0; i--) {
				// Check the context for the reference
				value = contexts[i];

				// Make sure the context isn't a failed object before diving into it.
				if (value !== undefined) {
					for (j = 0; j < names.length; j++) {
						// Keep running up the tree while there are matches.
						if (typeof value[names[j]] != 'undefined') {
							lastValue = value;
							value = value[name = names[j]];
						}
						// If it's undefined, still match if the parent is an Observe.
						else if (isObserve(value)) {
							lastValue = value;
							name = names[j];
							break;
						}
						else {
							lastValue = value = undefined;
							break;
						}
					}
				}

				// Found a matched reference.
				if (value !== undefined) {
					// Support functions stored in objects.
					if (can.isFunction(lastValue[name])) {
						return lastValue[name]();
					}
					// Add support for observes
					else if (isObserve(lastValue)) {
						return lastValue.attr(name);
					}
					else {
						// Invoke the length to ensure that Observe.List events fire.
						isObserve(value) && isArrayLike(value) && value.attr('length');
						return value;
					}
				}
			}
		}

		// Support helper-like functions as anonymous helpers
		if (obj !== undefined && can.isFunction(obj[ref])) {
			return obj[ref];
		}
		// Support helpers without arguments, but only if there wasn't a matching data reference.
		else if (value = Mustache.getHelper(ref)) {
			return ref;
		}

		return '';
	};


	// ## Helpers
	// Helpers are functions that can be called from within a template.
	// These helpers differ from the scanner helpers in that they execute
	// at runtime instead of during compilation.
	// Custom helpers can be added via `can.Mustache.registerHelper`,
	// but there are also some built-in helpers included by default.
	// Most of the built-in helpers are little more than aliases to actions 
	// that the base version of Mustache simply implies based on the 
	// passed in object.
	// Built-in helpers:
	// * `data` - `data` is a special helper that is implemented via scanning helpers. 
	//		It hooks up the active element to the active data object: `<div {{data "key"}} />`
	// * `if` - Renders a truthy section: `{{#if var}} render {{/if}}`
	// * `unless` - Renders a falsey section: `{{#unless var}} render {{/unless}}`
	// * `each` - Renders an array: `{{#each array}} render {{this}} {{/each}}`
	// * `with` - Opens a context section: `{{#with var}} render {{/with}}`

	Mustache.registerHelper = function (name, fn) {
		this._helpers.push({
			name: name,
			fn: fn
		});
	};


	Mustache.getHelper = function (name) {
		for (var i = 0, helper; helper = this._helpers[i]; i++) {
			// Find the correct helper
			if (helper.name == name) {
				return helper;
			}
		}
		return null;
	};

	// The built-in Mustache helpers.
	Mustache._helpers = [
	// Implements the `if` built-in helper.
	{
		name: 'if',
		fn: function (expr, options) {
			if ( !! expr) {
				return options.fn(this);
			}
			else {
				return options.inverse(this);
			}
		}
	},

	// Implements the `unless` built-in helper.
	{
		name: 'unless',
		fn: function (expr, options) {
			if (!expr) {
				return options.fn(this);
			}
		}
	},

	// Implements the `each` built-in helper.
	{
		name: 'each',
		fn: function (expr, options) {
			if ( !! expr && expr.length) {
				var result = [];
				for (var i = 0; i < expr.length; i++) {
					result.push(options.fn(expr[i]));
				}
				return result.join('');
			}
		}
	},

	// Implements the `with` built-in helper.
	{
		name: 'with',
		fn: function (expr, options) {
			if ( !! expr) {
				return options.fn(expr);
			}
		}
	}];

	// ## Registration
	// Registers Mustache with can.view.
	can.view.register({
		suffix: "mustache",

		contentType: "x-mustache-template",

		// Returns a `function` that renders the view.
		script: function (id, src) {
			return "can.Mustache(function(_CONTEXT,_VIEW) { " + new Mustache({
				text: src,
				name: id
			}).template.out + " })";
		},

		renderer: function (id, text) {
			return Mustache({
				text: text,
				name: id
			});
		}
	});

	// ## can/view/modifiers/modifiers.js
	//---- ADD jQUERY HELPERS -----
	//converts jquery functions to use views	
	var convert, modify, isTemplate, isHTML, isDOM, getCallback,
	// text and val cannot produce an element, so don't run hookups on them
	noHookup = {
		'val': true,
		'text': true
	};

	convert = function (func_name) {
		// save the old jQuery helper
		var old = $.fn[func_name];

		// replace it with our new helper
		$.fn[func_name] = function () {

			var args = can.makeArray(arguments),
				callbackNum, callback, self = this,
				result;

			// if the first arg is a deferred
			// wait until it finishes, and call
			// modify with the result
			if (can.isDeferred(args[0])) {
				args[0].done(function (res) {
					modify.call(self, [res], old);
				})
				return this;
			}
			//check if a template
			else if (isTemplate(args)) {

				// if we should operate async
				if ((callbackNum = getCallback(args))) {
					callback = args[callbackNum];
					args[callbackNum] = function (result) {
						modify.call(self, [result], old);
						callback.call(self, result);
					};
					can.view.apply(can.view, args);
					return this;
				}
				// call view with args (there might be deferreds)
				result = can.view.apply(can.view, args);

				// if we got a string back
				if (!can.isDeferred(result)) {
					// we are going to call the old method with that string
					args = [result];
				} else {
					// if there is a deferred, wait until it is done before calling modify
					result.done(function (res) {
						modify.call(self, [res], old);
					})
					return this;
				}
			}
			return noHookup[func_name] ? old.apply(this, args) : modify.call(this, args, old);
		};
	};

	// modifies the content of the element
	// but also will run any hookup
	modify = function (args, old) {
		var res, stub, hooks;

		//check if there are new hookups
		for (var hasHookups in can.view.hookups) {
			break;
		}

		//if there are hookups, turn into a frag
		// and insert that
		// by using a frag, the element can be recursively hooked up
		// before insterion
		if (hasHookups && args[0] && isHTML(args[0])) {
			args[0] = can.view.frag(args[0]).childNodes;
		}

		//then insert into DOM
		res = old.apply(this, args);

		return res;
	};

	// returns true or false if the args indicate a template is being used
	// $('#foo').html('/path/to/template.ejs',{data})
	// in general, we want to make sure the first arg is a string
	// and the second arg is data
	isTemplate = function (args) {
		// save the second arg type
		var secArgType = typeof args[1];

		// the first arg is a string
		return typeof args[0] == "string" &&
		// the second arg is an object or function
		(secArgType == 'object' || secArgType == 'function') &&
		// but it is not a dom element
		!isDOM(args[1]);
	};
	// returns true if the arg is a jQuery object or HTMLElement
	isDOM = function (arg) {
		return arg.nodeType || (arg[0] && arg[0].nodeType)
	};
	// returns whether the argument is some sort of HTML data
	isHTML = function (arg) {
		if (isDOM(arg)) {
			// if jQuery object or DOM node we're good
			return true;
		} else if (typeof arg === "string") {
			// if string, do a quick sanity check that we're HTML
			arg = can.trim(arg);
			return arg.substr(0, 1) === "<" && arg.substr(arg.length - 1, 1) === ">" && arg.length >= 3;
		} else {
			// don't know what you are
			return false;
		}
	};

	//returns the callback arg number if there is one (for async view use)
	getCallback = function (args) {
		return typeof args[3] === 'function' ? 3 : typeof args[2] === 'function' && 2;
	};


	$.fn.hookup = function () {
		can.view.frag(this);
		return this;
	};


	can.each([

	"prepend",

	"append",

	"after",

	"before",

	"text",

	"html",

	"replaceWith", "val"], function (func) {
		convert(func);
	});

	// ## can/observe/observe.js
	// ## observe.js  
	// `can.Observe`  
	// _Provides the observable pattern for JavaScript Objects._  
	// Returns `true` if something is an object with properties of its own.
	var canMakeObserve = function (obj) {
		return obj && (can.isArray(obj) || can.isPlainObject(obj) || (obj instanceof can.Observe));
	},

		// Removes all listeners.
		unhookup = function (items, namespace) {
			return can.each(items, function (item) {
				if (item && item.unbind) {
					item.unbind("change" + namespace);
				}
			});
		},
		// Listens to changes on `val` and "bubbles" the event up.  
		// `val` - The object to listen for changes on.  
		// `prop` - The property name is at on.  
		// `parent` - The parent object of prop.
		// `ob` - (optional) The Observe object constructor
		// `list` - (optional) The observable list constructor
		hookupBubble = function (val, prop, parent, Ob, List) {
			Ob = Ob || Observe;
			List = List || Observe.List;

			// If it's an `array` make a list, otherwise a val.
			if (val instanceof Observe) {
				// We have an `observe` already...
				// Make sure it is not listening to this already
				unhookup([val], parent._cid);
			} else if (can.isArray(val)) {
				val = new List(val);
			} else {
				val = new Ob(val);
			}

			// Listen to all changes and `batchTrigger` upwards.
			val.bind("change" + parent._cid, function () {
				// `batchTrigger` the type on this...
				var args = can.makeArray(arguments),
					ev = args.shift();
				args[0] = (prop === "*" ? [parent.indexOf(val), args[0]] : [prop, args[0]]).join(".");

				// track objects dispatched on this observe		
				ev.triggeredNS = ev.triggeredNS || {};

				// if it has already been dispatched exit
				if (ev.triggeredNS[parent._cid]) {
					return;
				}

				ev.triggeredNS[parent._cid] = true;
				// send change event with modified attr to parent	
				can.trigger(parent, ev, args);
				// send modified attr event to parent
				//can.trigger(parent, args[0], args);
			});

			return val;
		},

		// An `id` to track events for a given observe.
		observeId = 0,
		// A helper used to serialize an `Observe` or `Observe.List`.  
		// `observe` - The observable.  
		// `how` - To serialize with `attr` or `serialize`.  
		// `where` - To put properties, in an `{}` or `[]`.
		serialize = function (observe, how, where) {
			// Go through each property.
			observe.each(function (val, name) {
				// If the value is an `object`, and has an `attrs` or `serialize` function.
				where[name] = canMakeObserve(val) && can.isFunction(val[how]) ?
				// Call `attrs` or `serialize` to get the original data back.
				val[how]() :
				// Otherwise return the value.
				val;
			});
			return where;
		},
		$method = function (name) {
			return function () {
				return can[name].apply(this, arguments);
			};
		},
		bind = $method('addEvent'),
		unbind = $method('removeEvent'),
		attrParts = function (attr) {
			return can.isArray(attr) ? attr : ("" + attr).split(".");
		},
		// Which batch of events this is for -- might not want to send multiple
		// messages on the same batch.  This is mostly for event delegation.
		batchNum = 1,
		// how many times has start been called without a stop
		transactions = 0,
		// an array of events within a transaction
		batchEvents = [],
		stopCallbacks = [];

	var cid = 0;
	can.cid = function (object, name) {
		if (object._cid) {
			return object._cid
		} else {
			return object._cid = (name || "") + (++cid)
		}
	}


	var Observe = can.Observe = can.Construct({

		// keep so it can be overwritten
		bind: bind,
		unbind: unbind,
		id: "id",
		canMakeObserve: canMakeObserve,
		// starts collecting events
		// takes a callback for after they are updated
		// how could you hook into after ejs
		startBatch: function (batchStopHandler) {
			transactions++;
			batchStopHandler && stopCallbacks.push(batchStopHandler);
		},

		stopBatch: function (force, callStart) {
			if (force) {
				transactions = 0;
			} else {
				transactions--;
			}

			if (transactions == 0) {
				var items = batchEvents.slice(0),
					callbacks = stopCallbacks.slice(0);
				batchEvents = [];
				stopCallbacks = [];
				batchNum++;
				callStart && this.startBatch();
				can.each(items, function (args) {
					can.trigger.apply(can, args);
				});
				can.each(callbacks, function (cb) {
					cb;
				});
			}
		},

		triggerBatch: function (item, event, args) {
			// Don't send events if initalizing.
			if (!item._init) {
				if (transactions == 0) {
					return can.trigger(item, event, args);
				} else {
					batchEvents.push([
					item,
					{
						type: event,
						batchNum: batchNum
					},
					args]);
				}
			}
		},

		keys: function (observe) {
			var keys = [];
			Observe.__reading && Observe.__reading(observe, '__keys');
			for (var keyName in observe._data) {
				keys.push(keyName);
			}
			return keys;
		}
	},

	{
		setup: function (obj) {
			// `_data` is where we keep the properties.
			this._data = {};

			// The namespace this `object` uses to listen to events.
			can.cid(this, ".observe");
			// Sets all `attrs`.
			this._init = 1;
			this.attr(obj);
			this.bind('change' + this._cid, can.proxy(this._changes, this));
			delete this._init;
		},
		_changes: function (ev, attr, how, newVal, oldVal) {
			Observe.triggerBatch(this, {
				type: attr,
				batchNum: ev.batchNum
			}, [newVal, oldVal]);
		},

		attr: function (attr, val) {
			// This is super obfuscated for space -- basically, we're checking
			// if the type of the attribute is not a `number` or a `string`.
			var type = typeof attr;
			if (type !== "string" && type !== "number") {
				return this._attrs(attr, val)
			} else if (val === undefined) { // If we are getting a value.
				// Let people know we are reading.
				Observe.__reading && Observe.__reading(this, attr)
				return this._get(attr)
			} else {
				// Otherwise we are setting.
				this._set(attr, val);
				return this;
			}
		},

		each: function () {
			Observe.__reading && Observe.__reading(this, '__keys');
			return can.each.apply(undefined, [this.__get()].concat(can.makeArray(arguments)))
		},

		removeAttr: function (attr) {
			// Convert the `attr` into parts (if nested).
			var parts = attrParts(attr),
				// The actual property to remove.
				prop = parts.shift(),
				// The current value.
				current = this._data[prop];

			// If we have more parts, call `removeAttr` on that part.
			if (parts.length) {
				return current.removeAttr(parts)
			} else {
				if (prop in this._data) {
					// Otherwise, `delete`.
					delete this._data[prop];
					// Create the event.
					if (!(prop in this.constructor.prototype)) {
						delete this[prop]
					}
					// Let others know the number of keys have changed
					Observe.triggerBatch(this, "__keys", undefined);
					Observe.triggerBatch(this, "change", [prop, "remove", undefined, current]);
					Observe.triggerBatch(this, prop, [undefined, current]);
				}
				return current;
			}
		},
		// Reads a property from the `object`.
		_get: function (attr) {
			// break up the attr (`"foo.bar"`) into `["foo","bar"]`
			var parts = attrParts(attr),
				// get the value of the first attr name (`"foo"`)
				current = this.__get(parts.shift());
			// if there are other attributes to read
			return parts.length ?
			// and current has a value
			current ?
			// lookup the remaining attrs on current
			current._get(parts) :
			// or if there's no current, return undefined
			undefined :
			// if there are no more parts, return current
			current;
		},
		// Reads a property directly if an `attr` is provided, otherwise
		// returns the "real" data object itself.
		__get: function (attr) {
			return attr ? this._data[attr] : this._data;
		},
		// Sets `attr` prop as value on this object where.
		// `attr` - Is a string of properties or an array  of property values.
		// `value` - The raw value to set.
		_set: function (attr, value) {
			// Convert `attr` to attr parts (if it isn't already).
			var parts = attrParts(attr),
				// The immediate prop we are setting.
				prop = parts.shift(),
				// The current value.
				current = this.__get(prop);

			// If we have an `object` and remaining parts.
			if (canMakeObserve(current) && parts.length) {
				// That `object` should set it (this might need to call attr).
				current._set(parts, value)
			} else if (!parts.length) {
				// We're in "real" set territory.
				if (this.__convert) {
					value = this.__convert(prop, value)
				}
				// If there is no current value, let others know that
				// the the number of keys have changed
				if (!current) {
					Observe.triggerBatch(this, "__keys", undefined);
				}
				this.__set(prop, value, current)
			} else {
				throw "can.Observe: Object does not exist"
			}
		},
		__set: function (prop, value, current) {

			// Otherwise, we are setting it on this `object`.
			// TODO: Check if value is object and transform
			// are we changing the value.
			if (value !== current) {
				// Check if we are adding this for the first time --
				// if we are, we need to create an `add` event.
				var changeType = this.__get().hasOwnProperty(prop) ? "set" : "add";

				// Set the value on data.
				this.___set(prop,

				// If we are getting an object.
				canMakeObserve(value) ?

				// Hook it up to send event.
				hookupBubble(value, prop, this) :
				// Value is normal.
				value);

				// `batchTrigger` the change event.
				Observe.triggerBatch(this, "change", [prop, changeType, value, current]);
				//Observe.triggerBatch(this, prop, [value, current]);
				// If we can stop listening to our old value, do it.
				current && unhookup([current], this._cid);
			}

		},
		// Directly sets a property on this `object`.
		___set: function (prop, val) {
			this._data[prop] = val;
			// Add property directly for easy writing.
			// Check if its on the `prototype` so we don't overwrite methods like `attrs`.
			if (!(prop in this.constructor.prototype)) {
				this[prop] = val
			}
		},

		bind: bind,

		unbind: unbind,

		serialize: function () {
			return serialize(this, 'serialize', {});
		},

		_attrs: function (props, remove) {

			if (props === undefined) {
				return serialize(this, 'attr', {})
			}

			props = can.extend(true, {}, props);
			var prop, self = this,
				newVal;
			Observe.startBatch();
			this.each(function (curVal, prop, toRemove) {
				newVal = props[prop];

				// If we are merging...
				if (newVal === undefined) {
					remove && self.removeAttr(prop);
					return;
				}
				if (self.__convert) {
					newVal = self.__convert(prop, newVal);
				}

				if (curVal !== newVal) {
					if (curVal instanceof can.Observe && newVal instanceof can.Observe) {
						unhookup([curVal], self._cid);
					}

					if (newVal instanceof can.Observe) {
						self._set(prop, newVal)
					}
					else if (canMakeObserve(curVal) && canMakeObserve(newVal)) {
						curVal.attr(newVal, toRemove)
					} else if (curVal != newVal) {
						self._set(prop, newVal)
					}
				}
				delete props[prop];
			})
			// Add remaining props.
			for (var prop in props) {
				newVal = props[prop];
				this._set(prop, newVal)
			}
			Observe.stopBatch()
			return this;
		}
	});
	// Helpers for `observable` lists.
	var splice = [].splice,
		list = Observe(

		{
			setup: function (instances, options) {
				this.length = 0;
				can.cid(this, ".observe")
				this._init = 1;
				this.push.apply(this, can.makeArray(instances || []));
				this.bind('change' + this._cid, can.proxy(this._changes, this));
				can.extend(this, options);
				delete this._init;
			},
			_changes: function (ev, attr, how, newVal, oldVal) {
				// `batchTrigger` direct add and remove events...
				if (!~attr.indexOf('.')) {

					if (how === 'add') {
						Observe.triggerBatch(this, how, [newVal, +attr]);
						Observe.triggerBatch(this, 'length', [this.length]);
					} else if (how === 'remove') {
						Observe.triggerBatch(this, how, [oldVal, +attr]);
						Observe.triggerBatch(this, 'length', [this.length]);
					} else {
						Observe.triggerBatch(this, how, [newVal, +attr])
					}

				}
				Observe.prototype._changes.apply(this, arguments)
			},
			__get: function (attr) {
				return attr ? this[attr] : this;
			},
			___set: function (attr, val) {
				this[attr] = val;
				if (+attr >= this.length) {
					this.length = (+attr + 1)
				}
			},
			// Returns the serialized form of this list.
			serialize: function () {
				return serialize(this, 'serialize', []);
			},

			splice: function (index, howMany) {
				var args = can.makeArray(arguments),
					i;

				for (i = 2; i < args.length; i++) {
					var val = args[i];
					if (canMakeObserve(val)) {
						args[i] = hookupBubble(val, "*", this)
					}
				}
				if (howMany === undefined) {
					howMany = args[1] = this.length - index;
				}
				var removed = splice.apply(this, args);
				if (howMany > 0) {
					Observe.triggerBatch(this, "change", ["" + index, "remove", undefined, removed]);
					unhookup(removed, this._cid);
				}
				if (args.length > 2) {
					Observe.triggerBatch(this, "change", ["" + index, "add", args.slice(2), removed]);
				}
				return removed;
			},

			_attrs: function (items, remove) {
				if (items === undefined) {
					return serialize(this, 'attr', []);
				}

				// Create a copy.
				items = can.makeArray(items);

				Observe.startBatch();
				this._updateAttrs(items, remove);
				Observe.stopBatch()
			},

			_updateAttrs: function (items, remove) {
				var len = Math.min(items.length, this.length);

				for (var prop = 0; prop < len; prop++) {
					var curVal = this[prop],
						newVal = items[prop];

					if (canMakeObserve(curVal) && canMakeObserve(newVal)) {
						curVal.attr(newVal, remove)
					} else if (curVal != newVal) {
						this._set(prop, newVal)
					} else {

					}
				}
				if (items.length > this.length) {
					// Add in the remaining props.
					this.push.apply(this, items.slice(this.length));
				} else if (items.length < this.length && remove) {
					this.splice(items.length)
				}
			}
		}),

		// Converts to an `array` of arguments.
		getArgs = function (args) {
			return args[0] && can.isArray(args[0]) ? args[0] : can.makeArray(args);
		};
	// Create `push`, `pop`, `shift`, and `unshift`
	can.each({

		push: "length",

		unshift: 0
	},
	// Adds a method
	// `name` - The method name.
	// `where` - Where items in the `array` should be added.


	function (where, name) {
		list.prototype[name] = function () {
			// Get the items being added.
			var args = can.makeArray(arguments),
				// Where we are going to add items.
				len = where ? this.length : 0;

			// Go through and convert anything to an `observe` that needs to be converted.
			for (var i = 0; i < args.length; i++) {
				var val = args[i];
				if (canMakeObserve(val)) {
					args[i] = hookupBubble(val, "*", this, this.constructor.Observe, this.constructor);
				}
			}

			// Call the original method.
			var res = [][name].apply(this, args);

			if (!this.comparator || !args.length) {
				Observe.triggerBatch(this, "change", ["" + len, "add", args, undefined])
			}

			return res;
		}
	});

	can.each({

		pop: "length",

		shift: 0
	},
	// Creates a `remove` type method


	function (where, name) {
		list.prototype[name] = function () {

			var args = getArgs(arguments),
				len = where && this.length ? this.length - 1 : 0;

			var res = [][name].apply(this, args)

			// Create a change where the args are
			// `*` - Change on potentially multiple properties.
			// `remove` - Items removed.
			// `undefined` - The new values (there are none).
			// `res` - The old, removed values (should these be unbound).
			// `len` - Where these items were removed.
			Observe.triggerBatch(this, "change", ["" + len, "remove", undefined, [res]])

			if (res && res.unbind) {
				res.unbind("change" + this._cid)
			}
			return res;
		}
	});

	can.extend(list.prototype, {

		indexOf: function (item) {
			this.attr('length')
			return can.inArray(item, this)
		},


		join: [].join,


		slice: function () {
			var temp = Array.prototype.slice.apply(this, arguments);
			return new this.constructor(temp);
		},


		concat: function () {
			var args = [];
			can.each(can.makeArray(arguments), function (arg, i) {
				args[i] = arg instanceof can.Observe.List ? arg.serialize() : arg;
			});
			return new this.constructor(Array.prototype.concat.apply(this.serialize(), args));
		},


		forEach: function (cb, thisarg) {
			can.each(this, cb, thisarg || this);
		}
	});

	Observe.List = list;
	Observe.setup = function () {
		can.Construct.setup.apply(this, arguments);
		// I would prefer not to do it this way. It should
		// be using the attributes plugin to do this type of conversion.
		this.List = Observe.List({
			Observe: this
		}, {});
	}
	// ## can/model/model.js

	// ## model.js  
	// `can.Model`  
	// _A `can.Observe` that connects to a RESTful interface._
	// Generic deferred piping function
	var pipe = function (def, model, func) {
		var d = new can.Deferred();
		def.then(function () {
			var args = can.makeArray(arguments);
			args[0] = model[func](args[0]);
			d.resolveWith(d, args);
		}, function () {
			d.rejectWith(this, arguments);
		});

		if (typeof def.abort === 'function') {
			d.abort = function () {
				return def.abort();
			}
		}

		return d;
	},
		modelNum = 0,
		ignoreHookup = /change.observe\d+/,
		getId = function (inst) {
			// Instead of using attr, use __get for performance.
			// Need to set reading
			can.Observe.__reading && can.Observe.__reading(inst, inst.constructor.id)
			return inst.__get(inst.constructor.id);
		},
		// Ajax `options` generator function
		ajax = function (ajaxOb, data, type, dataType, success, error) {

			var params = {};

			// If we get a string, handle it.
			if (typeof ajaxOb == "string") {
				// If there's a space, it's probably the type.
				var parts = ajaxOb.split(/\s/);
				params.url = parts.pop();
				if (parts.length) {
					params.type = parts.pop();
				}
			} else {
				can.extend(params, ajaxOb);
			}

			// If we are a non-array object, copy to a new attrs.
			params.data = typeof data == "object" && !can.isArray(data) ? can.extend(params.data || {}, data) : data;

			// Get the url with any templated values filled out.
			params.url = can.sub(params.url, params.data, true);

			return can.ajax(can.extend({
				type: type || "post",
				dataType: dataType || "json",
				success: success,
				error: error
			}, params));
		},
		makeRequest = function (self, type, success, error, method) {
			var deferred, args = [self.serialize()],
				// The model.
				model = self.constructor,
				jqXHR;

			// `destroy` does not need data.
			if (type == 'destroy') {
				args.shift();
			}
			// `update` and `destroy` need the `id`.
			if (type !== 'create') {
				args.unshift(getId(self));
			}


			jqXHR = model[type].apply(model, args);

			deferred = jqXHR.pipe(function (data) {
				self[method || type + "d"](data, jqXHR);
				return self;
			});

			// Hook up `abort`
			if (jqXHR.abort) {
				deferred.abort = function () {
					jqXHR.abort();
				};
			}

			deferred.then(success, error);
			return deferred;
		},

		// This object describes how to make an ajax request for each ajax method.  
		// The available properties are:
		//		`url` - The default url to use as indicated as a property on the model.
		//		`type` - The default http request type
		//		`data` - A method that takes the `arguments` and returns `data` used for ajax.
		ajaxMethods = {

			create: {
				url: "_shortName",
				type: "post"
			},

			update: {
				data: function (id, attrs) {
					attrs = attrs || {};
					var identity = this.id;
					if (attrs[identity] && attrs[identity] !== id) {
						attrs["new" + can.capitalize(id)] = attrs[identity];
						delete attrs[identity];
					}
					attrs[identity] = id;
					return attrs;
				},
				type: "put"
			},

			destroy: {
				type: "delete",
				data: function (id) {
					var args = {};
					args.id = args[this.id] = id;
					return args;
				}
			},

			findAll: {
				url: "_shortName"
			},

			findOne: {}
		},
		// Makes an ajax request `function` from a string.
		//		`ajaxMethod` - The `ajaxMethod` object defined above.
		//		`str` - The string the user provided. Ex: `findAll: "/recipes.json"`.
		ajaxMaker = function (ajaxMethod, str) {
			// Return a `function` that serves as the ajax method.
			return function (data) {
				// If the ajax method has it's own way of getting `data`, use that.
				data = ajaxMethod.data ? ajaxMethod.data.apply(this, arguments) :
				// Otherwise use the data passed in.
				data;
				// Return the ajax method with `data` and the `type` provided.
				return ajax(str || this[ajaxMethod.url || "_url"], data, ajaxMethod.type || "get")
			}
		}



		can.Model = can.Observe({
			fullName: "can.Model",
			setup: function (base) {
				// create store here if someone wants to use model without inheriting from it
				this.store = {};
				can.Observe.setup.apply(this, arguments);
				// Set default list as model list
				if (!can.Model) {
					return;
				}
				this.List = ML({
					Observe: this
				}, {});
				var self = this,
					clean = can.proxy(this._clean, self);


				// go through ajax methods and set them up
				can.each(ajaxMethods, function (method, name) {
					// if an ajax method is not a function, it's either
					// a string url like findAll: "/recipes" or an
					// ajax options object like {url: "/recipes"}
					if (!can.isFunction(self[name])) {
						// use ajaxMaker to convert that into a function
						// that returns a deferred with the data
						self[name] = ajaxMaker(method, self[name]);
					}
					// check if there's a make function like makeFindAll
					// these take deferred function and can do special
					// behavior with it (like look up data in a store)
					if (self["make" + can.capitalize(name)]) {
						// pass the deferred method to the make method to get back
						// the "findAll" method.
						var newMethod = self["make" + can.capitalize(name)](self[name]);
						can.Construct._overwrite(self, base, name, function () {
							// increment the numer of requests
							this._reqs++;
							var def = newMethod.apply(this, arguments);
							var then = def.then(clean, clean);
							then.abort = def.abort;

							// attach abort to our then and return it
							return then;
						})
					}
				});

				if (self.fullName == "can.Model" || !self.fullName) {
					self.fullName = "Model" + (++modelNum);
				}
				// Add ajax converters.
				this._reqs = 0;
				this._url = this._shortName + "/{" + this.id + "}"
			},
			_ajax: ajaxMaker,
			_clean: function () {
				this._reqs--;
				if (!this._reqs) {
					for (var id in this.store) {
						if (!this.store[id]._bindings) {
							delete this.store[id];
						}
					}
				}
				return arguments[0];
			},

			models: function (instancesRawData, oldList) {

				if (!instancesRawData) {
					return;
				}

				if (instancesRawData instanceof this.List) {
					return instancesRawData;
				}

				// Get the list type.
				var self = this,
					tmp = [],
					res = oldList instanceof can.Observe.List ? oldList : new(self.List || ML),
					// Did we get an `array`?
					arr = can.isArray(instancesRawData),

					// Did we get a model list?
					ml = (instancesRawData instanceof ML),

					// Get the raw `array` of objects.
					raw = arr ?

					// If an `array`, return the `array`.
					instancesRawData :

					// Otherwise if a model list.
					(ml ?

					// Get the raw objects from the list.
					instancesRawData.serialize() :

					// Get the object's data.
					instancesRawData.data),
					i = 0;



				if (res.length > 0) {
					res.splice(0);
				}

				can.each(raw, function (rawPart) {
					tmp.push(self.model(rawPart));
				});

				// We only want one change event so push everything at once
				res.push.apply(res, tmp);

				if (!arr) { // Push other stuff onto `array`.
					can.each(instancesRawData, function (val, prop) {
						if (prop !== 'data') {
							res.attr(prop, val);
						}
					})
				}
				return res;
			},

			model: function (attributes) {
				if (!attributes) {
					return;
				}
				if (attributes instanceof this) {
					attributes = attributes.serialize();
				}
				var id = attributes[this.id],
					model = id && this.store[id] ? this.store[id].attr(attributes) : new this(attributes);
				if (this._reqs) {
					this.store[attributes[this.id]] = model;
				}
				return model;
			}
		},

		{

			isNew: function () {
				var id = getId(this);
				return !(id || id === 0); // If `null` or `undefined`
			},

			save: function (success, error) {
				return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
			},

			destroy: function (success, error) {
				return makeRequest(this, 'destroy', success, error, 'destroyed');
			},

			bind: function (eventName) {
				if (!ignoreHookup.test(eventName)) {
					if (!this._bindings) {
						this.constructor.store[getId(this)] = this;
						this._bindings = 0;
					}
					this._bindings++;
				}

				return can.Observe.prototype.bind.apply(this, arguments);
			},

			unbind: function (eventName) {
				if (!ignoreHookup.test(eventName)) {
					this._bindings--;
					if (!this._bindings) {
						delete this.constructor.store[getId(this)];
					}
				}
				return can.Observe.prototype.unbind.apply(this, arguments);
			},
			// Change `id`.
			___set: function (prop, val) {
				can.Observe.prototype.___set.call(this, prop, val)
				// If we add an `id`, move it to the store.
				if (prop === this.constructor.id && this._bindings) {
					this.constructor.store[getId(this)] = this;
				}
			}
		});

	can.each({
		makeFindAll: "models",
		makeFindOne: "model"
	}, function (method, name) {
		can.Model[name] = function (oldFind) {
			return function (params, success, error) {
				var def = pipe(oldFind.call(this, params), this, method);
				def.then(success, error);
				// return the original promise
				return def;
			};
		};
	});

	can.each([

	"created",

	"updated",

	"destroyed"], function (funcName) {
		can.Model.prototype[funcName] = function (attrs) {
			var stub, constructor = this.constructor;

			// Update attributes if attributes have been passed
			stub = attrs && typeof attrs == 'object' && this.attr(attrs.attr ? attrs.attr() : attrs);

			// Call event on the instance
			can.trigger(this, funcName);
			can.trigger(this, "change", funcName)


			// Call event on the instance's Class
			can.trigger(constructor, funcName, this);
		};
	});

	// Model lists are just like `Observe.List` except that when their items are 
	// destroyed, it automatically gets removed from the list.
	var ML = can.Model.List = can.Observe.List({
		setup: function () {
			can.Observe.List.prototype.setup.apply(this, arguments);
			// Send destroy events.
			var self = this;
			this.bind('change', function (ev, how) {
				if (/\w+\.destroyed/.test(how)) {
					var index = self.indexOf(ev.target);
					if (index != -1) {
						self.splice(index, 1);
					}
				}
			})
		}
	})

	// ## can/view/ejs/ejs.js
	// ## ejs.js
	// `can.EJS`  
	// _Embedded JavaScript Templates._
	// Helper methods.
	var extend = can.extend,
		EJS = function (options) {
			// Supports calling EJS without the constructor
			// This returns a function that renders the template.
			if (this.constructor != EJS) {
				var ejs = new EJS(options);
				return function (data, helpers) {
					return ejs.render(data, helpers);
				};
			}
			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if (typeof options == "function") {
				this.template = {
					fn: options
				};
				return;
			}
			// Set options on self.
			extend(this, options);
			this.template = this.scanner.scan(this.text, this.name);
		};


	can.EJS = EJS;


	EJS.prototype.

	render = function (object, extraHelpers) {
		object = object || {};
		return this.template.fn.call(object, object, new EJS.Helpers(object, extraHelpers || {}));
	};

	extend(EJS.prototype, {

		scanner: new can.view.Scanner({

			tokens: [
				["templateLeft", "<%%"], // Template
				["templateRight", "%>"], // Right Template
				["returnLeft", "<%=="], // Return Unescaped
				["escapeLeft", "<%="], // Return Escaped
				["commentLeft", "<%#"], // Comment
				["left", "<%"], // Run --- this is hack for now
				["right", "%>"], // Right -> All have same FOR Mustache ...
				["returnRight", "%>"]
			]
		})
	});


	EJS.Helpers = function (data, extras) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	};

	EJS.Helpers.prototype = {

		// TODO Deprecated!!
		list: function (list, cb) {
			can.each(list, function (item, i) {
				cb(item, i, list)
			})
		}
	};

	// Options for `steal`'s build.
	can.view.register({
		suffix: "ejs",
		// returns a `function` that renders the view.
		script: function (id, src) {
			return "can.EJS(function(_CONTEXT,_VIEW) { " + new EJS({
				text: src,
				name: id
			}).template.out + " })";
		},
		renderer: function (id, text) {
			return EJS({
				text: text,
				name: id
			});
		}
	});

	// ## can/observe/attributes/attributes.js
	can.each([can.Observe, can.Model], function (clss) {
		// in some cases model might not be defined quite yet.
		if (clss === undefined) {
			return;
		}

		can.extend(clss, {

			attributes: {},


			convert: {
				"date": function (str) {
					var type = typeof str;
					if (type === "string") {
						return isNaN(Date.parse(str)) ? null : Date.parse(str)
					} else if (type === 'number') {
						return new Date(str)
					} else {
						return str
					}
				},
				"number": function (val) {
					return parseFloat(val);
				},
				"boolean": function (val) {
					return Boolean(val === "false" ? 0 : val);
				},
				"default": function (val, oldVal, error, type) {
					var construct = can.getObject(type),
						context = window,
						realType;
					// if type has a . we need to look it up
					if (type.indexOf(".") >= 0) {
						// get everything before the last .
						realType = type.substring(0, type.lastIndexOf("."));
						// get the object before the last .
						context = can.getObject(realType);
					}
					return typeof construct == "function" ? construct.call(context, val, oldVal) : val;
				}
			},

			serialize: {
				"default": function (val, type) {
					return isObject(val) && val.serialize ? val.serialize() : val;
				},
				"date": function (val) {
					return val && val.getTime()
				}
			}
		});

		// overwrite setup to do this stuff
		var oldSetup = clss.setup;


		clss.setup = function (superClass, stat, proto) {
			var self = this;
			oldSetup.call(self, superClass, stat, proto);

			can.each(["attributes"], function (name) {
				if (!self[name] || superClass[name] === self[name]) {
					self[name] = {};
				}
			});

			can.each(["convert", "serialize"], function (name) {
				if (superClass[name] != self[name]) {
					self[name] = can.extend({}, superClass[name], self[name]);
				}
			});
		};
	});

	var oldSetup = can.Observe.prototype.setup;

	can.Observe.prototype.setup = function (obj) {

		var diff = {};

		oldSetup.call(this, obj);

		can.each(this.constructor.defaults, function (value, key) {
			if (!this.hasOwnProperty(key)) {
				diff[key] = value;
			}
		}, this);

		this._init = 1;
		this.attr(diff);
		delete this._init;
	};

	can.Observe.prototype.__convert = function (prop, value) {
		// check if there is a
		var Class = this.constructor,
			oldVal = this.attr(prop),
			type, converter;

		if (Class.attributes) {
			// the type of the attribute
			type = Class.attributes[prop];
			converter = Class.convert[type] || Class.convert['default'];
		}

		return value === null || !type ?
		// just use the value
		value :
		// otherwise, pass to the converter
		converter.call(Class, value, oldVal, function () {}, type);
	};

	can.Observe.prototype.serialize = function (attrName) {
		var where = {},
			Class = this.constructor,
			attrs = {};

		if (attrName != undefined) {
			attrs[attrName] = this[attrName];
		} else {
			attrs = this.__get();
		}

		can.each(attrs, function (val, name) {
			var type, converter;

			type = Class.attributes ? Class.attributes[name] : 0;
			converter = Class.serialize ? Class.serialize[type] : 0;

			// if the value is an object, and has a attrs or serialize function
			where[name] = val && typeof val.serialize == 'function' ?
			// call attrs or serialize to get the original data back
			val.serialize() :
			// otherwise if we have  a converter
			converter ?
			// use the converter
			converter(val, type) :
			// or return the val
			val
		});

		return attrName != undefined ? where[attrName] : where;
	};
	// ## can/observe/delegate/delegate.js



	// ** - 'this' will be the deepest item changed
	// * - 'this' will be any changes within *, but * will be the 
	//     this returned
	// tells if the parts part of a delegate matches the broken up props of the event
	// gives the prop to use as 'this'
	// - parts - the attribute name of the delegate split in parts ['foo','*']
	// - props - the split props of the event that happened ['foo','bar','0']
	// - returns - the attribute to delegate too ('foo.bar'), or null if not a match 
	var matches = function (parts, props) {
		//check props parts are the same or 
		var len = parts.length,
			i = 0,
			// keeps the matched props we will use
			matchedProps = [],
			prop;

		// if the event matches
		for (i; i < len; i++) {
			prop = props[i]
			// if no more props (but we should be matching them)
			// return null
			if (typeof prop !== 'string') {
				return null;
			} else
			// if we have a "**", match everything
			if (parts[i] == "**") {
				return props.join(".");
			} else
			// a match, but we want to delegate to "*"
			if (parts[i] == "*") {
				// only do this if there is nothing after ...
				matchedProps.push(prop);
			}
			else if (prop === parts[i]) {
				matchedProps.push(prop);
			} else {
				return null;
			}
		}
		return matchedProps.join(".");
	},
		// gets a change event and tries to figure out which
		// delegates to call
		delegate = function (event, prop, how, newVal, oldVal) {
			// pre-split properties to save some regexp time
			var props = prop.split("."),
				delegates = (this._observe_delegates || []).slice(0),
				delegate, attr, matchedAttr, hasMatch, valuesEqual;
			event.attr = prop;
			event.lastAttr = props[props.length - 1];

			// for each delegate
			for (var i = 0; delegate = delegates[i++];) {

				// if there is a batchNum, this means that this
				// event is part of a series of events caused by a single 
				// attrs call.  We don't want to issue the same event
				// multiple times
				// setting the batchNum happens later
				if ((event.batchNum && delegate.batchNum === event.batchNum) || delegate.undelegated) {
					continue;
				}

				// reset match and values tests
				hasMatch = undefined;
				valuesEqual = true;

				// yeah, all this under here has to be redone v
				// for each attr in a delegate
				for (var a = 0; a < delegate.attrs.length; a++) {

					attr = delegate.attrs[a];

					// check if it is a match
					if (matchedAttr = matches(attr.parts, props)) {
						hasMatch = matchedAttr;
					}
					// if it has a value, make sure it's the right value
					// if it's set, we should probably check that it has a 
					// value no matter what
					if (attr.value && valuesEqual) {
						valuesEqual = attr.value === "" + this.attr(attr.attr)
					} else if (valuesEqual && delegate.attrs.length > 1) {
						// if there are multiple attributes, each has to at
						// least have some value
						valuesEqual = this.attr(attr.attr) !== undefined
					}
				}


				// if there is a match and valuesEqual ... call back
				if (hasMatch && valuesEqual) {
					// how to get to the changed property from the delegate
					var from = prop.replace(hasMatch + ".", "");

					// if this event is part of a batch, set it on the delegate
					// to only send one event
					if (event.batchNum) {
						delegate.batchNum = event.batchNum
					}

					// if we listen to change, fire those with the same attrs
					// TODO: the attrs should probably be using from
					if (delegate.event === 'change') {
						arguments[1] = from;
						event.curAttr = hasMatch;
						delegate.callback.apply(this.attr(hasMatch), can.makeArray(arguments));
					} else if (delegate.event === how) {

						// if it's a match, callback with the location of the match
						delegate.callback.apply(this.attr(hasMatch), [event, newVal, oldVal, from]);
					} else if (delegate.event === 'set' && how == 'add') {
						// if we are listening to set, we should also listen to add
						delegate.callback.apply(this.attr(hasMatch), [event, newVal, oldVal, from]);
					}
				}

			}
		};

	can.extend(can.Observe.prototype, {

		delegate: function (selector, event, handler) {
			selector = can.trim(selector);
			var delegates = this._observe_delegates || (this._observe_delegates = []),
				attrs = [],
				selectorRegex = /([^\s=,]+)(?:=("[^",]*"|'[^',]*'|[^\s"',]*))?(,?)\s*/g,
				matches;

			// parse each property in the selector
			while (matches = selectorRegex.exec(selector)) {
				// we need to do a little doctoring to make up for the quotes.
				if (matches[2] && $.inArray(matches[2].substr(0, 1), ['"', "'"]) >= 0) {
					matches[2] = matches[2].substr(1, -1);
				}

				attrs.push({
					// the attribute name
					attr: matches[1],
					// the attribute name, pre-split for speed
					parts: matches[1].split('.'),
					// the value associated with this property (if there was one given)
					value: matches[2],
					// whether this selector combines with the one after it with AND or OR
					or: matches[3] === ','
				});
			}

			// delegates has pre-processed info about the event
			delegates.push({
				// the attrs name for unbinding
				selector: selector,
				// an object of attribute names and values {type: 'recipe',id: undefined}
				// undefined means a value was not defined
				attrs: attrs,
				callback: handler,
				event: event
			});
			if (delegates.length === 1) {
				this.bind("change", delegate)
			}
			return this;
		},

		undelegate: function (selector, event, handler) {
			selector = can.trim(selector);

			var i = 0,
				delegates = this._observe_delegates || [],
				delegateOb;
			if (selector) {
				while (i < delegates.length) {
					delegateOb = delegates[i];
					if (delegateOb.callback === handler || (!handler && delegateOb.selector === selector)) {
						delegateOb.undelegated = true;
						delegates.splice(i, 1)
					} else {
						i++;
					}
				}
			} else {
				// remove all delegates
				delegates = [];
			}
			if (!delegates.length) {
				//can.removeData(this, "_observe_delegates");
				this.unbind("change", delegate)
			}
			return this;
		}
	});
	// add helpers for testing .. 
	can.Observe.prototype.delegate.matches = matches;
	// ## can/observe/setter/setter.js
	can.classize = function (s, join) {
		// this can be moved out ..
		// used for getter setter
		var parts = s.split(can.undHash),
			i = 0;
		for (; i < parts.length; i++) {
			parts[i] = can.capitalize(parts[i]);
		}

		return parts.join(join || '');
	}

	var classize = can.classize,
		proto = can.Observe.prototype,
		old = proto.__set;

	proto.__set = function (prop, value, current, success, error) {
		// check if there's a setter
		var cap = classize(prop),
			setName = "set" + cap,
			errorCallback = function (errors) {
				var stub = error && error.call(self, errors);

				// if 'setter' is on the page it will trigger
				// the error itself and we dont want to trigger
				// the event twice. :)
				if (stub !== false) {
					can.trigger(self, "error", [prop, errors], true);
				}

				return false;
			},
			self = this;

		// if we have a setter
		if (this[setName] &&
		// call the setter, if returned value is undefined,
		// this means the setter is async so we 
		// do not call update property and return right away
		(value = this[setName](value, function () {
			old.call(self, prop, value, current, success, errorCallback)
		}, errorCallback)) === undefined) {
			return;
		}

		old.call(self, prop, value, current, success, errorCallback);

		return this;
	};
	// ## can/observe/validations/validations.js
	//validations object is by property.  You can have validations that
	//span properties, but this way we know which ones to run.
	//  proc should return true if there's an error or the error message
	var validate = function (attrNames, options, proc) {
		// normalize argumetns
		if (!proc) {
			proc = options;
			options = {};
		}

		options = options || {};
		attrNames = can.makeArray(attrNames)

		// run testIf if it exists
		if (options.testIf && !options.testIf.call(this)) {
			return;
		}

		var self = this;
		can.each(attrNames, function (attrName) {
			// Add a test function for each attribute
			if (!self.validations[attrName]) {
				self.validations[attrName] = [];
			}

			self.validations[attrName].push(function (newVal) {
				// if options has a message return that, otherwise, return the error
				var res = proc.call(this, newVal, attrName);
				return res === undefined ? undefined : (options.message || res);
			})
		});
	};

	var old = can.Observe.prototype.__set;
	can.Observe.prototype.__set = function (prop, value, current, success, error) {
		var self = this,
			validations = self.constructor.validations,
			errorCallback = function (errors) {
				var stub = error && error.call(self, errors);

				// if 'setter' is on the page it will trigger
				// the error itself and we dont want to trigger
				// the event twice. :)
				if (stub !== false) {
					can.trigger(self, "error", [prop, errors], true);
				}

				return false;
			};

		old.call(self, prop, value, current, success, errorCallback);

		if (validations && validations[prop]) {
			var errors = self.errors(prop);
			errors && errorCallback(errors)
		}

		return this;
	}

	can.each([can.Observe, can.Model], function (clss) {
		// in some cases model might not be defined quite yet.
		if (clss === undefined) {
			return;
		}
		var oldSetup = clss.setup;

		can.extend(clss, {
			setup: function (superClass) {
				oldSetup.apply(this, arguments);
				if (!this.validations || superClass.validations === this.validations) {
					this.validations = {};
				}
			},

			validate: validate,


			validationMessages: {
				format: "is invalid",
				inclusion: "is not a valid option (perhaps out of range)",
				lengthShort: "is too short",
				lengthLong: "is too long",
				presence: "can't be empty",
				range: "is out of range"
			},


			validateFormatOf: function (attrNames, regexp, options) {
				validate.call(this, attrNames, options, function (value) {
					if ((typeof value != 'undefined' && value != '') && String(value).match(regexp) == null) {
						return this.constructor.validationMessages.format;
					}
				});
			},


			validateInclusionOf: function (attrNames, inArray, options) {
				validate.call(this, attrNames, options, function (value) {
					if (typeof value == 'undefined') {
						return;
					}

					if (can.grep(inArray, function (elm) {
						return (elm == value);
					}).length == 0) {
						return this.constructor.validationMessages.inclusion;
					}
				});
			},


			validateLengthOf: function (attrNames, min, max, options) {
				validate.call(this, attrNames, options, function (value) {
					if ((typeof value == 'undefined' && min > 0) || value.length < min) {
						return this.constructor.validationMessages.lengthShort + " (min=" + min + ")";
					} else if (typeof value != 'undefined' && value.length > max) {
						return this.constructor.validationMessages.lengthLong + " (max=" + max + ")";
					}
				});
			},


			validatePresenceOf: function (attrNames, options) {
				validate.call(this, attrNames, options, function (value) {
					if (typeof value == 'undefined' || value === "" || value === null) {
						return this.constructor.validationMessages.presence;
					}
				});
			},


			validateRangeOf: function (attrNames, low, hi, options) {
				validate.call(this, attrNames, options, function (value) {
					if (typeof value != 'undefined' && value < low || value > hi) {
						return this.constructor.validationMessages.range + " [" + low + "," + hi + "]";
					}
				});
			}
		});
	});

	can.extend(can.Observe.prototype, {


		errors: function (attrs, newVal) {
			// convert attrs to an array
			if (attrs) {
				attrs = can.isArray(attrs) ? attrs : [attrs];
			}

			var errors = {},
				self = this,
				attr,
				// helper function that adds error messages to errors object
				// attr - the name of the attribute
				// funcs - the validation functions
				addErrors = function (attr, funcs) {
					can.each(funcs, function (func) {
						var res = func.call(self, isTest ? (self.__convert ? self.__convert(attr, newVal) : newVal) : self[attr]);
						if (res) {
							if (!errors[attr]) {
								errors[attr] = [];
							}
							errors[attr].push(res);
						}

					});
				},
				validations = this.constructor.validations,
				isTest = attrs && attrs.length === 1 && arguments.length === 2;

			// go through each attribute or validation and
			// add any errors
			can.each(attrs || validations || {}, function (funcs, attr) {
				// if we are iterating through an array, use funcs
				// as the attr name
				if (typeof attr == 'number') {
					attr = funcs;
					funcs = validations[attr];
				}
				// add errors to the 
				addErrors(attr, funcs || []);
			});

			// return errors as long as we have one
			return can.isEmptyObject(errors) ? null : isTest ? errors[attrs[0]] : errors;
		}
	});
	// ## can/util/string/deparam/deparam.js

	// ## deparam.js  
	// `can.deparam`  
	// _Takes a string of name value pairs and returns a Object literal that represents those params._
	var digitTest = /^\d+$/,
		keyBreaker = /([^\[\]]+)|(\[\])/g,
		paramTest = /([^?#]*)(#.*)?$/,
		prep = function (str) {
			return decodeURIComponent(str.replace(/\+/g, " "));
		};


	can.extend(can, {

		deparam: function (params) {

			var data = {},
				pairs, lastPart;

			if (params && paramTest.test(params)) {

				pairs = params.split('&'),

				can.each(pairs, function (pair) {

					var parts = pair.split('='),
						key = prep(parts.shift()),
						value = prep(parts.join("=")),
						current = data;

					parts = key.match(keyBreaker);

					for (var j = 0, l = parts.length - 1; j < l; j++) {
						if (!current[parts[j]]) {
							// If what we are pointing to looks like an `array`
							current[parts[j]] = digitTest.test(parts[j + 1]) || parts[j + 1] == "[]" ? [] : {};
						}
						current = current[parts[j]];
					}
					lastPart = parts.pop();
					if (lastPart == "[]") {
						current.push(value);
					} else {
						current[lastPart] = value;
					}
				});
			}
			return data;
		}
	});
	// ## can/route/route.js
	// ## route.js  
	// `can.route`  
	// _Helps manage browser history (and client state) by synchronizing the 
	// `window.location.hash` with a `can.Observe`._  
	// Helper methods used for matching routes.
	var
	// `RegExp` used to match route variables of the type ':name'.
	// Any word character or a period is matched.
	matcher = /\:([\w\.]+)/g,
		// Regular expression for identifying &amp;key=value lists.
		paramsMatcher = /^(?:&[^=]+=[^&]*)+/,
		// Converts a JS Object into a list of parameters that can be 
		// inserted into an html element tag.
		makeProps = function (props) {
			var tags = [];
			can.each(props, function (val, name) {
				tags.push((name === 'className' ? 'class' : name) + '="' + (name === "href" ? val : can.esc(val)) + '"');
			});
			return tags.join(" ");
		},
		// Checks if a route matches the data provided. If any route variable
		// is not present in the data, the route does not match. If all route
		// variables are present in the data, the number of matches is returned 
		// to allow discerning between general and more specific routes. 
		matchesData = function (route, data) {
			var count = 0,
				i = 0,
				defaults = {};
			// look at default values, if they match ...
			for (var name in route.defaults) {
				if (route.defaults[name] === data[name]) {
					// mark as matched
					defaults[name] = 1;
					count++;
				}
			}
			for (; i < route.names.length; i++) {
				if (!data.hasOwnProperty(route.names[i])) {
					return -1;
				}
				if (!defaults[route.names[i]]) {
					count++;
				}

			}

			return count;
		},
		onready = !0,
		location = window.location,
		wrapQuote = function (str) {
			return (str + '').replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
		},
		each = can.each,
		extend = can.extend;

	can.route = function (url, defaults) {
		defaults = defaults || {};
		// Extract the variable names and replace with `RegExp` that will match
		// an atual URL with values.
		var names = [],
			test = url.replace(matcher, function (whole, name, i) {
				names.push(name);
				var next = "\\" + (url.substr(i + whole.length, 1) || can.route._querySeparator);
				// a name without a default value HAS to have a value
				// a name that has a default value can be empty
				// The `\\` is for string-escaping giving single `\` for `RegExp` escaping.
				return "([^" + next + "]" + (defaults[name] ? "*" : "+") + ")";
			});

		// Add route in a form that can be easily figured out.
		can.route.routes[url] = {
			// A regular expression that will match the route when variable values 
			// are present; i.e. for `:page/:type` the `RegExp` is `/([\w\.]*)/([\w\.]*)/` which
			// will match for any value of `:page` and `:type` (word chars or period).
			test: new RegExp("^" + test + "($|" + wrapQuote(can.route._querySeparator) + ")"),
			// The original URL, same as the index for this entry in routes.
			route: url,
			// An `array` of all the variable names in this route.
			names: names,
			// Default values provided for the variables.
			defaults: defaults,
			// The number of parts in the URL separated by `/`.
			length: url.split('/').length
		};
		return can.route;
	};

	extend(can.route, {

		_querySeparator: '&',
		_paramsMatcher: paramsMatcher,


		param: function (data, _setRoute) {
			// Check if the provided data keys match the names in any routes;
			// Get the one with the most matches.
			var route,
			// Need to have at least 1 match.
			matches = 0,
				matchCount, routeName = data.route,
				propCount = 0;

			delete data.route;

			each(data, function () {
				propCount++;
			});
			// Otherwise find route.
			each(can.route.routes, function (temp, name) {
				// best route is the first with all defaults matching

				matchCount = matchesData(temp, data);
				if (matchCount > matches) {
					route = temp;
					matches = matchCount;
				}
				if (matchCount >= propCount) {
					return false;
				}
			});
			// If we have a route name in our `can.route` data, and it's
			// just as good as what currently matches, use that
			if (can.route.routes[routeName] && matchesData(can.route.routes[routeName], data) === matches) {
				route = can.route.routes[routeName];
			}
			// If this is match...
			if (route) {
				var cpy = extend({}, data),
					// Create the url by replacing the var names with the provided data.
					// If the default value is found an empty string is inserted.
					res = route.route.replace(matcher, function (whole, name) {
						delete cpy[name];
						return data[name] === route.defaults[name] ? "" : encodeURIComponent(data[name]);
					}),
					after;
				// Remove matching default values
				each(route.defaults, function (val, name) {
					if (cpy[name] === val) {
						delete cpy[name];
					}
				});

				// The remaining elements of data are added as 
				// `&amp;` separated parameters to the url.
				after = can.param(cpy);
				// if we are paraming for setting the hash
				// we also want to make sure the route value is updated
				if (_setRoute) {
					can.route.attr('route', route.route);
				}
				return res + (after ? can.route._querySeparator + after : "");
			}
			// If no route was found, there is no hash URL, only paramters.
			return can.isEmptyObject(data) ? "" : can.route._querySeparator + can.param(data);
		},

		deparam: function (url) {
			// See if the url matches any routes by testing it against the `route.test` `RegExp`.
			// By comparing the URL length the most specialized route that matches is used.
			var route = {
				length: -1
			};
			each(can.route.routes, function (temp, name) {
				if (temp.test.test(url) && temp.length > route.length) {
					route = temp;
				}
			});
			// If a route was matched.
			if (route.length > -1) {

				var // Since `RegExp` backreferences are used in `route.test` (parens)
				// the parts will contain the full matched string and each variable (back-referenced) value.
				parts = url.match(route.test),
					// Start will contain the full matched string; parts contain the variable values.
					start = parts.shift(),
					// The remainder will be the `&amp;key=value` list at the end of the URL.
					remainder = url.substr(start.length - (parts[parts.length - 1] === can.route._querySeparator ? 1 : 0)),
					// If there is a remainder and it contains a `&amp;key=value` list deparam it.
					obj = (remainder && can.route._paramsMatcher.test(remainder)) ? can.deparam(remainder.slice(1)) : {};

				// Add the default values for this route.
				obj = extend(true, {}, route.defaults, obj);
				// Overwrite each of the default values in `obj` with those in 
				// parts if that part is not empty.
				each(parts, function (part, i) {
					if (part && part !== can.route._querySeparator) {
						obj[route.names[i]] = decodeURIComponent(part);
					}
				});
				obj.route = route.route;
				return obj;
			}
			// If no route was matched, it is parsed as a `&amp;key=value` list.
			if (url.charAt(0) !== can.route._querySeparator) {
				url = can.route._querySeparator + url;
			}
			return can.route._paramsMatcher.test(url) ? can.deparam(url.slice(1)) : {};
		},

		data: new can.Observe({}),

		routes: {},

		ready: function (val) {
			if (val === false) {
				onready = val;
			}
			if (val === true || onready === true) {
				can.route._setup();
				setState();
			}
			return can.route;
		},

		url: function (options, merge) {
			if (merge) {
				options = extend({}, curParams, options)
			}
			return "#!" + can.route.param(options);
		},

		link: function (name, options, props, merge) {
			return "<a " + makeProps(
			extend({
				href: can.route.url(options, merge)
			}, props)) + ">" + name + "</a>";
		},

		current: function (options) {
			return location.hash == "#!" + can.route.param(options)
		},
		_setup: function () {
			// If the hash changes, update the `can.route.data`.
			can.bind.call(window, 'hashchange', setState);
		},
		_getHash: function () {
			return location.href.split(/#!?/)[1] || "";
		},
		_setHash: function (serialized) {
			var path = (can.route.param(serialized, true));
			location.hash = "#!" + path;
			return path;
		}
	});


	// The functions in the following list applied to `can.route` (e.g. `can.route.attr('...')`) will
	// instead act on the `can.route.data` observe.
	each(['bind', 'unbind', 'delegate', 'undelegate', 'attr', 'removeAttr'], function (name) {
		can.route[name] = function () {
			return can.route.data[name].apply(can.route.data, arguments)
		}
	})

	var // A ~~throttled~~ debounced function called multiple times will only fire once the
	// timer runs down. Each call resets the timer.
	timer,
	// Intermediate storage for `can.route.data`.
	curParams,
	// Deparameterizes the portion of the hash of interest and assign the
	// values to the `can.route.data` removing existing values no longer in the hash.
	// setState is called typically by hashchange which fires asynchronously
	// So it's possible that someone started changing the data before the 
	// hashchange event fired.  For this reason, it will not set the route data
	// if the data is changing or the hash already matches the hash that was set.
	setState = can.route.setState = function () {
		var hash = can.route._getHash();
		curParams = can.route.deparam(hash);

		// if the hash data is currently changing, or
		// the hash is what we set it to anyway, do NOT change the hash
		if (!changingData || hash !== lastHash) {
			can.route.attr(curParams, true);
		}
	},
		// The last hash caused by a data change
		lastHash,
		// Are data changes pending that haven't yet updated the hash
		changingData;

	// If the `can.route.data` changes, update the hash.
	// Using `.serialize()` retrieves the raw data contained in the `observable`.
	// This function is ~~throttled~~ debounced so it only updates once even if multiple values changed.
	// This might be able to use batchNum and avoid this.
	can.route.bind("change", function (ev, attr) {
		// indicate that data is changing
		changingData = 1;
		clearTimeout(timer);
		timer = setTimeout(function () {
			// indicate that the hash is set to look like the data
			changingData = 0;
			var serialized = can.route.data.serialize();

			lastHash = can.route._setHash(serialized);
		}, 1);
	});
	// `onready` event...
	can.bind.call(document, "ready", can.route.ready);

	// extend route to have a similar property 
	// that is often checked in mustache to determine
	// an object's observability
	can.route.constructor.canMakeObserve = can.Observe.canMakeObserve;

	// ## can/util/object/object.js

	var isArray = can.isArray,
		// essentially returns an object that has all the must have comparisons ...
		// must haves, do not return true when provided undefined
		cleanSet = function (obj, compares) {
			var copy = can.extend({}, obj);
			for (var prop in copy) {
				var compare = compares[prop] === undefined ? compares["*"] : compares[prop];
				if (same(copy[prop], undefined, compare)) {
					delete copy[prop]
				}
			}
			return copy;
		},
		propCount = function (obj) {
			var count = 0;
			for (var prop in obj) count++;
			return count;
		};

	can.Object = {};

	var same = can.Object.same = function (a, b, compares, aParent, bParent, deep) {
		var aType = typeof a,
			aArray = isArray(a),
			comparesType = typeof compares,
			compare;

		if (comparesType == 'string' || compares === null) {
			compares = compareMethods[compares];
			comparesType = 'function'
		}
		if (comparesType == 'function') {
			return compares(a, b, aParent, bParent)
		}
		compares = compares || {};

		if (a instanceof Date) {
			return a === b;
		}
		if (deep === -1) {
			return aType === 'object' || a === b;
		}
		if (aType !== typeof b || aArray !== isArray(b)) {
			return false;
		}
		if (a === b) {
			return true;
		}
		if (aArray) {
			if (a.length !== b.length) {
				return false;
			}
			for (var i = 0; i < a.length; i++) {
				compare = compares[i] === undefined ? compares["*"] : compares[i]
				if (!same(a[i], b[i], a, b, compare)) {
					return false;
				}
			};
			return true;
		} else if (aType === "object" || aType === 'function') {
			var bCopy = can.extend({}, b);
			for (var prop in a) {
				compare = compares[prop] === undefined ? compares["*"] : compares[prop];
				if (!same(a[prop], b[prop], compare, a, b, deep === false ? -1 : undefined)) {
					return false;
				}
				delete bCopy[prop];
			}
			// go through bCopy props ... if there is no compare .. return false
			for (prop in bCopy) {
				if (compares[prop] === undefined || !same(undefined, b[prop], compares[prop], a, b, deep === false ? -1 : undefined)) {
					return false;
				}
			}
			return true;
		}
		return false;
	};

	can.Object.subsets = function (checkSet, sets, compares) {
		var len = sets.length,
			subsets = [],
			checkPropCount = propCount(checkSet),
			setLength;

		for (var i = 0; i < len; i++) {
			//check this subset
			var set = sets[i];
			if (can.Object.subset(checkSet, set, compares)) {
				subsets.push(set)
			}
		}
		return subsets;
	};

	can.Object.subset = function (subset, set, compares) {
		// go through set {type: 'folder'} and make sure every property
		// is in subset {type: 'folder', parentId :5}
		// then make sure that set has fewer properties
		// make sure we are only checking 'important' properties
		// in subset (ones that have to have a value)
		var setPropCount = 0,
			compares = compares || {};

		for (var prop in set) {

			if (!same(subset[prop], set[prop], compares[prop], subset, set)) {
				return false;
			}
		}
		return true;
	}

	var compareMethods = {
		"null": function () {
			return true;
		},
		i: function (a, b) {
			return ("" + a).toLowerCase() == ("" + b).toLowerCase()
		}
	}

	// ## can/observe/backup/backup.js
	var flatProps = function (a) {
		var obj = {};
		for (var prop in a) {
			if (typeof a[prop] !== 'object' || a[prop] === null || a[prop] instanceof Date) {
				obj[prop] = a[prop]
			}
		}
		return obj;
	};

	can.extend(can.Observe.prototype, {


		backup: function () {
			this._backupStore = this._attrs();
			return this;
		},


		isDirty: function (checkAssociations) {
			return this._backupStore && !can.Object.same(this._attrs(), this._backupStore, undefined, undefined, undefined, !! checkAssociations);
		},


		restore: function (restoreAssociations) {
			var props = restoreAssociations ? this._backupStore : flatProps(this._backupStore)

			if (this.isDirty(restoreAssociations)) {
				this._attrs(props);
			}

			return this;
		}

	})


})(this, jQuery);