"use strict";
// # can/control/control.js
//
// Create organized, memory-leak free, rapidly performing, stateful
// controls with declarative eventing binding. Used when creating UI
// controls with behaviors, bound to elements on the page.
// ## helpers

var Construct = require("can-construct");
var namespace = require("can-namespace");
var assign = require("can-assign");
var observeReader = require("can-stache-key");
var canReflect = require("can-reflect");
var Observation = require("can-observation");
var canEvent = require("can-event-queue/map/map");
var dev = require('can-log/dev/dev');
var queues = require('can-queues');

var string = require("can-string");
var get = require("can-key/get/get");
var domMutate = require('can-dom-mutate');
var canSymbol = require('can-symbol');

var controlsSymbol = canSymbol.for("can.controls");


var processors;


// ### bind
// this helper binds to one element and returns a function that unbinds from that element.
var bind = function (el, ev, callback, queue) {

    canEvent.on.call(el, ev, callback, queue);

	return function () {
        canEvent.off.call(el, ev, callback, queue);
	};
},
	slice = [].slice,
	paramReplacer = /\{([^\}]+)\}/g,

	// ### delegate
	//
	// this helper binds to elements based on a selector and returns a
	// function that unbinds.
	delegate = function (el, selector, ev, callback) {
        canEvent.on.call(el, ev, selector, callback);

		return function () {
            canEvent.off.call(el, ev, selector, callback);
		};
	},

	// ### binder
	//
	// Calls bind or unbind depending if there is a selector.
	binder = function (el, ev, callback, selector) {
		return selector ?
			delegate(el, selector.trim(), ev, callback) :
			bind(el, ev, callback);
	},

	basicProcessor;

