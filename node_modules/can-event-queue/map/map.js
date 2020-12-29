"use strict";
/**
 * @module {function} can-event-queue/map/map
 * @parent can-event-queue
 * @templateRender true
 *
 * @description Mixin methods and symbols to make this object or prototype object
 * behave like a key-value observable.
 *
 * @signature `mixinMapBindings( obj )`
 *
 * Adds symbols and methods that make `obj` or instances having `obj` on their prototype
 * behave like key-value observables.
 *
 * When `mixinMapBindings` is called on an `obj` like:
 *
 * ```js
 * var mixinMapBindings = require("can-event-queue/map/map");
 *
 * var observable = mixinValueBindings({});
 *
 * observable.on("prop",function(ev, newVal, oldVal){
 *   console.log(newVal);
 * });
 *
 * observable[canSymbol.for("can.dispatch")]("prop",[2,1]);
 * // Logs: 2
 * ```
 *
 * `mixinMapBindings` adds the following properties and symbols to the object:
 *
 * {{#each (getChildren [can-event-queue/map/map])}}
 * - [{{name}}] - {{description}}{{/each}}
 *
 * Furthermore, `mixinMapBindings` looks for the following symbols on the object's `.constructor`
 * property:
 *
 * - `@can.dispatchInstanceBoundChange` - Called when the bind status of an instance changes.
 * - `@can.dispatchInstanceOnPatches` - Called if [can-event-queue/map/map.dispatch] is called with `event.patches` as an array of
 *   patches.
 */
var canDev = require('can-log/dev/dev');
var queues = require("can-queues");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var KeyTree = require("can-key-tree");

var domEvents = require("can-dom-events");
var isDomEventTarget = require("can-dom-events/helpers/util").isDomEventTarget;

var mergeDependencyRecords = require("../dependency-record/merge");

var metaSymbol = canSymbol.for("can.meta"),
	dispatchBoundChangeSymbol = canSymbol.for("can.dispatchInstanceBoundChange"),
	dispatchInstanceOnPatchesSymbol = canSymbol.for("can.dispatchInstanceOnPatches"),
	onKeyValueSymbol = canSymbol.for("can.onKeyValue"),
	offKeyValueSymbol = canSymbol.for("can.offKeyValue"),
	onEventSymbol = canSymbol.for("can.onEvent"),
	offEventSymbol = canSymbol.for("can.offEvent"),
	onValueSymbol = canSymbol.for("can.onValue"),
	offValueSymbol = canSymbol.for("can.offValue"),
	inSetupSymbol = canSymbol.for("can.initializing");

var legacyMapBindings;

function addHandlers(obj, meta) {
	if (!meta.handlers) {
		// Handlers are organized by:
		// event name - the type of event bound to
		// binding type - "event" for things that expect an event object (legacy), "onKeyValue" for reflective bindings.
		// queue name - mutate, queue, etc
		// handlers - the handlers.
		meta.handlers = new KeyTree([Object, Object, Object, Array], {
			onFirst: function() {
				if (obj._eventSetup !== undefined) {
					obj._eventSetup();
				}
				var constructor = obj.constructor;
				if(constructor[dispatchBoundChangeSymbol] !== undefined && obj instanceof constructor) {
					constructor[dispatchBoundChangeSymbol](obj, true);
				}
				//queues.enqueueByQueue(getLifecycleHandlers(obj).getNode([]), obj, [true]);
			},
			onEmpty: function() {
				if (obj._eventTeardown !== undefined) {
					obj._eventTeardown();
				}
				var constructor = obj.constructor;
				if(constructor[dispatchBoundChangeSymbol] !== undefined && obj instanceof constructor) {
					constructor[dispatchBoundChangeSymbol](obj, false);
				}
				//queues.enqueueByQueue(getLifecycleHandlers(obj).getNode([]), obj, [false]);
			}
		});
	}

	if (!meta.listenHandlers) {
		// context, eventName (might be undefined), queue, handlers
		meta.listenHandlers = new KeyTree([Map, Map, Object, Array]);
	}
}


