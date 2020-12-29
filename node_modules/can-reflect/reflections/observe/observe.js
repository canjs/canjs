"use strict";
var canSymbol = require("can-symbol");

var slice = [].slice;

function makeFallback(symbolName, fallbackName) {
	return function(obj, event, handler, queueName){
		var method = obj[canSymbol.for(symbolName)];
		if(method !== undefined) {
			return method.call(obj, event, handler, queueName);
		}
		return this[fallbackName].apply(this, arguments);
	};
}

function makeErrorIfMissing(symbolName, errorMessage){
	return function(obj){
		var method = obj[canSymbol.for(symbolName)];
		if(method !== undefined) {
			var args = slice.call(arguments, 1);
			return method.apply(obj, args);
		}
		throw new Error(errorMessage);
	};
}

module.exports = {
	// KEY
	/**
	 * @function {Object, String, function(*, *), String} can-reflect/observe.onKeyValue onKeyValue
	 * @parent can-reflect/observe
	 * @description  Register an event handler on a MapLike object, based on a key change
	 *
	 * @signature `onKeyValue(obj, key, handler, [queueName])`
	 *
	 * Register a handler on the Map-like object `obj` to trigger when the property key `key` changes.
	 * `obj` *must* implement [can-symbol/symbols/onKeyValue @@@@can.onKeyValue] to be compatible with
	 * can-reflect.onKeyValue.  The function passed as `handler` will receive the new value of the property
	 * as the first argument, and the previous value of the property as the second argument.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * canReflect.onKeyValue(obj, "foo", function(newVal, oldVal) {
	 * 	console.log("foo is now", newVal, ", was", oldVal);
	 * });
	 *
	 * obj.foo = "baz";  // -> logs "foo is now baz , was bar"
	 * ```
	 *
	 * @param {Object} obj an observable MapLike that can listen to changes in named properties.
	 * @param {String} key  the key to listen to
	 * @param {function(*, *)} handler a callback function that recieves the new value
	 * @param {String} [queueName]  the queue to dispatch events to
	 */
	onKeyValue: makeFallback("can.onKeyValue", "onEvent"),
	/**
	 * @function {Object, String, function(*), String} can-reflect/observe.offKeyValue offKeyValue
	 * @parent can-reflect/observe
	 * @description  Unregister an event handler on a MapLike object, based on a key change
	 *
	 * @signature `offKeyValue(obj, key, handler, [queueName])`
	 *
	 * Unregister a handler from the Map-like object `obj` that had previously been registered with
	 * [can-reflect/observe.onKeyValue onKeyValue]. The function passed as `handler` will no longer be called
	 * when the value of `key` on `obj` changes.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * var handler = function(newVal, oldVal) {
	 * 	console.log("foo is now", newVal, ", was", oldVal);
	 * };
	 *
	 * canReflect.onKeyValue(obj, "foo", handler);
	 * canReflect.offKeyValue(obj, "foo", handler);
	 *
	 * obj.foo = "baz";  // -> nothing is logged
	 * ```
	 *
	 * @param {Object} obj an observable MapLike that can listen to changes in named properties.
	 * @param {String} key  the key to stop listening to
	 * @param {function(*)} handler the callback function that should be removed from the event handlers for `key`
	 * @param {String} [queueName]  the queue that the handler was set to receive events from
	 */
	offKeyValue: makeFallback("can.offKeyValue","offEvent"),

	/**
	 * @function {Object, function(Array)} can-reflect/observe.onKeys onKeys
	 * @parent can-reflect/observe
	 * @description  Register an event handler on a MapLike object, triggered on the key set changing
	 *
	 * @signature `onKeys(obj, handler)`
	 *
	 * Register an event handler on the Map-like object `obj` to trigger when `obj`'s keyset changes.
	 * `obj` *must* implement [can-symbol/symbols/onKeys @@@@can.onKeys] to be compatible with
	 * can-reflect.onKeys.  The function passed as `handler` will receive an Array of object diffs (see
	 * [can-util/js/diff-object/diff-object diffObject] for the format) as its one argument.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * canReflect.onKeys(obj, function(diffs) {
	 * 	console.log(diffs);
	 * });
	 *
	 * obj.set("baz", "quux");  // -> logs '[{"property": "baz", "type": "add", "value": "quux"}]'
	 * ```
	 *
	 * @param {Object} obj an observable MapLike that can listen to changes in named properties.
	 * @param {function(Array)} handler the callback function to receive the diffs in the key set
	 */
	// any key change (diff would normally happen)
	onKeys: makeErrorIfMissing("can.onKeys","can-reflect: can not observe an onKeys event"),
	/**
	 * @function {Object, function(Array)} can-reflect/observe.onKeysAdded onKeysAdded
	 * @parent can-reflect/observe
	 * @description  Register an event handler on a MapLike object, triggered on new keys being added.
	 *
	 * @signature `onKeysAdded(obj, handler)`
	 *
	 * Register an event handler on the Map-like object `obj` to trigger when a new key or keys are set on
	 * `obj`. `obj` *must* implement [can-symbol/symbols/onKeysAdded @@@@can.onKeysAdded] to be compatible with
	 * can-reflect.onKeysAdded.  The function passed as `handler` will receive an Array of Strings as its one
	 * argument.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * canReflect.onKeysAded(obj, function(newKeys) {
	 * 	console.log(newKeys);
	 * });
	 *
	 * foo.set("baz", "quux");  // -> logs '["baz"]'
	 * ```
	 *
	 * @param {Object} obj an observable MapLike that can listen to changes in named properties.
	 * @param {function(Array)} handler the callback function to receive the array of added keys
	 */
	// keys added at a certain point {key: 1}, index
	onKeysAdded: makeErrorIfMissing("can.onKeysAdded","can-reflect: can not observe an onKeysAdded event"),
	/**
	 * @function {Object, function(Array)} can-reflect/observe.onKeysRemoved onKeysRemoved
	 * @parent can-reflect/observe
	 * @description  Register an event handler on a MapLike object, triggered on keys being deleted.
	 *
	 * @signature `onKeysRemoved(obj, handler)`
	 *
	 * Register an event handler on the Map-like object `obj` to trigger when a key or keys are removed from
	 * `obj`'s keyset. `obj` *must* implement [can-symbol/symbols/onKeysRemoved @@@@can.onKeysRemoved] to be
	 * compatible with can-reflect.onKeysAdded.  The function passed as `handler` will receive an Array of
	 * Strings as its one argument.
	 *
	 * ```js
	 * var obj = new CanMap({ foo: "bar" });
	 * canReflect.onKeys(obj, function(diffs) {
	 * 	console.log(JSON.stringify(diffs));
	 * });
	 *
	 * foo.removeAttr("foo");  // -> logs '["foo"]'
	 * ```
	 *
	 * @param {Object} obj an observable MapLike that can listen to changes in named properties.
	 * @param {function(Array)} handler the callback function to receive the array of removed keys
	 */
	onKeysRemoved: makeErrorIfMissing("can.onKeysRemoved","can-reflect: can not unobserve an onKeysRemoved event"),

	/**
	 * @function {Object, String} can-reflect/observe.getKeyDependencies getKeyDependencies
	 * @parent can-reflect/observe
	 * @description  Return the observable objects that compute to the value of a named property on an object
	 *
	 * @signature `getKeyDependencies(obj, key)`
	 *
	 * Return the observable objects that provide input values to generate the computed value of the
	 * property `key` on Map-like object `obj`.  If `key` does not have dependencies on `obj`, returns `undefined`.
	 * Otherwise returns an object with up to two keys: `keyDependencies` is a [can-util/js/cid-map/cid-map CIDMap] that
	 * maps each Map-like object providing keyed values to an Array of the relevant keys; `valueDependencies` is a
	 * [can-util/js/cid-set/cid-set CIDSet] that contains all Value-like dependencies providing their own values.
	 *
	 * `obj` *must* implement [can-symbol/symbols/getKeyDependencies @@@@can.getKeyDependencies] to work with
	 * `canReflect.getKeyDependencies`.
	 *
	 *
	 * ```js
	 * var foo = new DefineMap({ "bar": "baz" })
	 * var obj = new (DefineMap.extend({
	 * 	 baz: {
	 * 	   get: function() {
	 * 	     return foo.bar;
	 * 	   }
	 * 	 }
	 * }))();
	 *
	 * canReflect.getKeyDependencies(obj, "baz");  // -> { valueDependencies: CIDSet }
	 * ```
	 *
	 * @param {Object} obj the object to check for key dependencies
	 * @param {String} key the key on the object to check
	 * @return {Object} the observable values that this keyed value depends on
	 */
	getKeyDependencies: makeErrorIfMissing("can.getKeyDependencies", "can-reflect: can not determine dependencies"),

	/**
	 * @function {Object, String} can-reflect/observe.getWhatIChange getWhatIChange
	 * @hide
	 * @parent can-reflect/observe
	 * @description Return the observable objects that derive their value from the
	 * obj, passed in.
	 *
	 * @signature `getWhatIChange(obj, key)`
	 *
	 * `obj` *must* implement `@@@@can.getWhatIChange` to work with
	 * `canReflect.getWhatIChange`.
	 *
	 * @param {Object} obj the object to check for what it changes
	 * @param {String} [key] the key on the object to check
	 * @return {Object} the observable values that derive their value from `obj`
	 */
	getWhatIChange: makeErrorIfMissing(
		"can.getWhatIChange",
		"can-reflect: can not determine dependencies"
	),

	/**
	 * @function {Function} can-reflect/observe.getChangesDependencyRecord getChangesDependencyRecord
	 * @hide
	 * @parent can-reflect/observe
	 * @description Return the observable objects that are mutated by the handler
	 * passed in as argument.
	 *
	 * @signature `getChangesDependencyRecord(handler)`
	 *
	 * `handler` *must* implement `@@@@can.getChangesDependencyRecord` to work with
	 * `canReflect.getChangesDependencyRecord`.
	 *
	 * ```js
	 * var one = new SimpleObservable("one");
	 * var two = new SimpleObservable("two");
	 *
	 * var handler = function() {
	 *	two.set("2");
	 * };
	 *
	 * canReflect.onValue(one, handler);
	 * canReflect.getChangesDependencyRecord(handler); // -> { valueDependencies: new Set([two]) }
	 * ```
	 *
	 * @param {Function} handler the event handler to check for what it changes
	 * @return {Object} the observable values that are mutated by the handler
	 */
	getChangesDependencyRecord: function getChangesDependencyRecord(handler) {
		var fn = handler[canSymbol.for("can.getChangesDependencyRecord")];

		if (typeof fn === "function") {
			return fn();
		}
	},

	/**
	 * @function {Object, String} can-reflect/observe.keyHasDependencies keyHasDependencies
	 * @parent can-reflect/observe
	 * @description  Determine whether the value for a named property on an object is bound to other events
	 *
	 * @signature `keyHasDependencies(obj, key)`
	 *
	 * Returns `true` if the computed value of the property `key` on Map-like object `obj` derives from other values.
	 * Returns `false` if `key` is computed on `obj` but does not have dependencies on other objects. If `key` is not
	 * a computed value on `obj`, returns `undefined`.
	 *
	 * `obj` *must* implement [can-symbol/symbols/keyHasDependencies @@@@can.keyHasDependencies] to work with
	 * `canReflect.keyHasDependencies`.
	 *
	 * ```js
	 * var foo = new DefineMap({ "bar": "baz" })
	 * var obj = new (DefineMap.extend({
	 * 	 baz: {
	 * 	   get: function() {
	 * 	     return foo.bar;
	 * 	   }
	 * 	 },
	 * 	 quux: {
	 * 	 	 get: function() {
	 * 	 	   return "thud";
	 * 	 	 }
	 * 	 }
	 * }))();
	 *
	 * canReflect.keyHasDependencies(obj, "baz");  // -> true
	 * canReflect.keyHasDependencies(obj, "quux");  // -> false
	 * canReflect.keyHasDependencies(foo, "bar");  // -> undefined
	 * ```
	 *
	 * @param {Object} obj the object to check for key dependencies
	 * @param {String} key the key on the object to check
	 * @return {Boolean} `true` if there are other objects that may update the keyed value; `false` otherwise
	 *
	 */
	// TODO: use getKeyDeps once we know what that needs to look like
	keyHasDependencies: makeErrorIfMissing("can.keyHasDependencies","can-reflect: can not determine if this has key dependencies"),

	// VALUE
	/**
	 * @function {Object, function(*)} can-reflect/observe.onValue onValue
	 * @parent can-reflect/observe
	 * @description  Register an event handler on an observable ValueLike object, based on a change in its value
	 *
	 * @signature `onValue(handler, [queueName])`
	 *
	 * Register an event handler on the Value-like object `obj` to trigger when its value changes.
	 * `obj` *must* implement [can-symbol/symbols/onValue @@@@can.onValue] to be compatible with
	 * can-reflect.onKeyValue.  The function passed as `handler` will receive the new value of `obj`
	 * as the first argument, and the previous value of `obj` as the second argument.
	 *
	 * ```js
	 * var obj = canCompute("foo");
	 * canReflect.onValue(obj, function(newVal, oldVal) {
	 * 	console.log("compute is now", newVal, ", was", oldVal);
	 * });
	 *
	 * obj("bar");  // -> logs "compute is now bar , was foo"
	 * ```
	 *
	 * @param {*} obj  any object implementing @@can.onValue
	 * @param {function(*, *)} handler  a callback function that receives the new and old values
	 */
	onValue: makeErrorIfMissing("can.onValue","can-reflect: can not observe value change"),
	/**
	 * @function {Object, function(*)} can-reflect/observe.offValue offValue
	 * @parent can-reflect/observe
	 * @description  Unregister an value change handler from an observable ValueLike object
	 *
	 * @signature `offValue(handler, [queueName])`
	 *
	 * Unregister an event handler from the Value-like object `obj` that had previously been registered with
	 * [can-reflect/observe.onValue onValue]. The function passed as `handler` will no longer be called
	 * when the value of `obj` changes.
	 *
	 * ```js
	 * var obj = canCompute( "foo" );
	 * var handler = function(newVal, oldVal) {
	 * 	console.log("compute is now", newVal, ", was", oldVal);
	 * };
	 *
	 * canReflect.onKeyValue(obj, handler);
	 * canReflect.offKeyValue(obj, handler);
	 *
	 * obj("baz");  // -> nothing is logged
	 * ```
	 *
	 * @param {*} obj
	 * @param {function(*)} handler
	 */
	offValue: makeErrorIfMissing("can.offValue","can-reflect: can not unobserve value change"),

	/**
	 * @function {Object} can-reflect/observe.getValueDependencies getValueDependencies
	 * @parent can-reflect/observe
	 * @description  Return all the events that bind to the value of an observable, Value-like object
	 *
	 * @signature `getValueDependencies(obj)`
	 *
	 * Return the observable objects that provide input values to generate the computed value of the
	 * Value-like object `obj`.  If `obj` does not have dependencies, returns `undefined`.
	 * Otherwise returns an object with up to two keys: `keyDependencies` is a [can-util/js/cid-map/cid-map CIDMap] that
	 * maps each Map-like object providing keyed values to an Array of the relevant keys; `valueDependencies` is a
	 * [can-util/js/cid-set/cid-set CIDSet] that contains all Value-like dependencies providing their own values.
	 *
	 * `obj` *must* implement [can-symbol/symbols/getValueDependencies @@@@can.getValueDependencies] to work with
	 * `canReflect.getValueDependencies`.
	 *
	 *
	 * ```js
	 * var foo = new DefineMap({ "bar": "baz" })
	 * var obj = canCompute(function() {
	 * 	 return foo.bar;
	 * });
	 *
	 * canReflect.getValueDependencies(obj);  // -> { valueDependencies: CIDSet } because `obj` is internally backed by
	 * a [can-observation]
	 * ```
	 *
	 * @param {Object} obj the object to check for value dependencies
	 * @return {Object} the observable objects that `obj`'s value depends on
	 *
	 */
	getValueDependencies: makeErrorIfMissing("can.getValueDependencies","can-reflect: can not determine dependencies"),

	/**
	 * @function {Object} can-reflect/observe.valueHasDependencies valueHasDependencies
	 * @parent can-reflect/observe
	 * @description  Determine whether the value of an observable object is bound to other events
	 *
	 * @signature `valueHasDependencies(obj)`
	 *
	 * Returns `true` if the computed value of the Value-like object `obj` derives from other values.
	 * Returns `false` if `obj` is computed but does not have dependencies on other objects. If `obj` is not
	 * a computed value, returns `undefined`.
	 *
	 * `obj` *must* implement [can-symbol/symbols/valueHasDependencies @@@@can.valueHasDependencies] to work with
	 * `canReflect.valueHasDependencies`.
	 *
	 * ```js
	 * var foo = canCompute( "bar" );
	 * var baz = canCompute(function() {
	 * 	 return foo();
	 * });
	 * var quux = "thud";
	 * var jeek = canCompute(function(plonk) {
	 * 	 if(argument.length) {
	 * 	 	  quux = plonk;
	 * 	 }
	 * 	 return quux;
	 * });
	 *
	 * canReflect.valueHasDependencies(baz);  // -> true
	 * canReflect.valueHasDependencies(jeek);  // -> false
	 * canReflect.valueHasDependencies(foo);  // -> undefined
	 * ```
	 *
	 * @param {Object} obj the object to check for dependencies
	 * @return {Boolean} `true` if there are other dependencies that may update the object's value; `false` otherwise
	 *
	 */
	valueHasDependencies: makeErrorIfMissing("can.valueHasDependencies","can-reflect: can not determine if value has dependencies"),

	// PATCHES
	/**
	 * @function {Object, function(*), String} can-reflect/observe.onPatches onPatches
	 * @parent can-reflect/observe
	 * @description  Register an handler on an observable that listens to any key changes
	 *
	 * @signature `onPatches(obj, handler, [queueName])`
	 *
	 * Register an event handler on the object `obj` that fires when anything changes on an object: a key value is added,
	 * an existing key has is value changed, or a key is deleted from the object.
	 *
	 * If object is an array-like and the changed property includes numeric indexes, patch sets will include array-specific
	 * patches in addition to object-style patches
	 *
	 * For more on the patch formats, see [can-util/js/diff-object/diff-object] and [can-util/js/diff-array/diff-array].
	 *
	 * ```js
	 * var obj = new DefineMap({});
	 * var handler = function(patches) {
	 * 	console.log(patches);
	 * };
	 *
	 * canReflect.onPatches(obj, handler);
	 * obj.set("foo", "bar");  // logs [{ type: "add", property: "foo", value: "bar" }]
	 * obj.set("foo", "baz");  // logs [{ type: "set", property: "foo", value: "baz" }]
	 *
	 * var arr = new DefineList([]);
	 * canReflect.onPatches(arr, handler);
	 * arr.push("foo");  // logs [{type: "add", property:"0", value: "foo"},
	 *                            {index: 0, deleteCount: 0, insert: ["foo"]}]
   * arr.pop();  // logs [{type: "remove", property:"0"},
	 *                            {index: 0, deleteCount: 1, insert: []}]
	 * ```
	 *
	 * @param {*} obj
	 * @param {function(*)} handler
	 * @param {String} [queueName] the name of a queue in [can-queues]; dispatches to `handler` will happen on this queue
	 */
	onPatches: makeErrorIfMissing("can.onPatches", "can-reflect: can not observe patches on object"),
	/**
	 * @function {Object, function(*), String} can-reflect/observe.offPatches offPatches
	 * @parent can-reflect/observe
	 * @description  Unregister an object patches handler from an observable object
	 *
	 * @signature `offPatches(obj, handler, [queueName])`
	 *
	 * Unregister an event handler from the object `obj` that had previously been registered with
	 * [can-reflect/observe.onPatches onPatches]. The function passed as `handler` will no longer be called
	 * when `obj` has key or index changes.
	 *
	 * ```js
	 * var obj = new DefineMap({});
	 * var handler = function(patches) {
	 * 	console.log(patches);
	 * };
	 *
	 * canReflect.onPatches(obj, handler);
	 * canReflect.offPatches(obj, handler);
	 *
	 * obj.set("foo", "bar");  // nothing is logged
	 * ```
	 *
	 * @param {*} obj
	 * @param {function(*)} handler
	 * @param {String} [queueName] the name of the queue in [can-queues] the handler was registered under
	 */
	offPatches: makeErrorIfMissing("can.offPatches", "can-reflect: can not unobserve patches on object"),

	/**
	 * @function {Object, function(*)} can-reflect/observe.onInstancePatches onInstancePatches
	 * @parent can-reflect/observe
	 *
	 * @description Registers a handler that listens to patch events on any instance
	 *
	 * @signature `onInstancePatches(Type, handler(instance, patches))`
	 *
	 * Listens to patch changes on any instance of `Type`. This is used by [can-connect]
	 * to know when a potentially `unbound` instance's `id` changes. If the `id` changes,
	 * the instance can be moved into the store while it is being saved. E.g:
	 *
	 * ```js
	 * canReflect.onInstancePatches(Map, function onInstancePatches(instance, patches) {
	 *	patches.forEach(function(patch) {
	 *		if (
	 *			(patch.type === "add" || patch.type === "set") &&
	 *			patch.key === connection.idProp &&
	 *			canReflect.isBound(instance)
	 *		) {
	 *			connection.addInstanceReference(instance);
	 *		}
	 *	});
	 *});
	 * ```
	 *
	 * @param {*} Type
	 * @param {function(*)} handler
	 */
	onInstancePatches: makeErrorIfMissing(
		"can.onInstancePatches",
		"can-reflect: can not observe onInstancePatches on Type"
	),

	/**
	 * @function {Object, function(*)} can-reflect/observe.offInstancePatches offInstancePatches
	 * @parent can-reflect/observe
	 *
	 * @description Unregisters a handler registered through [can-reflect/observe.onInstancePatches]
	 *
	 * @signature `offInstancePatches(Type, handler(instance, patches))`
	 *
	 * ```js
	 * canReflect.offInstancePatches(Map, onInstancePatches);
	 * ```
	 *
	 * @param {*} Type
	 * @param {function(*)} handler
	 */
	offInstancePatches: makeErrorIfMissing(
		"can.offInstancePatches",
		"can-reflect: can not unobserve onInstancePatches on Type"
	),

	// HAS BINDINGS VS DOES NOT HAVE BINDINGS
	/**
	 * @function {Object, function(*), String} can-reflect/observe.onInstanceBoundChange onInstanceBoundChange
	 * @parent can-reflect/observe
	 * @description Listen to when observables of a type are bound and unbound.
	 *
	 * @signature `onInstanceBoundChange(Type, handler, [queueName])`
	 *
	 * Register an event handler on the object `Type` that fires when instances of the type become bound (the first handler is added)
	 * or unbound (the last remaining handler is removed). The function passed as `handler` will be called
	 * with the `instance` as the first argument and `true` as the second argument when `instance` gains its first binding,
	 * and called with `false` when `instance` loses its
	 * last binding.
	 *
	 * ```js
	 * Person = DefineMap.extend({ ... });
	 *
	 * var person = Person({});
	 * var handler = function(instance, newVal) {
	 * 	console.log(instance, "bound state is now", newVal);
	 * };
	 * var keyHandler = function() {};
	 *
	 * canReflect.onInstanceBoundChange(Person, handler);
	 * canReflect.onKeyValue(obj, "name", keyHandler);  // logs person Bound state is now true
	 * canReflect.offKeyValue(obj, "name", keyHandler);  // logs person Bound state is now false
	 * ```
	 *
	 * @param {function} Type A constructor function
	 * @param {function(*,Boolean)} handler(instance,isBound) A function called with the `instance` whose bound status changed and the state of the bound status.
	 * @param {String} [queueName] the name of a queue in [can-queues]; dispatches to `handler` will happen on this queue
	 */
	onInstanceBoundChange: makeErrorIfMissing("can.onInstanceBoundChange", "can-reflect: can not observe bound state change in instances."),
	/**
	 * @function {Object, function(*), String} can-reflect/observe.offInstanceBoundChange offInstanceBoundChange
	 * @parent can-reflect/observe
	 * @description Stop listening to when observables of a type are bound and unbound.
	 *
	 * @signature `offInstanceBoundChange(Type, handler, [queueName])`
	 *
	 * Unregister an event handler from the type `Type` that had previously been registered with
	 * [can-reflect/observe.onInstanceBoundChange onInstanceBoundChange]. The function passed as `handler` will no longer be called
	 * when instances of `Type` gains its first or loses its last binding.
	 *
	 * ```js
	 * Person = DefineMap.extend({ ... });
	 *
	 * var person = Person({});
	 * var handler = function(instance, newVal) {
	 * 	console.log(instance, "bound state is now", newVal);
	 * };
	 * var keyHandler = function() {};
	 *
	 * canReflect.onInstanceBoundChange(Person, handler);
	 * canReflect.offInstanceBoundChange(Person, handler);
	 * canReflect.onKeyValue(obj, "name", keyHandler);  // nothing is logged
	 * canReflect.offKeyValue(obj, "name", keyHandler); // nothing is logged
	 * ```
	 *
	 * @param {function} Type A constructor function
	 * @param {function(*,Boolean)} handler(instance,isBound) The `handler` passed to `canReflect.onInstanceBoundChange`.
	 * @param {String} [queueName] the name of the queue in [can-queues] the handler was registered under
	 */
	offInstanceBoundChange: makeErrorIfMissing("can.offInstanceBoundChange", "can-reflect: can not unobserve bound state change"),
	/**
	 * @function {Object} can-reflect/observe.isBound isBound
	 * @parent can-reflect/observe
	 * @description  Determine whether any listeners are bound to the observable object
	 *
	 * @signature `isBound(obj)`
	 *
	 * `isBound` queries an observable object to find out whether any listeners have been set on it using
	 * [can-reflect/observe.onKeyValue onKeyValue] or [can-reflect/observe.onValue onValue]
	 *
	 * ```js
	 * var obj = new DefineMap({});
	 * var handler = function() {};
	 * canReflect.isBound(obj); // -> false
	 * canReflect.onKeyValue(obj, "foo", handler);
	 * canReflect.isBound(obj); // -> true
	 * canReflect.offKeyValue(obj, "foo", handler);
	 * canReflect.isBound(obj); // -> false
	 * ```
	 *
	 * @param {*} obj
	 * @return {Boolean} `true` if obj has at least one key-value or value listener, `false` otherwise
	 */
	isBound: makeErrorIfMissing("can.isBound", "can-reflect: cannot determine if object is bound"),

	// EVENT
	/**
	 * @function {Object, String, function(*)} can-reflect/observe.onEvent onEvent
	 * @parent can-reflect/observe
	 * @description  Register a named event handler on an observable object
	 *
	 * @signature `onEvent(obj, eventName, callback)`
	 *
	 *
	 * Register an event handler on the object `obj` to trigger when the event `eventName` is dispatched.
	 * `obj` *must* implement [can-symbol/symbols/onKeyValue @@@@can.onEvent] or `.addEventListener()` to be compatible
	 * with can-reflect.onKeyValue.  The function passed as `callback` will receive the event descriptor as the first
	 * argument, and any data passed to the event dispatch as subsequent arguments.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * canReflect.onEvent(obj, "foo", function(ev, newVal, oldVal) {
	 * 	console.log("foo is now", newVal, ", was", oldVal);
	 * });
	 *
	 * canEvent.dispatch.call(obj, "foo", ["baz", "quux"]);  // -> logs "foo is now baz , was quux"
	 * ```
	 *
	 * @param {Object} obj the object to bind a new event handler to
	 * @param {String} eventName the name of the event to bind the handler to
	 * @param {function(*)} callback  the handler function to bind to the event
	 */
	onEvent: function(obj, eventName, callback, queue){
		if(obj) {
			var onEvent = obj[canSymbol.for("can.onEvent")];
			if(onEvent !== undefined) {
				return onEvent.call(obj, eventName, callback, queue);
			} else if(obj.addEventListener) {
				obj.addEventListener(eventName, callback, queue);
			}
		}
	},
	/**
	 * @function {Object, String, function(*)} can-reflect/observe.offValue offEvent
	 * @parent can-reflect/observe
	 * @description  Unregister an event handler on a MapLike object, based on a key change
	 *
	 * @signature `offEvent(obj, eventName, callback)`
	 *
	 * Unregister an event handler from the object `obj` that had previously been registered with
	 * [can-reflect/observe.onEvent onEvent]. The function passed as `callback` will no longer be called
	 * when the event named `eventName` is dispatched on `obj`.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * var handler = function(ev, newVal, oldVal) {
	 * 	console.log("foo is now", newVal, ", was", oldVal);
	 * };
	 *
	 * canReflect.onEvent(obj, "foo", handler);
	 * canReflect.offEvent(obj, "foo", handler);
	 *
	 * canEvent.dispatch.call(obj, "foo", ["baz", "quux"]);  // -> nothing is logged
	 * ```
	 *
	 * @param {Object} obj the object to unbind an event handler from
	 * @param {String} eventName the name of the event to unbind the handler from
	 * @param {function(*)} callback the handler function to unbind from the event
	 */
	offEvent: function(obj, eventName, callback, queue){
		if(obj) {
			var offEvent = obj[canSymbol.for("can.offEvent")];
			if(offEvent !== undefined) {
				return offEvent.call(obj, eventName, callback, queue);
			}  else if(obj.removeEventListener) {
				obj.removeEventListener(eventName, callback, queue);
			}
		}

	},
	/**
	 * @function {function} can-reflect/setPriority setPriority
	 * @parent can-reflect/observe
	 * @description  Provide a priority for when an observable that derives its
	 * value should be re-evaluated.
	 *
	 * @signature `setPriority(obj, priority)`
	 *
	 * Calls an underlying `@@can.setPriority` symbol on `obj` if it exists with `priorty`.
	 * Returns `true` if a priority was set, `false` if otherwise.
	 *
	 * Lower priorities (`0` being the lowest), will be an indication to run earlier than
	 * higher priorities.
	 *
	 * ```js
	 * var obj = canReflect.assignSymbols({},{
	 *   "can.setPriority": function(priority){
	 *     return this.priority = priority;
	 *   }
	 * });
	 *
	 * canReflect.setPriority(obj, 0) //-> true
	 * obj.priority //-> 0
	 *
	 * canReflect.setPriority({},20) //-> false
	 * ```
	 *
	 * @param {Object} obj An observable that will update its priority.
	 * @param {Number} priority The priority number.  Lower priorities (`0` being the lowest),
	 * indicate to run earlier than higher priorities.
	 * @return {Boolean} `true` if a priority was able to be set, `false` if otherwise.
	 *
	 * @body
	 *
	 * ## Use
	 *
	 * There's often a need to specify the order of re-evaluation for
	 * __observables__ that derive (or compute) their value from other observables.
	 *
	 * This is needed by templates to avoid unnecessary re-evaluation.  Say we had the following template:
	 *
	 * ```js
	 * {{#if value}}
	 *   {{value}}
	 * {{/if}}
	 * ```
	 *
	 * If `value` became falsey, we'd want the `{{#if}}` to be aware of it before
	 * the `{{value}}` magic tags updated. We can do that by setting priorities:
	 *
	 * ```js
	 * canReflect.setPriority(magicIfObservable, 0);
	 * canReflect.setPriority(magicValueObservable,1);
	 * ```
	 *
	 * Internally, those observables will use that `priority` to register their
	 * re-evaluation with the `derive` queue in [can-queues].
	 *
	 */
	setPriority: function(obj, priority) {
		if(obj) {
			var setPriority =  obj[canSymbol.for("can.setPriority")];
			if(setPriority !== undefined) {
				setPriority.call(obj, priority);
			 	return true;
			}
		}
		return false;
	},
	/**
	 * @function {function} can-reflect/getPriority getPriority
	 * @parent can-reflect/observe
	 * @description  Read the priority for an observable that derives its
	 * value.
	 *
	 * @signature `getPriority(obj)`
	 *
	 * Calls an underlying `@@can.getPriority` symbol on `obj` if it exists
	 * and returns its value. Read [can-reflect/setPriority] for more information.
	 *
	 *
	 *
	 * @param {Object} obj An observable.
	 * @return {Undefined|Number} Returns the priority number if
	 * available, undefined if this object does not support the `can.getPriority`
	 * symbol.
	 *
	 * @body
	 *
	 */
	getPriority: function(obj) {
		if(obj) {
			var getPriority =  obj[canSymbol.for("can.getPriority")];
			if(getPriority !== undefined) {
				return getPriority.call(obj);
			}
		}
		return undefined;
	}
};
