const canReflect = require("can-reflect");
const computedHelpers = require("./computed-helpers");
const mapBindings = require("can-event-queue/map/map");
const ObservationRecorder = require("can-observation-recorder");
const {
	assignNonEnumerable,
	convertItem,
	dispatchIndexEvent,
	shouldRecordObservationOnAllKeysExceptFunctionsOnProto
} = require("./helpers");
const { mixins } = require("can-observable-mixin");

const hasOwn = Object.prototype.hasOwnProperty;
const { isSymbolLike } = canReflect;
const metaSymbol = Symbol.for("can.meta");

const proxiedObjects = new WeakMap();
const proxies = new WeakSet();

const proxyKeys = Object.create(null);
Object.getOwnPropertySymbols(mapBindings).forEach(function(symbol){
	assignNonEnumerable(proxyKeys, symbol, mapBindings[symbol]);
});
computedHelpers.addKeyDependencies(proxyKeys);

const mutateMethods = {
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
	"reverse": function(arr) {
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
		var meta = this[metaSymbol],
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
				key: "length",
				value: meta.target.length,
				oldValue: oldLength,
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
	proxiedObjects.set(protoFn, mutateMethod);
	proxies.add(mutateMethod);
});

function setValueAndOnChange(key, value, target, proxy, onChange) {
	let old, change;
	let hadOwn = hasOwn.call(target, key);

	let descriptor = Object.getOwnPropertyDescriptor(target, key);
	// call the setter on the Proxy to properly do any side-effect sets (and run corresponding handlers)
	// -- setters do not return values, so it is unnecessary to check for changes.
	if (descriptor && descriptor.set) {
		descriptor.set.call(proxy, value);
	} else {
		// otherwise check for a changed value
		old = target[key];
		change = old !== value;
		if (change) {
			let keyType = typeof key;
			let keyIsString = keyType === "string";

			// String keys added to the instance (and is not "length")
			// Are newly defined properties and have propertyDefaults provided.
			if(keyIsString && !(key in target)) {
				mixins.expando(target, key, value);
			} else {
				// arr[0] = { foo: 'bar' } should convert to MyArray.items
				if(keyType === "number") {
					value = convertItem(target.constructor, value);
				}

				target[key] = value;
				onChange(hadOwn, old);
			}
		}
	}
}

const proxyHandlers = {
	get(target, key, receiver) {
		if (isSymbolLike(key)) {
			return target[key];
		}

		let proxy = proxiedObjects.get(target);
		ObservationRecorder.add(proxy, key.toString());

		const numberKey = !isSymbolLike(key) && +key;
		if (Number.isInteger(numberKey)) {
			ObservationRecorder.add(proxy, "length");
		}
		
		let value = Reflect.get(target, key, receiver);
		return value;
	},

	set(target, key, newValue, receiver) {
		let proxy = proxiedObjects.get(target);
		let numberKey = !isSymbolLike(key) && +key;

		if (Number.isInteger(numberKey)) {
			key = numberKey;
		}

		setValueAndOnChange(key, newValue, target, proxy, function onChange(hadOwn, oldValue) {

			if (Number.isInteger(key)) {
				dispatchIndexEvent.call(
					receiver,
					key,
					hadOwn ? (typeof newValue !== 'undefined' ? "set" : "remove") : "add",
					newValue,
					oldValue
				);
			}
		});

		return true;
	},
	deleteProperty(target, key) {
		let old = this.target[key];
		let deleteSuccessful = delete this.target[key];

		// Fire event handlers if we were able to delete and the value changed.
		if (deleteSuccessful && this.preventSideEffects === 0 && old !== undefined) {
			dispatchIndexEvent.call(
				this.proxy,
				key,
				"remove",
				undefined,
				old
			);
		}

		return deleteSuccessful;
	},
	ownKeys() {
		ObservationRecorder.add(this.proxy, "can.keys");

		let keysSet = new Set(
			Object.getOwnPropertyNames(this.target)
				.concat(Object.getOwnPropertySymbols(this.target))
				.concat(Object.getOwnPropertySymbols(this.proxyKeys))
		);

		return Array.from(keysSet);
	}
};

function makeObservable(array, options) {
	let meta = {
		target: array,
		proxyKeys: options.proxyKeys !== undefined ? options.proxyKeys : Object.create(proxyKeys),
		computedKeys: Object.create(null),
		options: options,
		// `preventSideEffects` is a counter used to "turn off" the proxy.  This is incremented when some
		// function (like `Array.splice`) wants to handle event dispatching and/or calling
		// `ObservationRecorder` itself for performance reasons.
		preventSideEffects: 0
	};
	meta.proxyKeys[metaSymbol] = meta;

	meta.proxy = new Proxy(array, {
		get: proxyHandlers.get.bind(meta),
		set: proxyHandlers.set.bind(meta),
		ownKeys: proxyHandlers.ownKeys.bind(meta),
		deleteProperty: proxyHandlers.deleteProperty.bind(meta),
		meta: meta
	});
	mapBindings.addHandlers(meta.proxy, meta);
	return meta.proxy;
}

function proxyArray() {
	return class ProxyArray extends Array {
		constructor(...items) {
			super(...items);

			let localProxyKeys = Object.create(proxyKeys);
        	localProxyKeys.constructor = this.constructor;

			let observable = makeObservable(this, {
				//observe: makeObserve.observe,
 				proxyKeys: localProxyKeys,
 				shouldRecordObservation: shouldRecordObservationOnAllKeysExceptFunctionsOnProto
			});
			proxiedObjects.set(this, observable);
			proxies.add(observable);
			return observable;
		}
	};
}

module.exports = proxyArray;
