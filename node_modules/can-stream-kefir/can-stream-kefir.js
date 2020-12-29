"use strict";
var Kefir = require('can-kefir');
var compute = require('can-compute');
var canStream = require('can-stream');
var canSymbol = require('can-symbol');
var namespace = require('can-namespace');

var getValueDependenciesSymbol = canSymbol.for('can.getValueDependencies');
var getKeyDependenciesSymbol = canSymbol.for('can.getKeyDependencies');

var canStreamKefir = {};

/*
 * Converts all arguments passed into a single stream and resolves the resulting
 * streams into a single stream. Assumes all arguments are computes and last
 * argument is optionally a function.
 */
canStreamKefir.toStream = function (compute) {
	var stream = Kefir.stream(function (emitter) {
		var changeHandler = function (ev, newVal) {
			emitter.emit(newVal);
		};

		compute.on('change', changeHandler);

		var currentValue = compute();
		if(currentValue !== undefined) {
			emitter.emit(currentValue);
		}

		return function () {
			compute.off('change', changeHandler);
		};
	});

	stream[getValueDependenciesSymbol] = function getValueDependencies() {
		return {
			valueDependencies: new Set([compute])
		};
	};

	return stream;
};

canStreamKefir.toCompute = function(makeStream, context){
	var emitter,
		lastValue,
		streamHandler,
		lastSetValue;

	var setterStream = Kefir.stream(function (e) {
		emitter = e;
		if (lastSetValue !== undefined) {
			emitter.emit(lastSetValue);
		}
	});
	var valueStream = makeStream.call(context, setterStream);

	// Create a compute that will bind to the resolved stream when bound
	var streamCompute = compute(undefined, {
		// When the compute is read, use that last value
		get: function () {
			return lastValue;
		},
		set: function (val) {
			if(emitter) {
				emitter.emit(val);
			} else {
				lastSetValue = val;
			}
			return val;
		},

		// When the compute is bound, bind to the resolved stream
		on: function (updated) {

			// When the stream passes a new values, save a reference to it and call
			// the compute's internal `updated` method (which ultimately calls `get`)
			streamHandler = function (val) {
				lastValue = val;
				updated();
			};
			valueStream.onValue(streamHandler);
		},

		// When the compute is unbound, unbind from the resolved stream
		off: function () {
			valueStream.offValue(streamHandler);
		}
	});

	// the symbol should ideally be implemented in the compute wrapper instead of
	// the internal instance, this should be fixed once can-compute is removed
	var _compute = streamCompute.computeInstance;
	_compute[getKeyDependenciesSymbol] = function getKeyDependencies(key) {
		if (key === 'change') {
			return {
				valueDependencies: new Set([valueStream])
			};
		}
	};

	return streamCompute;
};

if (!namespace.streamKefir) {
	/*
	 * Exposes a simple toStream method that takes an observable and event or propname and returns a Kefir stream object
	 */
	module.exports = namespace.streamKefir = canStream(canStreamKefir);
}

