"use strict";
// # -make-object.js
// This module's `.observable` method proxies an object to make it observable.
// The other exports are used by other make-TYPE modules.
var canReflect = require("can-reflect");
var ObservationRecorder = require("can-observation-recorder");
var mapBindings = require("can-event-queue/map/map");

var symbols = require("./-symbols");
var observableStore = require("./-observable-store");
var helpers = require("./-helpers");
var computedHelpers = require("./-computed-helpers");

var hasOwn = Object.prototype.hasOwnProperty;
var isSymbolLike = canReflect.isSymbolLike;

// These are the "overwrites" for the proxy.
// Copy the symbols from the map bindings mixin.
var proxyKeys = Object.create(null);
Object.getOwnPropertySymbols(mapBindings).forEach(function(symbol){
	helpers.assignNonEnumerable(proxyKeys, symbol, mapBindings[symbol]);
});

computedHelpers.addKeyDependencies(proxyKeys);

var makeObject = {
	// Returns a proxied version of the object.
	// - `object` - An object to proxy.
	// - `options` - Configurable behaviors.
	//   - `proxyKeys` - Keys that will override any keys on `object`. Defaults to `makeObject.proxyKeys`.
	//   - `observe(nonObservable)` - A function that converts a nested value to an observable.
	//   - `shouldRecordObservation(keyInfo, meta)` - Returns if `ObservationRecorder`
	//     should be called.  Defaults to `makeObject.shouldRecordObservationOnOwnAndMissingKeys`.
	observable: function(object, options) {
		if(options.shouldRecordObservation === undefined) {
			options.shouldRecordObservation = makeObject.shouldRecordObservationOnOwnAndMissingKeys;
		}

		var meta = {
			target: object,
			proxyKeys: options.proxyKeys !== undefined ? options.proxyKeys : Object.create(makeObject.proxyKeys()),
			computedKeys: Object.create(null),
			options: options,
			// `preventSideEffects` is a counter used to "turn off" the proxy.  This is incremented when some
			// function (like `Array.splice`) wants to handle event dispatching and/or calling
			// `ObservationRecorder` itself for performance reasons.
			preventSideEffects: 0
		};

		helpers.assignNonEnumerable(meta.proxyKeys, symbols.metaSymbol, meta);

		// We `bind` so the `meta` is immediately available as `this`.
		var traps = {
			get: makeObject.get.bind(meta),
			set: makeObject.set.bind(meta),
			ownKeys: makeObject.ownKeys.bind(meta),
			deleteProperty: makeObject.deleteProperty.bind(meta),
			getOwnPropertyDescriptor: makeObject.getOwnPropertyDescriptor.bind(meta),
			meta: meta
		};

		if(options.getPrototypeOf) {
			traps.getPrototypeOf = options.getPrototypeOf;
		}

		meta.proxy = new Proxy(object, traps);
		mapBindings.addHandlers(meta.proxy, meta);
		return meta.proxy;
	},
	proxyKeys: function() {
		return proxyKeys;
	},
	// `get` checks the target for un-proxied objects.
	// If it finds an un-proxied object:
	//   - it creates one (which registers itself in the observableStore) and
	//   - returns the proxied value without modifying the underlying target
	get: function(target, key, receiver) {
		// If getting a key for the proxy, return that value.
		var proxyKey = this.proxyKeys[key];
		if (proxyKey !== undefined) {
			return proxyKey;
		}

		// Symbols are not observable and their values are not made observable.
		if (isSymbolLike(key)) {
			return target[key];
		}

		// If it has a defined property definiition
		var computedValue = computedHelpers.get(receiver, key);
		if(computedValue !== undefined ) {
			return computedValue.value;
		}

		// Gets information about the key on `target` or on `target`'s prototype.
		var keyInfo = makeObject.getKeyInfo(target, key, receiver, this);
		var value = keyInfo.targetValue;

		// If the return value can be changed ...
		if (!keyInfo.valueIsInvariant) {
			// Convert the value into an observable
			// or get it if already converted from the store.
			value = makeObject.getValueFromStore(key, value, this);
		}

		if (this.options.shouldRecordObservation(keyInfo, this)) {
			ObservationRecorder.add(this.proxy, key.toString());
		}

		// if the parent object is observable, we need to observe there too.
		if (keyInfo.parentObservableGetCalledOn) {
			ObservationRecorder.add(keyInfo.parentObservableGetCalledOn, key.toString());
		}
		return value;
	},
	// `set` is called when a property is set on the proxy or an object
	// that has the proxy on its prototype.
	set: function(target, key, value, receiver) {
		// If the receiver is not this observable (the observable might be on the proto chain),
		// set the key on the reciever.
		if (receiver !== this.proxy && this.options.proxiedPrototype !== true) {
			return makeObject.setKey(receiver, key, value, this);
		}

		// If it has a defined property definiition
		var computedValue = computedHelpers.set(receiver, key, value);
		if(computedValue === true ) {
			return true;
		}

		// Gets the observable value to set.
		value = makeObject.getValueToSet(key, value, this);

		// Sets the value on the target.  If there
		// is a change, calls the callback.
		makeObject.setValueAndOnChange(key, value, this, function(key, value, meta, hadOwn, old) {

			//!steal-remove-start
			var reasonLog = [canReflect.getName(meta.proxy) + " set", key, "to", value];
			//!steal-remove-end

			var dispatchArgs = {
				type: key,
				patches: [{
					key: key,
					type: hadOwn ? "set" : "add",
					value: value
				}],
				keyChanged: !hadOwn ? key : undefined
			};

			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				dispatchArgs.reasonLog = reasonLog;
			}				
			//!steal-remove-end

			// Fire event handlers for this key change.
			mapBindings.dispatch.call(meta.proxy, dispatchArgs, [value, old]);

		});

		return true;
	},
	// `deleteProperty` is called when a property is deleted on the proxy.
	deleteProperty: function(target, key) {

		var old = this.target[key],
			deleteSuccessful = delete this.target[key];

		// Fire event handlers if we were able to delete and the value changed.
		if (deleteSuccessful && this.preventSideEffects === 0 && old !== undefined) {
			//!steal-remove-start
			var reasonLog = [canReflect.getName(this.proxy)+" deleted", key];
			//!steal-remove-end
			// wrapping in process.env.NODE_ENV !== 'production' causes out of scope error
			var dispatchArgs = {
				type: key,
				patches: [{
					key: key,
					type: "delete"
				}],
				keyChanged: key
			};
			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				dispatchArgs.reasonLog = reasonLog;
			}
			//!steal-remove-end

			mapBindings.dispatch.call( this.proxy, dispatchArgs,[undefined, old]);

		}
		return deleteSuccessful;
	},
	// `ownKeys` returns the proxies keys.
	// Proxies should return the keys and symbols from proxyOnly
	// as well as from the target, so operators like `in` and
	// functions like `hasOwnProperty` can be used to determine
	// that the Proxy is observable.
	ownKeys: function(target) {
		ObservationRecorder.add(this.proxy, symbols.keysSymbol);

		return Object.getOwnPropertyNames(this.target)
			.concat(Object.getOwnPropertySymbols(this.target))
			.concat(Object.getOwnPropertySymbols(this.proxyKeys));
	},
	getOwnPropertyDescriptor: function(target, key) {
		var desc = Object.getOwnPropertyDescriptor(target, key);

		if(!desc && (key in this.proxyKeys)) {
			return Object.getOwnPropertyDescriptor(this.proxyKeys, key);
		}

		return desc;
	},
	// Returns a `keyInfo` object with useful information about the key
	// and its value.  This function is _heavily_ optimized.
	getKeyInfo: function(target, key, receiver, meta) {
		var descriptor = Object.getOwnPropertyDescriptor(target, key);
		var propertyInfo = {
			// The key being read.
			key: key,
			// The property descriptor.
			descriptor: descriptor,
			// If the `target` has the key.
			targetHasOwnKey: Boolean(descriptor),
			// If the proxy is on the proto chain.
			getCalledOnParent: receiver !== meta.proxy,
			// If the prototype of the target has this key.
			protoHasKey: false,
			// If the property is sealed or not.
			valueIsInvariant: false,
			// The value of the key wherever it is found.
			targetValue: undefined,
			// If reading the key went through a getter.
			isAccessor: false
		};
		if (propertyInfo.getCalledOnParent === true) {
			propertyInfo.parentObservableGetCalledOn = observableStore.proxiedObjects.get(receiver);
		}
		if (descriptor !== undefined) {
			propertyInfo.valueIsInvariant = descriptor.writable === false;
			if (descriptor.get !== undefined) {
				propertyInfo.targetValue = descriptor.get.call( propertyInfo.parentObservableGetCalledOn || receiver);
				propertyInfo.isAccessor = true;
			} else {
				propertyInfo.targetValue = descriptor.value;
			}
		} else {
			propertyInfo.targetValue = meta.target[key];
			propertyInfo.protoHasKey = propertyInfo.targetValue !== undefined ? true : (key in target);
		}

		return propertyInfo;
	},
	// Returns `true` if `ObservationRecorder.add` should be called.
	// This is the default `options.shouldRecordObservation` behavior.
	// `observe.Object` changes this to record all keys except functions on the
	// proto chain.
	shouldRecordObservationOnOwnAndMissingKeys: function(keyInfo, meta) {
		return meta.preventSideEffects === 0 &&
			// The read is not a getter AND ...
			!keyInfo.isAccessor &&
			(
				// (the read is on the proxy OR
				(// it's not on the proto chain and we are not sealed).
                keyInfo.targetHasOwnKey || !keyInfo.protoHasKey && !Object.isSealed(meta.target))
			);
	},
	// `setKey` sets a value on an object. Use `Object.defineProperty`
	// because it won't try setting up the proto chain.
	setKey: function(receiver, key, value) {
		Object.defineProperty(receiver, key, {
			value: value,
			configurable: true,
			enumerable: true,
			writable: true
		});
		return true;
	},
	// `getValueToSet` gets the value we will set on the object.  It only
	// converts set values to observables if we have actually bound.
	getValueToSet: function(key, value, meta) {
		if (!canReflect.isSymbolLike(key) && meta.handlers.getNode([key])) {
			return makeObject.getValueFromStore(key, value, meta);
		}
		return value;
	},
	// Get a value from the store if we can.
	getValueFromStore: function(key, value, meta) {
		// We never convert primitives or things that are already observable.
		// However, there are some builtIns that we premptively convert, namely
		// Array.prototype methods.
		if (!canReflect.isPrimitive(value) &&
			!canReflect.isObservableLike(value) &&
			// Do nothing if the value is already a converted proxy.
			!observableStore.proxies.has(value)) {

			// If the `value` already been made into a proxy, use the value.
			if (observableStore.proxiedObjects.has(value)) {
				value = observableStore.proxiedObjects.get(value);
			}
			else if (!helpers.isBuiltInButNotArrayOrPlainObject(value)) {
				value = meta.options.observe(value);
			}
		}
		return value;
	},

	// `setValueAndOnChange` sets the value.  If the value changed,
	// calls the `onChange` callback.
	setValueAndOnChange: function(key, value, data, onChange) {
		var old, change;
		var hadOwn = hasOwn.call(data.target, key);

		var descriptor = Object.getOwnPropertyDescriptor(data.target, key);
		// call the setter on the Proxy to properly do any side-effect sets (and run corresponding handlers)
		// -- setters do not return values, so it is unnecessary to check for changes.
		if (descriptor && descriptor.set) {
			descriptor.set.call(data.proxy, value);
		} else {
			// otherwise check for a changed value
			old = data.target[key];
			change = old !== value;
			if (change) {
				data.target[key] = value;
				if (data.preventSideEffects === 0) {
					onChange(key, value, data, hadOwn, old);
				}
			}
		}
	}
};


module.exports = makeObject;
