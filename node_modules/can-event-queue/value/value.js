"use strict";
var queues = require("can-queues");
var KeyTree = require("can-key-tree");
var canReflect = require("can-reflect");
var defineLazyValue = require("can-define-lazy-value");
var mergeDependencyRecords = require("../dependency-record/merge");

var properties = {
	/**
	 * @function can-event-queue/value/value.on on
	 * @parent can-event-queue/value/value
	 *
	 * @description Listen to changes in the observable's value.
	 *
	 * @signature `.on( handler[, queue='mutate'] )`
	 *
	 * This adds an event handler in the observable's [can-event-queue/value/value.handlers]
	 * tree. If this is the first handler, the observable's [can-event-queue/value/value.onBound] method is called.
	 *
	 * ```js
	 * observable.on(function(newVal){ ... });
	 * observable.on(function(newVal){ ... }, "notify");
	 * ```
	 *
	 * @param {function(*)} handler(newValue,oldValue) A handler that will be called with the new value of the
	 * observable and optionally the old value of the observable.
	 * @param {String} [queue] The [can-queues] queue this event handler should be bound to.  By default the handler will
	 * be called within the `mutate` queue.
	 */
	on: function(handler, queue) {
		this.handlers.add([queue || "mutate", handler]);
	},
	/**
	 * @function can-event-queue/value/value.off off
	 * @parent can-event-queue/value/value
	 *
	 * @description Stop listening to changes in the observable's value.
	 *
	 * @signature `.off( [handler [, queue='mutate']] )`
	 *
	 * Removes one or more event handler in the observable's [can-event-queue/value/value.handlers]
	 * tree. If the las handler is removed, the observable's [can-event-queue/value/value.onUnbound] method is called.
	 *
	 * ```js
	 * observable.off(function(newVal){ ... });
	 * observable.off(function(newVal){ ... }, "notify");
	 * observable.off();
	 * observable.off(undefined, "mutate");
	 * ```
	 *
	 * @param {function(*)} handler(newValue,oldValue) The handler to be removed.  If no handler is provided and no
	 * `queue` is provided, all handlers will be removed.
	 * @param {String} [queue] The [can-queues] queue this event handler should be removed from.
	 *
	 *  If a `handler` is
	 *  provided and no `queue` is provided, the `queue` will default to `"mutate"`.
	 *
	 *   If a `handler` is not provided, but a `queue` is provided, all handlers for the provided queue will be
	 *   removed.
	 */
	off: function(handler, queueName) {
		if (handler === undefined) {
			if (queueName === undefined) {
				this.handlers.delete([]);
			} else {
				this.handlers.delete([queueName]);
			}
		} else {
			this.handlers.delete([queueName || "mutate", handler]);
		}
	}
};

