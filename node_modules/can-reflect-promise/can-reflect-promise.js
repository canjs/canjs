"use strict";
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var ObservationRecorder = require("can-observation-recorder");
var queues = require("can-queues");
var KeyTree = require("can-key-tree");
var dev = require("can-log/dev/dev");


var getKeyValueSymbol = canSymbol.for("can.getKeyValue"),
	observeDataSymbol = canSymbol.for("can.meta");

var promiseDataPrototype = {
	isPending: true,
	state: "pending",
	isResolved: false,
	isRejected: false,
	value: undefined,
	reason: undefined
};

function setVirtualProp(promise, property, value) {
	var observeData = promise[observeDataSymbol];
	var old = observeData[property];
	observeData[property] = value;
	queues.enqueueByQueue(observeData.handlers.getNode([property]), promise, [value,old], function() {
		return {};
	},["Promise", promise, "resolved with value", value, "and changed virtual property: "+property]);
}

function initPromise(promise) {
	var observeData = promise[observeDataSymbol];
	if(!observeData) {
		Object.defineProperty(promise, observeDataSymbol, {
			enumerable: false,
			configurable: false,
			writable: false,
			value: Object.create(promiseDataPrototype)
		});
		observeData = promise[observeDataSymbol];
		observeData.handlers = new KeyTree([Object, Object, Array]);
	}
	promise.then(function(value){
		queues.batch.start();
		setVirtualProp(promise, "isPending", false);
		setVirtualProp(promise, "isResolved", true);
		setVirtualProp(promise, "value", value);
		setVirtualProp(promise, "state", "resolved");
		queues.batch.stop();
	}, function(reason){
		queues.batch.start();
		setVirtualProp(promise, "isPending", false);
		setVirtualProp(promise, "isRejected", true);
		setVirtualProp(promise, "reason", reason);
		setVirtualProp(promise, "state", "rejected");
		queues.batch.stop();

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			dev.error("Failed promise:", reason);
		}
		//!steal-remove-end
	});
}

function setupPromise(value) {
	var oldPromiseFn;
	var proto = "getPrototypeOf" in Object ? Object.getPrototypeOf(value) : value.__proto__; //jshint ignore:line

	if(value[getKeyValueSymbol] && value[observeDataSymbol]) {
		// promise has already been set up.  Don't overwrite.
		return;
	}

	if(proto === null || proto === Object.prototype) {
		// promise type is a plain object or dictionary.  Set up object instead of proto.
		proto = value;

		if(typeof proto.promise === "function") {
			// Duck-type identification as a jQuery.Deferred;
			// In that case, the promise() function returns a new object
			//  that needs to be decorated.
			oldPromiseFn = proto.promise;
			proto.promise = function() {
				var result = oldPromiseFn.call(proto);
				setupPromise(result);
				return result;
			};
		}
	}

	canReflect.assignSymbols(proto, {
		"can.getKeyValue": function(key) {
			if(!this[observeDataSymbol]) {
				initPromise(this);
			}

			ObservationRecorder.add(this, key);
			switch(key) {
				case "state":
				case "isPending":
				case "isResolved":
				case "isRejected":
				case "value":
				case "reason":
				return this[observeDataSymbol][key];
				default:
				return this[key];
			}
		},
		"can.getValue": function() {
			return this[getKeyValueSymbol]("value");
		},
		"can.isValueLike": false,
		"can.onKeyValue": function(key, handler, queue) {
			if(!this[observeDataSymbol]) {
				initPromise(this);
			}
			this[observeDataSymbol].handlers.add([key, queue || "mutate", handler]);
		},
		"can.offKeyValue": function(key, handler, queue) {
			if(!this[observeDataSymbol]) {
				initPromise(this);
			}
			this[observeDataSymbol].handlers.delete([key, queue || "mutate", handler]);
		},
		"can.hasOwnKey": function(key) {
			if (!this[observeDataSymbol]) {
				initPromise(this);
			}
			return (key in this[observeDataSymbol]);
		}
	});
}

module.exports = setupPromise;
