"use strict";
// # -make-function.js
// This module's `.observable` method proxies an function to make it an any instances
// created by it observable.
var canReflect = require("can-reflect");
var makeObject = require("./-make-object");
var makeObserve = require("./-make-observe");
var symbols = require("./-symbols");
var observableStore = require("./-observable-store");
var mapBindings = require("can-event-queue/map/map");
var typeBindings = require("can-event-queue/type/type");
var helpers = require("./-helpers");

// ## proxyKeys
// A function's proxyKeys is a combination of:
// - object's symbols (`.onKeyValue`)
// - type event symbols (`.onInstancePatches`, `.onInstanceBound`)
// - type definition symbols (`.defineInstanceKey`)
var proxyKeys = helpers.assignEverything(Object.create(null), makeObject.proxyKeys());
typeBindings(proxyKeys);
canReflect.assignSymbols(proxyKeys, {
	"can.defineInstanceKey": function(prop, value) {
		this[symbols.metaSymbol].definitions[prop] = value;
	}
});

var makeFunction = {

	observable: function(object, options) {

		if(options.shouldRecordObservation === undefined) {
			options.shouldRecordObservation = makeObject.shouldRecordObservationOnOwnAndMissingKeys;
		}
		var proxyKeys = Object.create(makeFunction.proxyKeys());

		var meta = {
			target: object,
			proxyKeys: proxyKeys,
			computedKeys: Object.create(null),
			options: options,
			definitions: {},
			isClass: helpers.isClass(object),
			preventSideEffects: 0
		};

		proxyKeys[symbols.metaSymbol] = meta;
		meta.proxy = new Proxy(object, {
			get: makeObject.get.bind(meta),
			set: makeObject.set.bind(meta),
			ownKeys: makeObject.ownKeys.bind(meta),
			deleteProperty: makeObject.deleteProperty.bind(meta),
			construct: makeFunction.construct.bind(meta),
			apply: makeFunction.apply.bind(meta),
			meta: meta
		});

		mapBindings.addHandlers(meta.proxy, meta);
		typeBindings.addHandlers(meta.proxy, meta);

		// Store the function and its proxy now, before we
		// convert the prototype and its constructor to proxies.
		observableStore.proxiedObjects.set(object, meta.proxy);
		observableStore.proxies.add(meta.proxy);

		// Change prototype and its constructor
		if (meta.target.prototype && meta.target.prototype.constructor === meta.target) {
			var newPrototype = makeObject.observable(meta.target.prototype, {
				getPrototypeOf: function(){
					return meta.target.prototype;
				},
				observe: makeObserve.observe
			});

			observableStore.proxiedObjects.set(meta.target.prototype, newPrototype);
			observableStore.proxies.add(newPrototype);

			var prototype = meta.proxy.prototype;
			prototype.constructor = meta.proxy;
		}

		return meta.proxy;
	},
	// `construct` is called when the `new` operator is used.
	// It needs to return an observable instance.
	construct: function(target, argumentsList, newTarget) {
		var instanceTarget, key;
		if (this.isClass) {
			// If the `target` a class, we can't call the function without new. We
			// can create the instance with `Reflect.construct`.
			instanceTarget = Reflect.construct(target, argumentsList, newTarget);
			// Support `can.defineInstanceKey`.
			for (key in this.definitions) {
				Object.defineProperty(instanceTarget, key, this.definitions[key]);
			}
			return this.options.observe(instanceTarget);
		} else {
			// Create an empty object that inherits from the constructor function.
			instanceTarget = Object.create(this.proxy.prototype);
			// Support `can.defineInstanceKey`.
			for (key in this.definitions) {
				Object.defineProperty(instanceTarget, key, this.definitions[key]);
			}
			var instance = this.options.observe(instanceTarget);
			instance[symbols.metaSymbol].preventSideEffects++;
			var res = target.apply(instance, argumentsList);
			instance[symbols.metaSymbol].preventSideEffects--;
			if (res) {
				return res;
			} else {
				return instance;
			}
		}
	},
	// `apply` makes sure the function returns an observable.
	apply: function(target, thisArg, argumentsList) {
		var ret = this.target.apply(thisArg, argumentsList);
		return this.options.observe(ret);
	},
	proxyKeys: function() {
		return proxyKeys;
	}
};

module.exports = makeFunction;