// getHandlers returns a KeyTree used for event handling.
// `handlers` will be on the `can.meta` symbol on the object.
// Ensure the "obj" passed as an argument has an object on @@can.meta
var ensureMeta = function ensureMeta(obj) {
	var meta = obj[metaSymbol];

	if (!meta) {
		meta = {};
		canReflect.setKeyValue(obj, metaSymbol, meta);
	}
	addHandlers(obj, meta);

	return meta;
};

function stopListeningArgumentsToKeys(bindTarget, event, handler, queueName) {
	if(arguments.length && canReflect.isPrimitive(bindTarget)) {
		queueName = handler;
		handler = event;
		event = bindTarget;
		bindTarget = this.context;
	}
	if(typeof event === "function") {
		queueName = handler;
		handler = event;
		event = undefined;
	}
	if(typeof handler === "string") {
		queueName = handler;
		handler = undefined;
	}
	var keys = [];
	if(bindTarget) {
		keys.push(bindTarget);
		if(event || handler || queueName) {
			keys.push(event);
			if(queueName || handler) {
				keys.push(queueName || this.defaultQueue);
				if(handler) {
					keys.push(handler);
				}
			}
		}
	}
	return keys;
}


// These are the properties we are going to add to objects
var props = {
	/**
	 * @function can-event-queue/map/map.dispatch dispatch
	 * @parent can-event-queue/map/map
	 *
	 * @description Dispatch event and key binding handlers.
	 *
	 * @signature `obj.dispatch(event, [args])`
	 *
	 * Dispatches registered [can-event-queue/map/map.addEventListener] and
	 * [can-event-queue/map/map.can.onKeyValue] value binding handlers.
	 *
	 * The following shows dispatching the `property` event and
	 * `keyValue` handlers:
	 *
	 *
	 * ```js
	 * var mixinMapBindings = require("can-event-queue/map/map");
	 *
	 * var obj = mixinMapBindings({});
	 *
	 * obj.addEventListener("property", function(event, newVal){
	 *   event.type //-> "property"
	 *   newVal     //-> 5
	 * });
	 *
	 * canReflect.onKeyValue("property", function(newVal){
	 *   newVal     //-> 5
	 * })
	 *
	 * obj.dispatch("property", [5]);
	 * ```
	 *
	 * > NOTE: Event handlers have an additional `event` argument.
	 *
	 * @param {String|Object} event The event to dispatch. If a string is passed,
	 *   it will be used as the `type` of the event that will be dispatched and dispatch matching
	 *   [can-event-queue/map/map.can.onKeyValue] bindings:
	 *
	 *   ```js
	 *   obs.dispatch("key")
	 *   ```
	 *
	 *   If `event` is an object, it __MUST__ have a `type` property. The If a string is passed,
	 *   it will be used as the `type` of the event that will be dispatched and dispatch matching
	 *   [can-event-queue/map/map.can.onKeyValue] bindings:
	 *
	 *   ```js
	 *   obs.dispatch({type: "key"})
	 *   ```
	 *
	 *   The `event` object can also have the following properties and values:
	 *   - __reasonLog__ `{Array}` - The reason this event happened. This will be passed to
	 *     [can-queues.enqueueByQueue] for debugging purposes.
	 *   - __makeMeta__ `{function}` - Details about the handler being called. This will be passed to
	 *     [can-queues.enqueueByQueue] for debugging purposes.
	 *   - __patches__ `{Array<Patch>}` - The patch objects this event represents.  The `.patches` value will be
	 *     passed to the object's `.constructor`'s `@can.dispatchInstanceOnPatches` method.
	 *
	 * @param {Array} [args] Additional arguments to pass to event handlers.
	 * @return {Object} event The resulting event object.
	 */
	dispatch: function(event, args) {
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			if (arguments.length > 4) {
				canDev.warn('Arguments to dispatch should be an array, not multiple arguments.');
				args = Array.prototype.slice.call(arguments, 1);
			}

			if (args && !Array.isArray(args)) {
				canDev.warn('Arguments to dispatch should be an array.');
				args = [args];
			}
		}
		//!steal-remove-end

		// Don't send events if initalizing.
		if (this.__inSetup !== true && this[inSetupSymbol] !== true) {
			if (typeof event === 'string') {
				event = {
					type: event
				};
			}

			var meta = ensureMeta(this);

			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				if (!event.reasonLog) {
					event.reasonLog = [canReflect.getName(this), "dispatched", '"' + event.type + '"', "with"].concat(args);
				}
			}

			if (typeof meta._log === "function") {
				meta._log.call(this, event, args);
			}
			//!steal-remove-end
			var handlers = meta.handlers;
			var handlersByType = event.type !== undefined && handlers.getNode([event.type]);
			var dispatchConstructorPatches = event.patches && this.constructor[dispatchInstanceOnPatchesSymbol];
			var patchesNode = event.patches !== undefined && handlers.getNode(["can.patches","onKeyValue"]);
			var keysNode = event.keyChanged !== undefined && handlers.getNode(["can.keys","onKeyValue"]);
			var batch = dispatchConstructorPatches || handlersByType || patchesNode || keysNode;
			if ( batch ) {
				queues.batch.start();
			}
			if(handlersByType) {
				if (handlersByType.onKeyValue) {
					queues.enqueueByQueue(handlersByType.onKeyValue, this, args, event.makeMeta, event.reasonLog);
				}
				if (handlersByType.event) {
					event.batchNum = queues.batch.number();
					var eventAndArgs = [event].concat(args);
					queues.enqueueByQueue(handlersByType.event, this, eventAndArgs, event.makeMeta, event.reasonLog);
				}
			}
			if(keysNode) {
				queues.enqueueByQueue(keysNode, this, [event.keyChanged], event.makeMeta, event.reasonLog);
			}
			if(patchesNode) {
				queues.enqueueByQueue(patchesNode, this, [event.patches], event.makeMeta, event.reasonLog);
			}
			if(dispatchConstructorPatches) {
				this.constructor[dispatchInstanceOnPatchesSymbol](this, event.patches);
			}
			if ( batch ) {
				queues.batch.stop();
			}
		}
		return event;
	},
	/**
	 * @function can-event-queue/map/map.addEventListener addEventListener
	 * @parent can-event-queue/map/map
	 *
	 * @description Register an event handler to be called when an event is dispatched.
	 *
	 * @signature `obj.addEventListener(eventName, handler(event, ...) [,queueName] )`
	 *
	 * Add a event listener to an object.  Handlers attached by `.addEventListener` get
	 * called back with the [can-event-queue/map/map.dispatch]
	 * `event` object and any arguments used to dispatch. [can-event-queue/map/map.can.onKeyValue] bindings do
	 * not get the event object.
	 *
	 * ```js
	 * var mixinMapBindings = require("can-event-queue/map/map");
	 *
	 * var obj = mixinMapBindings({});
	 *
	 * obj.addEventListener("foo", function(event){ ... });
	 * ```
	 *
	 * @param {String} eventName The name of the event to listen for.
	 * @param {Function} handler(event,arg...) The handler that will be executed to handle the event.  The handler will be called
	 *   with the dispatched `event` and `args`.
	 * @param {String} [queueName='mutate'] The name of the [can-queues] queue the handler will called
	 *   back within. Defaults to `"mutate"`.
	 * @return {Object} Returns the object `.addEventListener` was called on.
	 *
	 */
	addEventListener: function(key, handler, queueName) {
		ensureMeta(this).handlers.add([key, "event", queueName || "mutate", handler]);
		return this;
	},
	/**
	 * @function can-event-queue/map/map.removeEventListener removeEventListener
	 * @parent can-event-queue/map/map
	 *
	 * @description Unregister an event handler to be called when an event is dispatched.
	 *
	 * @signature `obj.removeEventListener(eventName, [handler [,queueName]] )`
	 *
	 * Removes one or more handlers from being called when `eventName`
	 * is [can-event-queue/map/map.dispatch]ed.
	 *
	 * ```js
	 * // Removes `handler` if it is in the notify queue.
	 * obj.removeEventListener("closed", handler, "notify")
	 *
	 * // Removes `handler` if it is in the mutate queue.
	 * obj.removeEventListener("closed", handler)
	 *
	 * // Removes all "closed" handlers.
	 * obj.removeEventListener("closed")
	 * ```
	 *
	 * @param {String} eventName The name of the event to remove. If not specified, all events are removed.
	 * @param {Function} [handler] The handler that will be removed from the event. If not specified, all handlers for the event are removed.
	 * @param {String} [queueName='mutate'] The name of the [can-queues] queue the handler was registered on. Defaults to `"mutate"`.
	 * @return {Object} Returns the object `.removeEventListener` was called on.
	 */
	removeEventListener: function(key, handler, queueName) {
		if(key === undefined) {
			// This isn't super fast, but this pattern isn't used much.
			// We could re-arrange the tree so it would be faster.
			var handlers = ensureMeta(this).handlers;
			var keyHandlers = handlers.getNode([]);
			Object.keys(keyHandlers).forEach(function(key){
				handlers.delete([key,"event"]);
			});
		} else if (!handler && !queueName) {
			ensureMeta(this).handlers.delete([key, "event"]);
		} else if (!handler) {
			ensureMeta(this).handlers.delete([key, "event", queueName || "mutate"]);
		} else {
			ensureMeta(this).handlers.delete([key, "event", queueName || "mutate", handler]);
		}
		return this;
	},
	/**
	 * @function can-event-queue/map/map.one one
	 * @parent can-event-queue/map/map
	 *
	 * @description Register an event handler that gets called only once.
	 *
	 * @signature `obj.one(event, handler(event, args...) )`
	 *
	 * Adds a basic event listener that listens to an event once and only once.
	 *
	 * ```js
	 * obj.one("prop", function(){
	 *   console.log("prop dispatched");
	 * })
	 *
	 * obj[canSymbol.for("prop")]("prop") //-> logs "prop dispatched"
	 * obj[canSymbol.for("prop")]("prop")
	 * ```
	 *
	 * @param {String} eventName The name of the event to listen to.
	 * @param {Function} handler(event, args...) The handler that will be run when the
	 *   event is dispached.
	 * @return {Object} this
	 */
	one: function(event, handler) {
		// Unbind the listener after it has been executed
		var one = function() {
			legacyMapBindings.off.call(this, event, one);
			return handler.apply(this, arguments);
		};

		// Bind the altered listener
		legacyMapBindings.on.call(this, event, one);
		return this;
	},
	/**
	 * @function can-event-queue/map/map.listenTo listenTo
	 * @parent can-event-queue/map/map
	 *
	 * @description Listen to an event and register the binding for simplified unbinding.
	 *
	 * @signature `obj.listenTo([bindTarget,] event, handler)`
	 *
	 * `.listenTo` is useful for creating bindings that can can be torn down with
	 * [can-event-queue/map/map.stopListening].  This is useful when creating
	 * rich behaviors that can't be accomplished using computed values, or if you are trying to
	 * avoid streams.
	 *
	 * For example, the following creates an observable that counts how many times its
	 * `name` property has changed:
	 *
	 * ```js
	 * class Person {
	 *   constructor(){
	 *     this.nameChanged = 0;
	 *     this.listenTo("name", function(){
	 *       this.nameChanged++;
	 *     })
	 *   },
	 *   setName(newVal) {
	 *     this.name = newVal;
	 *     this.dispatch("name",[newVal])
	 *   }
	 * }
	 * mixinMapBindings(Person.prototype);
	 *
	 * var person = new Person();
	 * person.setName("Justin");
	 * person.setName("Ramiya");
	 * person.nameChanged //-> 2
	 * ```
	 *
	 * `.listenTo` event bindings are stored on an observable and MUST be unbound using
	 * [can-event-queue/map/map.stopListening]. `.stopListening` make it easy to unbind
	 * all of the `.listenTo` event bindings when the observable is no longer needed:
	 *
	 * ```js
	 * person.stopListening();
	 * ```
	 *
	 * If no `bindTarget` is passed, `.listenTo` binds to the current
	 * observable.
	 *
	 * [can-component]'s `connectedCallback` lifecyle hook is often used to call
	 * `.listenTo` to setup bindings that update viewmodel properties.
	 *
	 *
	 * @param {Object} [bindTarget] The object to listen for events on.  If `bindTarget` is not provided,
	 * the observable `.listenTo` was called on will be the `bindTarget`.
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @return {Object} this
	 */
	listenTo: function (bindTarget, event, handler, queueName) {

		if(canReflect.isPrimitive(bindTarget)) {
			queueName = handler;
			handler = event;
			event = bindTarget;
			bindTarget = this;
		}

		if(typeof event === "function") {
			queueName = handler;
			handler = event;
			event = undefined;
		}

		// Initialize event cache
		ensureMeta(this).listenHandlers.add([bindTarget, event, queueName || "mutate", handler]);

		legacyMapBindings.on.call(bindTarget, event, handler, queueName || "mutate");
		return this;
	},
	/**
	 * @function can-event-queue/map/map.stopListening stopListening
	 * @parent can-event-queue/map/map
	 * @description Stops listening for registered event handlers.
	 *
	 * @signature `obj.stopListening( [bindTarget], [event,] handler]] )`
	 *
	 * `.stopListening` unbinds on event handlers registered through
	 * [can-event-queue/map/map.listenTo]. All event handlers
	 * that match the arguments will be unbound. For example:
	 *
	 * ```js
	 * // Unbinds all .listenTo registered handlers
	 * obj.stopListening()
	 *
	 * // Unbinds all .listenTo registered with `bindTarget`
	 * obj.stopListening(bindTarget)
	 *
	 * // Unbinds all .listenTo registered with `bindTarget`, `event`
	 * obj.stopListening(bindTarget, event)
	 *
	 * // Unbinds the handler registered with `bindTarget`, `event`, `handler`
	 * obj.stopListening(bindTarget, event, handler)
	 * ```
	 *
	 * `.listenTo` is often returned by [can-component]'s `connectedCallback` lifecyle hook.
	 *
	 * @param {Object} [bindTarget] The object we will stop listening to event on. If `bindTarget` is
	 * not provided, the observable `.stopListening` was called on will be the `bindTarget`.
	 * @param {String} [event] The name of the event to listen for.
	 * @param {Function} [handler] The handler that will be executed to handle the event.
	 * @return {Object} this
	 *
	 */
	stopListening: function () {
		var keys = stopListeningArgumentsToKeys.apply({context: this, defaultQueue: "mutate"}, arguments);

		var listenHandlers = ensureMeta(this).listenHandlers;

		function deleteHandler(bindTarget, event, queue, handler){
			legacyMapBindings.off.call(bindTarget, event, handler, queue);
		}
		listenHandlers.delete(keys, deleteHandler);

		return this;
	},
	/**
	 * @function can-event-queue/map/map.on on
	 * @parent can-event-queue/map/map
	 *
	 * @description A shorthand method for listening to event.
	 *
	 * @signature `obj.on( event, handler [, queue] )`
	 *
	 * Listen to when `obj` dispatches an event, a [can-reflect/observe.onKeyValue]
	 * change, or a [can-reflect/observe.onValue] change in that order.
	 *
	 * As this is the __legacy__ `.on`, it will look for an `.addEventListener`
	 * method on the `obj` first, before looking for the [can-symbol/symbols/onKeyValue]
	 * and then [can-symbol/symbols/onValue] symbol.
	 *
	 * @param {String} eventName
	 * @param {Function} handler
	 * @param {String} [queue]
	 * @return {Any} The object `on` was called on.
	 */
	on: function(eventName, handler, queue) {
		var listenWithDOM = isDomEventTarget(this);
		if (listenWithDOM) {
			if (typeof handler === 'string') {
				domEvents.addDelegateListener(this, eventName, handler, queue);
			} else {
				domEvents.addEventListener(this, eventName, handler, queue);
			}
		} else {
			if (this[onEventSymbol]) {
				this[onEventSymbol](eventName, handler, queue);
			} else if ("addEventListener" in this) {
				this.addEventListener(eventName, handler, queue);
			} else if (this[onKeyValueSymbol]) {
				canReflect.onKeyValue(this, eventName, handler, queue);
			} else {
				if (!eventName && this[onValueSymbol]) {
					canReflect.onValue(this, handler, queue);
				} else {
					throw new Error("can-event-queue: Unable to bind " + eventName);
				}
			}
		}
		return this;
	},
	/**
	 * @function can-event-queue/map/map.off off
	 * @parent can-event-queue/map/map
	 *
	 * @description A shorthand method for unbinding an event.
	 *
	 * @signature `obj.on( event, handler [, queue] )`
	 *
	 * Listen to when `obj` dispatches an event, a [can-reflect/observe.onKeyValue]
	 * change, or a [can-reflect/observe.onValue] change in that order.
	 *
	 * As this is the __legacy__ `.on`, it will look for an `.addEventListener`
	 * method on the `obj` first, before looking for the [can-symbol/symbols/onKeyValue]
	 * and then [can-symbol/symbols/onValue] symbol.
	 *
	 * @param {String} eventName
	 * @param {Function} handler
	 * @param {String} [queue]
	 * @return {Any} The object `on` was called on.
	 */
	off: function(eventName, handler, queue) {
		var listenWithDOM = isDomEventTarget(this);
		if (listenWithDOM) {
			if (typeof handler === 'string') {
				domEvents.removeDelegateListener(this, eventName, handler, queue);
			} else {
				domEvents.removeEventListener(this, eventName, handler, queue);
			}
		} else {
			if (this[offEventSymbol]) {
				this[offEventSymbol](eventName, handler, queue);
			} else if ("removeEventListener" in this) {
				this.removeEventListener(eventName, handler, queue);
			} else if (this[offKeyValueSymbol]) {
				canReflect.offKeyValue(this, eventName, handler, queue);
			} else {
				if (!eventName && this[offValueSymbol]) {
					canReflect.offValue(this, handler, queue);
				} else {
					throw new Error("can-event-queue: Unable to unbind " + eventName);
				}

			}
		}
		return this;
	}
};

