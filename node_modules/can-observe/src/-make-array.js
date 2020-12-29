"use strict";
// # -make-array.js
// This module's `.observable` method proxies an Array to make it observable.
// The other exports are not used elsewhere.
// `.set` is the only proxy method that differs from `make-object`'s.
var ObservationRecorder = require("can-observation-recorder");
var mapBindings = require("can-event-queue/map/map");
var canReflect = require("can-reflect");

var makeObject = require("./-make-object");
var symbols = require("./-symbols");
var observableStore = require("./-observable-store");
var helpers = require("./-helpers");
var computedHelpers = require("./-computed-helpers");

var isSymbolLike = canReflect.isSymbolLike;

// Returns if prop is an integer
var isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value;
};

// Returns `true` if the length was set and it deleted indexed
// properties.
function didLengthChangeCauseDeletions(key, value, old) {
	return key === "length" && value < old;
}


// ## Rewrite array methods
// The following rewrites array methods to generate events and
// for performance reasons.
//
// Array's methods that mutate are rewritten to generate patch events.
// Other methods on array are rewritten to:
// - Avoid calling `ObservationRecorder.add` on every property.
// - Make the returned result observable.
//
// ### Rewrite mutating methods
// The following defines a relationship between an array
// mutation method and the patch events that should be dispatched
// for that mutation.
var mutateMethods = {
	"push": function(arr, args) {
		return [{
			index: arr.length - args.length,
			deleteCount: 0,
			insert: args,
			type: "splice"
		}];
	},
	"pop": function(arr) {
		return [{
			index: arr.length,
			deleteCount: 1,
			insert: [],
			type: "splice"
		}];
	},
	"shift": function() {
		return [{
			index: 0,
			deleteCount: 1,
			insert: [],
			type: "splice"
		}];
	},
	"unshift": function(arr, args) {
		return [{
			index: 0,
			deleteCount: 0,
			insert: args,
			type: "splice"
		}];
	},
	"splice": function(arr, args) {
		return [{
			index: args[0],
			deleteCount: args[1],
			insert: args.slice(2),
			type: "splice"
		}];
	},
	"sort": function(arr) {
		// The array replaced everything.
		return [{
			index: 0,
			deleteCount: arr.length,
			insert: arr,
			type: "splice"
		}];
	},
	"reverse": function(arr, args, old) {
		// The array replaced everything.
		return [{
			index: 0,
			deleteCount: arr.length,
			insert: arr,
			type: "splice"
		}];
	}
};
// Overwrite Array's methods that mutate to:
// - prevent other events from being fired off (index events and length events.)
// - dispatch patches events.
canReflect.eachKey(mutateMethods, function(makePatches, prop){
	var protoFn = Array.prototype[prop];
	var mutateMethod = function() {
		var meta = this[symbols.metaSymbol],
			// Capture if this function should be making sideEffects
			makeSideEffects = meta.preventSideEffects === 0,
			oldLength = meta.target.length;

		// Prevent proxy from calling ObservationRecorder and sending events.
		meta.preventSideEffects++;

		// Call the function -- note that *this* is the Proxy here, so
		// accesses in the function still go through `get()` and `set()`.
		var ret = protoFn.apply(meta.target, arguments);
		var patches = makePatches(meta.target, Array.from(arguments), oldLength);

		if (makeSideEffects === true) {
			//!steal-remove-start
			var reasonLog = [canReflect.getName(meta.proxy)+"."+prop+" called with", arguments];
			//!steal-remove-end
			var dispatchArgs = {
				type: "length",
				patches: patches
			};

			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				dispatchArgs.reasonLog = reasonLog;
			}
			//!steal-remove-end

			mapBindings.dispatch.call( meta.proxy, dispatchArgs , [meta.target.length, oldLength]);
		}

		meta.preventSideEffects--;
		return ret;
	};
	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		Object.defineProperty(mutateMethod, "name", {
			value: prop
		});
	}
	//!steal-remove-end

	// Store the proxied method so it will be used instead of the
	// prototype method.
	observableStore.proxiedObjects.set(protoFn, mutateMethod);
	observableStore.proxies.add(mutateMethod);
});

// ### Rewrite non-mutating methods
// The following rewrites the Array methods to signal
// to `ObservationRecorder` to bind on patches events.
// It also prevents the proxy handlers calling `ObservationRecorder`
// themselves.
Object.getOwnPropertyNames(Array.prototype).forEach(function(prop) {
	var protoFn = Array.prototype[prop];
	if (observableStore.proxiedObjects.has(protoFn)) {
		return;
	}

	if (prop !== "constructor" && typeof protoFn === "function") {
		var arrayMethod = function() {
			ObservationRecorder.add(this, symbols.patchesSymbol);
			var meta = this[symbols.metaSymbol];
			meta.preventSideEffects++;
			var ret = protoFn.apply(this, arguments);
			meta.preventSideEffects--;
			return meta.options.observe(ret);
		};
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			Object.defineProperty(arrayMethod, "name", {
				value: prop
			});
		}
		//!steal-remove-end
		observableStore.proxiedObjects.set(protoFn, arrayMethod);
		observableStore.proxies.add(arrayMethod);
	}
});