var symbols = {
	/**
	 * @function can-event-queue/value/value.can.onValue @can.onValue
	 * @parent can-event-queue/value/value
	 *
	 * @description Listen to changes in this observable value.
	 *
	 * This is an alias for [can-event-queue/value/value.on].  It satisfies [can-reflect].[can-reflect/observe.onValue].
	 */
	"can.onValue": properties.on,
	/**
	 * @function can-event-queue/value/value.can.offValue @can.offValue
	 * @parent can-event-queue/value/value
	 *
	 * @description Stop listening to changes in this observable value.
	 *
	 * This is an alias for [can-event-queue/value/value.off].  It satisfies [can-reflect].[can-reflect/observe.offValue].
	 */
	"can.offValue": properties.off,
	/**
	 * @function can-event-queue/value/value.can.dispatch @can.dispatch
	 * @parent can-event-queue/value/value
	 *
	 * @description Dispatch all event handlers within their appropriate queues.
	 *
	 * @signature `@can.dispatch(newValue, oldValue)`
	 *
	 * This is a helper method that will dispatch all [can-event-queue/value/value.handlers] within
	 * their appropriate [can-queues] queue.
	 *
	 * Furthermore, it will make sure the handlers include useful meta data for debugging.
	 *
	 * ```js
	 * var observable = mixinValueBindings({});
	 * observable[canSymbol.for("can.dispatch")]( 2, 1 );
	 * ```
	 *
	 * @param {Any} newValue The new value of the observable.
	 * @param {Any} oldValue The old value of the observable.
	 */
	"can.dispatch": function(value, old) {
		var queuesArgs = [];
		queuesArgs = [
			this.handlers.getNode([]),
			this,
			[value, old]
		];

		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			queuesArgs = [
				this.handlers.getNode([]),
				this,
				[value, old]
				/* jshint laxcomma: true */
				, null
				, [canReflect.getName(this), "changed to", value, "from", old]
				/* jshint laxcomma: false */
			];
		}
		//!steal-remove-end
		queues.enqueueByQueue.apply(queues, queuesArgs);
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			if (typeof this._log === "function") {
				this._log(old, value);
			}
		}
		//!steal-remove-end
	},
	/**
	 * @function can-event-queue/value/value.can.getWhatIChange @can.getWhatIChange
	 * @parent can-event-queue/value/value
	 *
	 * @description Return observables whose values are affected by attached event handlers
	 * @signature `@can.getWhatIChange()`
	 *
	 * The `@@can.getWhatIChange` symbol is added to make sure [can-debug] can report
	 * all the observables whose values are set by value-like observables.
	 *
	 * This function iterates over the event handlers attached to  the observable's value
	 * event and collects the result of calling `@@can.getChangesDependencyRecord` on each
	 * handler; this symbol allows the caller to tell what observables are being mutated
	 * by the event handler when it is executed.
	 *
	 * In the following example a [can-simple-observable] instance named `month` is
	 * created and when its value changes the `age` property of the `map` [can-simple-map]
	 * instance is set. The event handler that causes the mutation is then decatorated with
	 * `@@can.getChangesDependencyRecord` to register the mutation dependency.
	 *
	 * ```js
	 * var month = new SimpleObservable(11);
	 * var map = new SimpleMap({ age: 30 });
	 * var canReflect = require("can-reflect");
	 *
	 * var onValueChange = function onValueChange() {
	 *	map.set("age", 31);
	 * };
	 *
	 * onValueChange[canSymbol.for("can.getChangesDependencyRecord")] = function() {
	 *	return {
	 *		keyDependencies: new Map([ [map, new Set(["age"])] ])
	 *	}
	 * };
	 *
	 * canReflect.onValue(month, onValueChange);
	 * month[canSymbol.for("can.getWhatIChange")]();
	 * ```
	 *
	 * The dependency records collected from the event handlers are divided into
	 * two categories:
	 *
	 * - mutate: Handlers in the mutate/domUI queues
	 * - derive: Handlers in the notify queue
	 *
	 * Since event handlers are added by default to the "mutate" queue, calling
	 * `@@can.getWhatIChange` on the `month` instance returns an object with a mutate
	 * property and the `keyDependencies` Map registered on the `onValueChange` handler.
	 *
	 * If multiple event handlers were attached to `month`, the dependency records
	 * of each handler are merged by `@@can.getWhatIChange`. Please check out the
	 * [can-reflect-dependencies] docs to learn more about how this symbol is used
	 * to keep track of custom observable dependencies.
	 */
	"can.getWhatIChange": function getWhatIChange() {
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			var whatIChange = {};

			var notifyHandlers = this.handlers.get(["notify"]);
			var mutateHandlers = [].concat(
				this.handlers.get(["mutate"]),
				this.handlers.get(["domUI"]),
				this.handlers.get(["dom"])
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

	/**
	 * @function can-event-queue/value/value.can.isBound @can.isBound
	 * @parent can-event-queue/value/value
	 */
	"can.isBound": function isBound() {
		return !this.handlers.isEmpty();
	}
};

/**
 * @property {can-key-tree} can-event-queue/value/value.handlers handlers
 * @parent can-event-queue/value/value
 *
 * @description Access the handlers tree directly.
 *
 * @type {can-key-tree}
 *
 *  The handlers property is a [can-define-lazy-value lazily] defined property containing
 *  all handlers bound with [can-event-queue/value/value.on] and
 *  [can-event-queue/value/value.can.onValue].  It is a [can-key-tree] defined like:
 *
 *  ```js
 *  this.handlers = new KeyTree([Object, Array])
 *  ```
 *
 *  It is configured to call [can-event-queue/value/value.onBound] and
 *  [can-event-queue/value/value.onUnbound] on the instances when the first item is
 *  added to the tree and when the tree is emptied.
 */
function defineLazyHandlers(){
	return new KeyTree([Object, Array], {
		onFirst: this.onBound !== undefined && this.onBound.bind(this),
		onEmpty: this.onUnbound !== undefined && this.onUnbound.bind(this)
	});
}

/**
 * @function can-event-queue/value/value.onBound onBound
 * @parent can-event-queue/value/value
 *
 * @description Perform operations when an observable is gains its first event handler.
 *
 * @signature `.onBound()`
 *
 * This method is not implemented by `can-event-queue/value/value`. Instead, the object
 * should implement it if it wants to perform some actions when it becomes bound.
 *
 * ```js
 * var mixinValueBindings = require("can-event-queue/value/value");
 *
 * var observable = mixinValueBindings({
 *   onBound: function(){
 *     console.log("I AM BOUND!");
 *   }
 * });
 *
 * observable.on(function(){});
 * // Logs: "I AM BOUND!"
 * ```
 *
 */

/**
 * @function can-event-queue/value/value.onUnbound onUnbound
 * @parent can-event-queue/value/value
 *
 * @description Perform operations when an observable loses all of its event handlers.
 *
 * @signature `.onBound()`
 *
 * This method is not implemented by `can-event-queue/value/value`. Instead, the object
 * should implement it if it wants to perform some actions when it becomes unbound.
 *
 * ```js
 * var mixinValueBindings = require("can-event-queue/value/value");
 *
 * var observable = mixinValueBindings({
 *   onUnbound: function(){
 *     console.log("I AM UNBOUND!");
 *   }
 * });
 * var handler = function(){}
 * observable.on(function(){});
 * observable.off(function(){});
 * // Logs: "I AM UNBOUND!"
 * ```
 */

/**
 * @module {function} can-event-queue/value/value
 * @parent can-event-queue
 *
 * @description Mixin methods and symbols to make this object or prototype object
 * behave like a single-value observable.
 *
 * @signature `mixinValueBindings( obj )`
 *
 * Adds symbols and methods that make `obj` or instances having `obj` on their prototype
 * behave like single-value observables.
 *
 * When `mixinValueBindings` is called on an `obj` like:
 *
 * ```js
 * var mixinValueBindings = require("can-event-queue/value/value");
 *
 * var observable = mixinValueBindings({});
 *
 * observable.on(function(newVal, oldVal){
 *   console.log(newVal);
 * });
 *
 * observable[canSymbol.for("can.dispatch")](2,1);
 * // Logs: 2
 * ```
 *
 * `mixinValueBindings` adds the following properties and symbols to the object:
 *
 * - [can-event-queue/value/value.on]
 * - [can-event-queue/value/value.off]
 * - [can-event-queue/value/value.can.dispatch]
 * - [can-event-queue/value/value.can.getWhatIChange]
 * - [can-event-queue/value/value.handlers]
 *
 * When the object is bound to for the first time with `.on` or `@can.onValue`, it will look for an [can-event-queue/value/value.onBound]
 * function on the object and call it.
 *
 * When the object is has no more handlers, it will look for an [can-event-queue/value/value.onUnbound]
 * function on the object and call it.
 */
var mixinValueEventBindings = function(obj) {
	canReflect.assign(obj, properties);
	canReflect.assignSymbols(obj, symbols);
	defineLazyValue(obj,"handlers",defineLazyHandlers, true);
	return obj;
};

// callbacks is optional
mixinValueEventBindings.addHandlers = function(obj, callbacks) {
	console.warn("can-event-queue/value: Avoid using addHandlers. Add onBound and onUnbound methods instead.");
	obj.handlers = new KeyTree([Object, Array], callbacks);
	return obj;
};

module.exports = mixinValueEventBindings;