// The symbols we'll add to objects
var symbols = {
	/**
	 * @function can-event-queue/map/map.can.onKeyValue @can.onKeyValue
	 * @parent can-event-queue/map/map
	 *
	 * @description Register an event handler to be called when a key value changes.
	 *
	 * @signature `canReflect.onKeyValue( obj, key, handler(newVal) [,queueName] )`
	 *
	 * Add a key change handler to an object.  Handlers attached by `.onKeyValue` get
	 * called back with the new value of the `key`. Handlers attached with [can-event-queue/map/map.can.addEventListener]
	 * get the event object.
	 *
	 * ```js
	 * var mixinMapBindings = require("can-event-queue/map/map");
	 *
	 * var obj = mixinMapBindings({});
	 *
	 * canReflect.onKeyValue( obj, "prop", function(newPropValue){ ... });
	 * ```
	 *
	 * @param {String} key The name of property to listen to changes in values.
	 * @param {Function} handler(newVal, oldValue) The handler that will be called
	 *   back with the new and old value of the key.
	 * @param {String} [queueName='mutate'] The name of the [can-queues] queue the handler will called
	 *   back within. Defaults to `"mutate"`.
	 */
	"can.onKeyValue": function(key, handler, queueName) {
		ensureMeta(this).handlers.add([key, "onKeyValue", queueName || "mutate", handler]);
	},
	/**
	 * @function can-event-queue/map/map.can.offKeyValue @can.offKeyValue
	 * @parent can-event-queue/map/map
	 *
	 * @description Unregister an event handler to be called when an event is dispatched.
	 *
	 * @signature `canReflect.offKeyValue( obj, key, handler, queueName )`
	 *
	 * Removes a handlers from being called when `key` changes are
	 * [can-event-queue/map/map.dispatch]ed.
	 *
	 * ```js
	 * // Removes `handler` if it is in the notify queue.
	 * canReflect.offKeyValue( obj, "prop", handler, "notify" )
	 * ```
	 *
	 * @param {String} eventName The name of the event to remove. If not specified, all events are removed.
	 * @param {Function} [handler] The handler that will be removed from the event. If not specified, all handlers for the event are removed.
	 * @param {String} [queueName='mutate'] The name of the [can-queues] queue the handler was registered on. Defaults to `"mutate"`.
	 */
	"can.offKeyValue": function(key, handler, queueName) {
		ensureMeta(this).handlers.delete([key, "onKeyValue", queueName || "mutate", handler]);
	},
	/**
	 * @function can-event-queue/map/map.can.isBound @can.isBound
	 * @parent can-event-queue/map/map
	 *
	 * @description Return if the observable is bound to.
	 *
	 * @signature `canReflect.isBound(obj)`
	 *
	 * The `@can.isBound` symbol is added to make [can-reflect/observe.isBound]
	 * return if `obj` is bound or not.
	 *
	 * @return {Boolean} True if the observable has been bound to with `.onKeyValue` or `.addEventListener`.
	 */
	"can.isBound": function() {
		return !ensureMeta(this).handlers.isEmpty();
	},
	/**
	 * @function can-event-queue/map/map.can.getWhatIChange @can.getWhatIChange
	 * @parent can-event-queue/map/map
	 *
	 * @description Return observables whose values are affected by attached event handlers
	 * @signature `@can.getWhatIChange(key)`
	 *
	 * The `@@can.getWhatIChange` symbol is added to make sure [can-debug] can report
	 * all the observables whose values are set by a given observable's key.
	 *
	 * This function iterates over the event handlers attached to a given `key` and
	 * collects the result of calling `@@can.getChangesDependencyRecord` on each handler;
	 * this symbol allows the caller to tell what observables are being mutated by
	 * the event handler when it is executed.
	 *
	 * In the following example a [can-simple-map] instance named `me` is created
	 * and when its `age` property changes, the value of a [can-simple-observable]
	 * instance is set. The event handler that causes the mutation is then decatorated
	 * with `@@can.getChangesDependencyRecord` to register the mutation dependency.
	 *
	 * ```js
	 * var obs = new SimpleObservable("a");
	 * var me = new SimpleMap({ age: 30 });
	 * var canReflect = require("can-reflect");
	 *
	 * var onAgeChange = function onAgeChange() {
	 *	canReflect.setValue(obs, "b");
	 * };
	 *
	 * onAgeChange[canSymbol.for("can.getChangesDependencyRecord")] = function() {
	 *	return {
	 *		valueDependencies: new Set([ obs ]);
	 *	}
	 * };
	 *
	 * canReflect.onKeyValue(me, "age", onAgeChange);
	 * me[canSymbol.for("can.getWhatIChange")]("age");
	 * ```
	 *
	 * The dependency records collected from the event handlers are divided into
	 * two categories:
	 *
	 * - mutate: Handlers in the mutate/domUI queues
	 * - derive: Handlers in the notify queue
	 *
	 * Since event handlers are added by default to the "mutate" queue, calling
	 * `@@can.getWhatIChange` on the `me` instance returns an object with a mutate
	 * property and the `valueDependencies` Set registered on the `onAgeChange`
	 * handler.
	 *
	 * Please check out the [can-reflect-dependencies] docs to learn more about
	 * how this symbol is used to keep track of custom observable dependencies.
	 */
	"can.getWhatIChange": function getWhatIChange(key) {
		//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
			var whatIChange = {};
			var meta = ensureMeta(this);

			var notifyHandlers = [].concat(
				meta.handlers.get([key, "event", "notify"]),
				meta.handlers.get([key, "onKeyValue", "notify"])
			);

			var mutateHandlers = [].concat(
				meta.handlers.get([key, "event", "mutate"]),
				meta.handlers.get([key, "event", "domUI"]),
				meta.handlers.get([key, "onKeyValue", "mutate"]),
				meta.handlers.get([key, "onKeyValue", "domUI"])
			);

			if (notifyHandlers.length) {
				notifyHandlers.forEach(function(handler) {
					var changes = canReflect.getChangesDependencyRecord(handler);

					if (changes) {
						var record = whatIChange.derive;
						if (!record) {
							record = (whatIChange.derive = {});
						}
						mergeDependencyRecords(record, changes);
					}
				});
			}

			if (mutateHandlers.length) {
				mutateHandlers.forEach(function(handler) {
					var changes = canReflect.getChangesDependencyRecord(handler);

					if (changes) {
						var record = whatIChange.mutate;
						if (!record) {
							record = (whatIChange.mutate = {});
						}
						mergeDependencyRecords(record, changes);
					}
				});
			}

			return Object.keys(whatIChange).length ? whatIChange : undefined;
		}
		//!steal-remove-end
	},
	"can.onPatches": function(handler, queue) {
		var handlers = ensureMeta(this).handlers;
		handlers.add(["can.patches", "onKeyValue", queue || "notify", handler]);
	},
	"can.offPatches": function(handler, queue) {
		var handlers = ensureMeta(this).handlers;
		handlers.delete(["can.patches", "onKeyValue", queue || "notify", handler]);
	}
};

