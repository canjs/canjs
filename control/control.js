// # can/control/control.js
//
// Create organized, memory-leak free, rapidly performing, stateful 
// controls with declarative eventing binding. Used when creating UI 
// controls with behaviors, bound to elements on the page.

steal('can/util', 'can/construct', function (can) {
	// Binds an element and returns a function that unbinds from that element.
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
		special = can.getObject("$.event.special", [can]) || {},

		// Binds an element and returns a function that unbinds.
		delegate = function (el, selector, ev, callback) {
			can.delegate.call(el, selector, ev, callback);
			return function () {
				can.undelegate.call(el, selector, ev, callback);
			};
		},

		// Calls bind or unbind depending if there is a selector.
		binder = function (el, ev, callback, selector) {
			return selector ?
				delegate(el, can.trim(selector), ev, callback) :
				bind(el, ev, callback);
		},

		basicProcessor;

	var Control = can.Control = can.Construct(
		/**
		 * @add can.Control
		 */
		/** 
		 * @static
		 */
		{
			// Setup pre-processes which methods are event listeners.
			setup: function () {

				// Allow contollers to inherit "defaults" from super-classes as it is
				// done in `can.Construct`
				can.Construct.setup.apply(this, arguments);

				// If you didn't provide a name, or are `control`, don't do anything.
				if (can.Control) {

					// Cache the underscored names, then the action functions from the prototype
					var control = this,
						funcName;

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

				var method = typeof name === "string" ? context[name] : name;

				if (!isFunction(method)) {
					method = context[method];
				}

				return function () {
					context.called = name;
					return method.apply(context, [this.nodeName ? can.$(this) : this].concat(slice.call(arguments, 0)));
				};
			},

			// Return `true` if `methodName` refers to an action.
			_isAction: function (methodName) {

				var val = this.prototype[methodName],
					type = typeof val;
				// if not the constructor
				return (methodName !== 'constructor') &&
				// and is a function or links to a function
				(type === "function" || (type === "string" && isFunction(this.prototype[val]))) &&
				// and is in special, a processor, or has a funny character
				!! (special[methodName] || processors[methodName] || /[^\w]/.test(methodName));
			},
			// Takes a method name and the options passed to a control
			// and tries to return the data necessary to pass to a processor
			// (something that binds things).
			// 
			// For performance reasons, `_action` is called twice: 
			// * It's called when the Control class is created. for templated method names (e.g., `{window} foo`), it returns null. For non-templated method names it returns the event binding data. That data is added to `this.actions`.
			// * It is called wehn a control instance is created, but only for templated actions.
			_action: function (methodName, options) {

				// If we don't have options (a `control` instance), we'll run this 
				// later.  
				paramReplacer.lastIndex = 0;
				if (options || !paramReplacer.test(methodName)) {
					// If we have options, run `.sub` to replace templates `{}` with a
					// value from the options or the window
					var convertedName = options ? can.sub(methodName, this._lookup(options)) : methodName;
					if (!convertedName) {
						//!steal-remove-start
						can.dev.log('can/control/control.js: No property found for handling ' + methodName);
						//!steal-remove-end
						return null;
					}
					// If a `{}` template resolves to an object, `convertedName` will be an array
					// Take the event name from the end of that array.
					var arr = can.isArray(convertedName),
						name = arr ? convertedName[1] : convertedName,
						parts = name.split(/\s+/g),
						event = parts.pop();

					return {
						processor: processors[event] || basicProcessor,
						parts: [name, parts.join(" "), event],
						delegate: arr ? convertedName[0] : undefined
					};
				}
			},
			_lookup: function (options) {
				return [options, window];
			},
			// An object of `{eventName : function}` pairs that Control uses to 
			// hook up events auto-magically.
			processors: {},
			// A object of name-value pairs that act as default values for a control instance
			defaults: {}
		}, {
			/**
			 * @prototype
			 */
			// Setup is where most of the Control's magic happens. It performs several pre-initialization steps:
			// - Sets `this.element`
			// - Adds the Control's name to the element's className
			// - Saves the Control in `$.data`
			// - Merges Options
			// - Binds event handlers
			setup: function (element, options) {

				var cls = this.constructor,
					pluginname = cls.pluginName || cls._fullName,
					arr;

				// Retrieve the raw element, then set the plugin name as a class there.
				this.element = can.$(element);

				if (pluginname && pluginname !== 'can_control') {
					this.element.addClass(pluginname);
				}

				// Set up the 'controls' data on the element
				arr = can.data(this.element, 'controls');
				if (!arr) {
					// If it does not exist, initialize it to an empty array
					arr = [];
					can.data(this.element, 'controls', arr);
				}
				arr.push(this);

				// The `this.options` property is an Object that contains configuration data
				// passed to a control when it is created (`new can.Control(element, options)`)
				// 
				// The `options` argument passed when creating the control is merged with `can.Control.defaults` 
				// in [can.Control.prototype.setup setup].
				// 
				// If no `options` value is used during creation, the value in `defaults` is used instead
				this.options = extend({}, cls.defaults, options);

				// Bind all event handlers.
				this.on();

				// This gets passed into `init`.
				return [this.element, this.options];
			},
			// `.on()` binds an event handler for an event to a selector under the scope of `this.element`
			// If no options are specified, all events are rebound to their respective elements
			on: function (el, selector, eventName, func) {
				if (!el) {
					this.off();

					// Go through the cached list of actions and use the processor to bind
					var cls = this.constructor,
						bindings = this._bindings,
						actions = cls.actions,
						element = this.element,
						destroyCB = can.Control._shifter(this, "destroy"),
						funcName, ready;

					for (funcName in actions) {
						// Only push if we have the action and no option is `undefined`
						if (actions.hasOwnProperty(funcName) &&
							(ready = actions[funcName] || cls._action(funcName, this.options))) {
							bindings.push(ready.processor(ready.delegate || element,
								ready.parts[2], ready.parts[1], funcName, this));
						}
					}

					// Setup to be destroyed...  
					// don't bind because we don't want to remove it.
					can.bind.call(element, "removed", destroyCB);
					bindings.push(function (el) {
						can.unbind.call(el, "removed", destroyCB);
					});
					return bindings.length;
				}

				// if `el` is a string, use that as `selector` and re-set it to this control's element...
				if (typeof el === 'string') {
					func = eventName;
					eventName = selector;
					selector = el;
					el = this.element;
				}

				// ...otherwise, set `selector` to null
				if (func === undefined) {
					func = eventName;
					eventName = selector;
					selector = null;
				}

				if (typeof func === 'string') {
					func = can.Control._shifter(this, func);
				}

				this._bindings.push(binder(el, eventName, func, selector));

				return this._bindings.length;
			},
			// Unbinds all event handlers on the controller.
			// This should only be called in combination with .on()
			off: function () {
				var el = this.element[0];
				each(this._bindings || [], function (value) {
					value(el);
				});
				// Adds bindings.
				this._bindings = [];
			},
			// Prepares a `control` for garbage collection.
			// First checks if it has already been removed. Then, removes all the bindings, data, and 
			// the element from the Control.
			destroy: function () {
				// If the control is already destroyed, let the dev. know.
				if (this.element === null) {
					//!steal-remove-start
					can.dev.warn("can/control/control.js: Control already destroyed");
					//!steal-remove-end
					return;
				}
				var Class = this.constructor,
					pluginName = Class.pluginName || Class._fullName,
					controls;

				this.off();

				if (pluginName && pluginName !== 'can_control') {
					// Remove the `className`.
					this.element.removeClass(pluginName);
				}

				// Remove from `data`.
				controls = can.data(this.element, "controls");
				controls.splice(can.inArray(this, controls), 1);

				// Fire an event in case we want to know if the `control` is removed.
				can.trigger(this, "destroyed"); 

				this.element = null;
			}
		});

	// Processors do the binding. This basic processor binds events.
	// Each returns a function that unbinds when called.
	var processors = can.Control.processors;
	basicProcessor = function (el, event, selector, methodName, control) {
		return binder(el, event, can.Control._shifter(control, methodName), selector);
	};

	// Set common events to be processed as a `basicProcessor`
	each(["change", "click", "contextmenu", "dblclick", "keydown", "keyup",
		"keypress", "mousedown", "mousemove", "mouseout", "mouseover",
		"mouseup", "reset", "resize", "scroll", "select", "submit", "focusin",
		"focusout", "mouseenter", "mouseleave",
		"touchstart", "touchmove", "touchcancel", "touchend", "touchleave"
	], function (v) {
		processors[v] = basicProcessor;
	});

	return Control;
});