// Array's have the same proxy keys as objects.
var proxyKeys = helpers.assignEverything(Object.create(null), makeObject.proxyKeys());


var makeArray = {
	// Returns a proxied version of the array.
	// - `array` - An array to proxy.
	// - `options` - Configurable behaviors.
	//   - `proxyKeys` - Keys that will override any keys on `array`. Defaults to `makeObject.proxyKeys`.
	//   - `observe(nonObservable)` - A function that converts a nested value to an observable.
	//   - `shouldRecordObservation(keyInfo, meta)` - Returns if `ObservationRecorder`
	//     should be called.  Defaults to `makeObject.shouldRecordObservationOnOwnAndMissingKeys`.
	observable: function(array, options) {
		if(options.shouldRecordObservation === undefined) {
			options.shouldRecordObservation = makeObject.shouldRecordObservationOnOwnAndMissingKeys;
		}
		var meta = {
			target: array,
			proxyKeys: options.proxyKeys !== undefined ? options.proxyKeys : Object.create(makeArray.proxyKeys()),
			computedKeys: Object.create(null),
			options: options,
			// `preventSideEffects` is a counter used to "turn off" the proxy.  This is incremented when some
			// function (like `Array.splice`) wants to handle event dispatching and/or calling
			// `ObservationRecorder` itself for performance reasons.
			preventSideEffects: 0
		};
		meta.proxyKeys[symbols.metaSymbol] = meta;
		meta.proxy = new Proxy(array, {
			get: makeObject.get.bind(meta),
			set: makeArray.set.bind(meta),
			ownKeys: makeObject.ownKeys.bind(meta),
			deleteProperty: makeObject.deleteProperty.bind(meta),
			meta: meta
		});
		mapBindings.addHandlers(meta.proxy, meta);
		return meta.proxy;
	},
	proxyKeys: function() {
		return proxyKeys;
	},
	// `set` is called when a property is set on the proxy or an object
	// that has the proxy on its prototype.
	set: function(target, key, value, receiver) {
		// If the receiver is not this observable (the observable might be on the proto chain),
		// set the key on the reciever.
		if (receiver !== this.proxy) {
			return makeObject.setKey(receiver, key, value, this);
		}

		// If it has a defined property definiition
		var computedValue = computedHelpers.set(receiver, key, value);
		if(computedValue === true ) {
			return true;
		}

		// Gets the observable value to set.
		value = makeObject.getValueToSet(key, value, this);
		var startingLength = target.length;

		// Sets the value on the target.  If there
		// is a change, calls the callback.
		makeObject.setValueAndOnChange(key, value, this, function(key, value, meta, hadOwn, old) {

			// Determine the patches this change should dispatch
			var patches = [{
				key: key,
				type: hadOwn ? "set" : "add",
				value: value
			}];

			var numberKey = !isSymbolLike(key) && +key;

			// If we are adding an indexed value like `arr[5] =value` ...
			if ( isInteger(numberKey) ) {
				// If we set an enumerable property after the length ...
				if (!hadOwn && numberKey > startingLength) {
					// ... add patches for those values.
					patches.push({
						index: startingLength,
						deleteCount: 0,
						insert: target.slice(startingLength),
						type: "splice"
					});
				} else {
					// Otherwise, splice the value into the array.
					patches.push.apply(patches, mutateMethods.splice(target, [numberKey, 1, value]));
				}
			}

			// In the case of deleting items by setting the length of the array,
			// add patches that splice the items removed.
			// (deleting individual items from an array doesn't change the length; it just creates holes)
			if (didLengthChangeCauseDeletions(key, value, old, meta)) {
				patches.push({
					index: value,
					deleteCount: old - value,
					insert: [],
					type: "splice"
				});
			}
			//!steal-remove-start
			var reasonLog = [canReflect.getName(meta.proxy)+" set", key,"to", value];
			//!steal-remove-end

			var dispatchArgs = {
				type: key,
				patches: patches,
				keyChanged: !hadOwn ? key : undefined
			};

			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				dispatchArgs.reasonLog = reasonLog;
			}
			//!steal-remove-end

			mapBindings.dispatch.call( meta.proxy, dispatchArgs, [value, old]);

		});

		return true;
	}
};


module.exports = makeArray;