// This can be removed in a future version.
function defineNonEnumerable(obj, prop, value) {
	Object.defineProperty(obj, prop, {
		enumerable: false,
		value: value
	});
}

// The actual legacyMapBindings mixin function
legacyMapBindings = function(obj) {
	// add properties
	canReflect.assignMap(obj, props);
	// add symbols
	return canReflect.assignSymbols(obj, symbols);
};

defineNonEnumerable(legacyMapBindings, "addHandlers", addHandlers);
defineNonEnumerable(legacyMapBindings, "stopListeningArgumentsToKeys", stopListeningArgumentsToKeys);



// ## LEGACY
// The following is for compatability with the old can-event
props.bind = props.addEventListener;
props.unbind = props.removeEventListener;



// Adds methods directly to method so it can be used like `can-event` used to be used.
canReflect.assignMap(legacyMapBindings, props);
canReflect.assignSymbols(legacyMapBindings, symbols);

defineNonEnumerable(legacyMapBindings, "start", function() {
	console.warn("use can-queues.batch.start()");
	queues.batch.start();
});
defineNonEnumerable(legacyMapBindings, "stop", function() {
	console.warn("use can-queues.batch.stop()");
	queues.batch.stop();
});
defineNonEnumerable(legacyMapBindings, "flush", function() {
	console.warn("use can-queues.flush()");
	queues.flush();
});

defineNonEnumerable(legacyMapBindings, "afterPreviousEvents", function(handler) {
	console.warn("don't use afterPreviousEvents");
	queues.mutateQueue.enqueue(function afterPreviousEvents() {
		queues.mutateQueue.enqueue(handler);
	});
	queues.flush();
});

defineNonEnumerable(legacyMapBindings, "after", function(handler) {
	console.warn("don't use after");
	queues.mutateQueue.enqueue(handler);
	queues.flush();
});

module.exports = legacyMapBindings;
