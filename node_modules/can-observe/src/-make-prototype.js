"use strict";
var makeObject = require("./-make-object");
var helpers = require("./-helpers");
var symbols = require("./-symbols");
var mapBindings = require("can-event-queue/map/map");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var isSymbolLike = canReflect.isSymbolLike;
var proxyMetaSymbol = canSymbol.for("can.proxyMeta");

function getMetadata(instance, options) {
	if (instance.hasOwnProperty(proxyMetaSymbol)) {
		return instance[proxyMetaSymbol];
	}

	if(options.shouldRecordObservation === undefined) {
		options.shouldRecordObservation = makeObject.shouldRecordObservationOnOwnAndMissingKeys;
	}

	// tell makeObject.set to allow setting on meta.target
	// when the receiver is the prototype of meta.instance
	options.proxiedPrototype = true;

	var meta = {
		// store keys on a side-object instead of directly on the instance
		// so that gets and sets will always hit the prototype
		target: makeObject.observable({}, options),
		proxyKeys: options.proxyKeys !== undefined ? options.proxyKeys : Object.create(makeObject.proxyKeys()),
		computedKeys: Object.create(null),
		options: options,
		// `preventSideEffects` is a counter used to "turn off" the proxy.  This is incremented when some
		// function (like `Array.splice`) wants to handle event dispatching and/or calling
		// `ObservationRecorder` itself for performance reasons.
		preventSideEffects: 0,
		proxy: instance
	};

	// add can.meta symbol to proxyKeys so reading can.meta from the instance
	// will return the meta object (makeObject.get checks proxyKeys first)
	helpers.assignNonEnumerable(meta.proxyKeys, symbols.metaSymbol, meta);

	// set up handlers
	mapBindings.addHandlers(meta.proxy, meta);

	// store meta so it can be retrieved next time
	instance[proxyMetaSymbol] = meta;

	return meta;
}

// # -make-element.js
// This module's `.observable` method proxies a prototype
// in order to make all instances observable.
var makePrototype = {
	observable: function(proto, options) {
		var protoProxy = new Proxy(proto, {
			set: function(target, key, value, receiver) {
				// setting symbols should not trigger events
				// (since that would cause infinite loops becase getMetadata sets symbols)
				//
				// keys in the prototype should just be set (things like innerHTML)
				if (isSymbolLike(key) || key in target) {
					return Reflect.set(target, key, value, receiver);
				}

				var meta = getMetadata(receiver, options);
				return makeObject.set.call(meta, target, key, value, receiver);
			},
			get: function(target, key, receiver) {
				// keys on the prototype should just be returned (things like appendChild, etc)
				if (key in target) {
					return Reflect.get(target, key, receiver);
				}

				var meta = getMetadata(receiver, options);
				return makeObject.get.call(meta, target, key, receiver);
			}
		});

		return protoProxy;
	}
};

module.exports = makePrototype;