var Control = Construct.extend("Control",
	// ## *static functions*
	/**
	 * @static
	 */
	{
		// ## can.Control.setup
		//
		// This function pre-processes which methods are event listeners and which are methods of
		// the control. It has a mechanism to allow controllers to inherit default values from super
		// classes, like `can.Construct`, and will cache functions that are action functions (see `_isAction`)
		// or functions with an underscored name.
		setup: function () {
			Construct.setup.apply(this, arguments);

			if (Control) {
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
		// ## can.Control._shifter
		//
		// Moves `this` to the first argument, wraps it with `jQuery` if it's
		// an element.
		_shifter: function (context, name) {
			var method = typeof name === "string" ? context[name] : name;

			if (typeof method !== "function") {
				method = context[method];
			}
            var Control = this;
			function controlMethod() {
				var wrapped = Control.wrapElement(this);
				context.called = name;
				return method.apply(context, [wrapped].concat(slice.call(arguments, 0)));
			}
      //!steal-remove-start
      if(process.env.NODE_ENV !== 'production') {
	      Object.defineProperty(controlMethod, "name", {
	      	value: canReflect.getName(this) + "["+name+"]",
	      });
	     }
      //!steal-remove-end
      return controlMethod;
		},

		// ## can.Control._isAction
		//
		// Return `true` if `methodName` refers to an action. An action is a `methodName` value that
		// is not the constructor, and is either a function or string that refers to a function, or is
		// defined in `special`, `processors`. Detects whether `methodName` is also a valid method name.
		_isAction: function (methodName) {
			var val = this.prototype[methodName],
				type = typeof val;

			return (methodName !== 'constructor') &&
			(type === "function" || (type === "string" && (typeof this.prototype[val] === "function") )) &&
			!! (Control.isSpecial(methodName) || processors[methodName] || /[^\w]/.test(methodName));
		},
		// ## can.Control._action
		//
		// Takes a method name and the options passed to a control and tries to return the data
		// necessary to pass to a processor (something that binds things).
		//
		// For performance reasons, `_action` is called twice:
		// * It's called when the Control class is created. for templated method names (e.g., `{window} foo`), it returns null. For non-templated method names it returns the event binding data. That data is added to `this.actions`.
		// * It is called wehn a control instance is created, but only for templated actions.
		_action: function(methodName, options, controlInstance) {
			var readyCompute,
                unableToBind;

			// If we don't have options (a `control` instance), we'll run this later. If we have
			// options, run `can.sub` to replace the action template `{}` with values from the `options`
			// or `window`. If a `{}` template resolves to an object, `convertedName` will be an array.
			// In that case, the event name we want will be the last item in that array.
			paramReplacer.lastIndex = 0;
			if (options || !paramReplacer.test(methodName)) {
                var controlActionData = function() {
					var delegate;

					// Set the delegate target and get the name of the event we're listening to.
					var name = methodName.replace(paramReplacer, function(matched, key) {
						var value, parent;

						// If listening directly to a delegate target, set it
						if (this._isDelegate(options, key)) {
							delegate = this._getDelegate(options, key);
							return "";
						}

						// If key contains part of the lookup path, remove it.
						// This is needed for bindings like {viewModel.foo} in can-component's Control.
						key = this._removeDelegateFromKey(key);

						// set the parent (where the key will be read from)
						parent = this._lookup(options)[0];

						value = observeReader.read(parent, observeReader.reads(key), {
							// if we find a compute, we should bind on that and not read it
							readCompute: false
						}).value;

						// If `value` is undefined try to get the value from the window.
						if (value === undefined && typeof window !== 'undefined') {
							value = get(window, key);
						}

						// if the parent is not an observable and we don't have a value, show a warning
						// in this situation, it is not possible for the event handler to be triggered
						if (!parent || !(canReflect.isObservableLike(parent) && canReflect.isMapLike(parent)) && !value) {
                            unableToBind = true;
							return null;
						}

						// If `value` is a string we just return it, otherwise we set it as a delegate target.
						if (typeof value === "string") {
							return value;
						} else {
							delegate = value;
							return "";
						}
					}.bind(this));

					// removing spaces that get added when converting
					// `{element} click` -> ` click`
					name = name.trim();

					// Get the name of the `event` we're listening to.
					var parts = name.split(/\s+/g),
						event = parts.pop();

					// Return everything needed to handle the event we're listening to.
					return {
						processor: this.processors[event] || basicProcessor,
						parts: [name, parts.join(" "), event],
						delegate: delegate || undefined
					};
				};

        //!steal-remove-start
        if(process.env.NODE_ENV !== 'production') {
		    	Object.defineProperty(controlActionData, "name", {
		      	value: canReflect.getName(controlInstance || this.prototype) + "["+methodName+"].actionData",
		      });
	      }
        //!steal-remove-end

				readyCompute = new Observation(controlActionData, this);


				if (controlInstance) {
					// Create a handler function that we'll use to handle the `change` event on the `readyCompute`.
					var handler = function(actionData) {
						// unbinds the old binding
						if(controlInstance._bindings.control[methodName]) {
							controlInstance._bindings.control[methodName](controlInstance.element);
						}
						// binds the new
						controlInstance._bindings.control[methodName] = actionData.processor(
							actionData.delegate || controlInstance.element,
							actionData.parts[2], actionData.parts[1], methodName, controlInstance);
					};

          //!steal-remove-start
          if(process.env.NODE_ENV !== 'production') {
          	Object.defineProperty(handler, "name", {
            	value: canReflect.getName(controlInstance) + "["+methodName+"].handler",
            });
          }
					//!steal-remove-end


					canReflect.onValue(readyCompute, handler, "mutate");
          //!steal-remove-start
          if(process.env.NODE_ENV !== 'production') {
	          if(unableToBind) {
	          	dev.log('can-control: No property found for handling ' + methodName);
						}
					}
					//!steal-remove-end

					controlInstance._bindings.readyComputes[methodName] = {
						compute: readyCompute,
						handler: handler
					};
				}

				return readyCompute.get();
			}
		},
		// the lookup path - where templated keys will be looked up
		_lookup: function (options) {
			return [options, window];
		},
		// strip strings that represent delegates from the key
		_removeDelegateFromKey: function (key) {
			return key;
		},
		// return whether the key is a delegate
		_isDelegate: function(options, key) {
			return key === 'element';
		},
		// return the delegate object for a given key
		_getDelegate: function(options, key) {
			return undefined;
		},
		// ## can.Control.processors
		//
		// An object of `{eventName : function}` pairs that Control uses to
		// hook up events automatically.
		processors: {},
		// ## can.Control.defaults
		// A object of name-value pairs that act as default values for a control instance
		defaults: {},
        // should be used to overwrite to make nodeLists on this
        convertElement: function(element) {
            element = typeof element === "string" ?
							document.querySelector(element) : element;

						return this.wrapElement(element);
        },
        wrapElement: function(el){
            return el;
        },
        unwrapElement: function(el){
            return el;
        },
        // should be overwritten to look in jquery special events
        isSpecial: function(eventName){
            return eventName === "inserted" || eventName === "removed";
        }
	}, {
		// ## *prototype functions*
		/**
		 * @prototype
		 */
		// ## setup
		//
		// Setup is where most of the Control's magic happens. It performs several pre-initialization steps:
		// - Sets `this.element`
		// - Adds the Control's name to the element's className
		// - Saves the Control in `$.data`
		// - Merges Options
		// - Binds event handlers using `delegate`
		// The final step is to return pass the element and prepareed options, to be used in `init`.
		setup: function (element, options) {

			var cls = this.constructor,
				pluginname = cls.pluginName || cls.shortName,
				arr;

			if (!element) {
				throw new Error('Creating an instance of a named control without passing an element');
			}
			// Retrieve the raw element, then set the plugin name as a class there.
            this.element = cls.convertElement(element);

			if (pluginname && pluginname !== 'Control' && this.element.classList) {
                this.element.classList.add(pluginname);
			}

			// Set up the 'controls' data on the element. If it does not exist, initialize
			// it to an empty array.
			arr = this.element[controlsSymbol];
			if (!arr) {
				arr = [];
				this.element[controlsSymbol] = arr;
			}
			arr.push(this);

			// The `this.options` property is an Object that contains configuration data
			// passed to a control when it is created (`new can.Control(element, options)`)
			//
			// The `options` argument passed when creating the control is merged with `can.Control.defaults`
			// in [can.Control.prototype.setup setup].
			//
			// If no `options` value is used during creation, the value in `defaults` is used instead
			if (canReflect.isObservableLike(options) && canReflect.isMapLike(options)) {
				for (var prop in cls.defaults) {
					if (!options.hasOwnProperty(prop)) {
						observeReader.set(options, prop, cls.defaults[prop]);
					}
				}
				this.options = options;
			} else {
				this.options = assign( assign({}, cls.defaults), options);
			}

			this.on();

			return [this.element, this.options];
		},
		// ## on
		//
		// This binds an event handler for an event to a selector under the scope of `this.element`
		// If no options are specified, all events are rebound to their respective elements. The actions,
		// which were cached in `setup`, are used and all elements are bound using `delegate` from `this.element`.
		on: function (el, selector, eventName, func) {
			if (!el) {
				this.off();

				var cls = this.constructor,
					bindings = this._bindings,
					actions = cls.actions,
					element = this.constructor.unwrapElement(this.element),
					destroyCB = Control._shifter(this, "destroy"),
					funcName, ready;

				for (funcName in actions) {
					// Only push if we have the action and no option is `undefined`
					if ( actions.hasOwnProperty(funcName) ) {
						ready = actions[funcName] || cls._action(funcName, this.options, this);
						if( ready ) {
							bindings.control[funcName]  = ready.processor(ready.delegate || element,
								ready.parts[2], ready.parts[1], funcName, this);
						}
					}
				}

				// Set up the ability to `destroy` the control later.
				var removalDisposal = domMutate.onNodeDisconnected(element, function () {
					var doc = element.ownerDocument;
					var ownerNode = doc.contains ? doc : doc.documentElement;
					if (!ownerNode || ownerNode.contains(element) === false) {
						// if the teardown is happening while the dom queue is flushing,
						// there may have been a rebinding of _action handlers queued
						// in the mutate queue already, so do the teardown later.
						if(queues.domQueue.isFlushing) {
							queues.mutateQueue.enqueue(destroyCB);
						} else {
							destroyCB();
						}
					}
				});
				bindings.user.push(function () {
					if (removalDisposal) {
						removalDisposal();
						removalDisposal = undefined;
					}
				});
				return bindings.user.length;
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
				func = Control._shifter(this, func);
			}

			this._bindings.user.push(binder(el, eventName, func, selector));

			return this._bindings.user.length;
		},
		// ## off
		//
		// Unbinds all event handlers on the controller.
		// This should _only_ be called in combination with .on()
		off: function () {
			var el = this.constructor.unwrapElement(this.element),
				bindings = this._bindings;
			if( bindings ) {
				(bindings.user || []).forEach(function (value) {
					value(el);
				});
				canReflect.eachKey(bindings.control || {}, function (value) {
					value(el);
				});
				canReflect.eachKey(bindings.readyComputes || {}, function(value) {
					canReflect.offValue(value.compute, value.handler, "mutate");
				});
			}
			// Adds bindings.
			this._bindings = {user: [], control: {}, readyComputes: {}};
		},
		// ## destroy
		//
		// Prepares a `control` for garbage collection.
		// First checks if it has already been removed. Then, removes all the bindings, data, and
		// the element from the Control instance.
		destroy: function () {
			if (this.element === null) {
				//!steal-remove-start
				if(process.env.NODE_ENV !== 'production') {
					dev.warn("can-control: Control already destroyed");
				}
				//!steal-remove-end
				return;
			}
			var Class = this.constructor,
				pluginName = Class.pluginName || (Class.shortName && string.underscore(Class.shortName)),
				controls;

			this.off();

			if (pluginName && pluginName !== 'can_control' && this.element.classList) {
                this.element.classList.remove(pluginName);
			}

			controls = this.element[controlsSymbol];
			if (controls) {
				controls.splice(controls.indexOf(this), 1);
			}

			//canEvent.dispatch.call(this, "destroyed");

			this.element = null;
		}
	});

// ## Processors
//
// Processors do the binding. This basic processor binds events. Each returns a function that unbinds
// when called.
processors = Control.processors;
basicProcessor = function (el, event, selector, methodName, control) {
	return binder(el, event, Control._shifter(control, methodName), selector);
};

// Set common events to be processed as a `basicProcessor`
["beforeremove", "change", "click", "contextmenu", "dblclick", "keydown", "keyup",
	"keypress", "mousedown", "mousemove", "mouseout", "mouseover",
	"mouseup", "reset", "resize", "scroll", "select", "submit", "focusin",
	"focusout", "mouseenter", "mouseleave",
	"touchstart", "touchmove", "touchcancel", "touchend", "touchleave",
	"inserted","removed",
	"dragstart", "dragenter", "dragover", "dragleave", "drag", "drop", "dragend"
].forEach(function (v) {
	processors[v] = basicProcessor;
});

module.exports = namespace.Control = Control;
