"use strict";
/* jshint maxdepth:7*/

// # can.compute
//
// `can.compute` allows the creation of observable values in different forms.
// This module is now just a facade around [proto_compute.js](proto_compute.html).
// `proto_compute.js` provides `can.Compute` as a constructor function where this file,
// `compute.js` wraps an instance of a `can.Compute` with a function.
//
// Other files:
// - [get_value_and_bind.js](get_value_and_bind.js) provides the low-level utility for observing functions.
// - [read.js](read.html) provides a helper that read properties and values in an observable way.



var Compute = require('./proto-compute');
var namespace = require('can-namespace');
var singleReference = require("can-single-reference");

var canReflect = require('can-reflect/reflections/get-set/get-set');
var canSymbol = require('can-symbol');
var canOnValueSymbol = canSymbol.for("can.onValue"),
	canOffValueSymbol = canSymbol.for("can.offValue"),
	canGetValue = canSymbol.for("can.getValue"),
	canSetValue = canSymbol.for("can.setValue"),
	isValueLike = canSymbol.for("can.isValueLike"),
	isMapLike = canSymbol.for("can.isMapLike"),
	isListLike = canSymbol.for("can.isListLike"),
	isFunctionLike = canSymbol.for("can.isFunctionLike"),
	canValueHasDependencies = canSymbol.for("can.valueHasDependencies"),
	canGetValueDependencies = canSymbol.for("can.getValueDependencies");

// The `can.compute` generator function.
var addEventListener = function(ev, handler){
	var compute = this;
	var translationHandler;
	if(handler){
		translationHandler = function() {
		   handler.apply(compute, arguments);
	   };
	   singleReference.set(handler, this, translationHandler);
	}
	return compute.computeInstance.addEventListener(ev, translationHandler);
};

var removeEventListener = function(ev, handler){
		var args = [];
		if (typeof ev !== 'undefined') {
			args.push(ev);
			if (typeof handler !== 'undefined') {
				args.push(singleReference.getAndDelete(handler, this));
			}
		}
		return this.computeInstance.removeEventListener.apply(this.computeInstance, args);
};
var onValue = function(handler, queue){
		return this.computeInstance[canOnValueSymbol](handler, queue);
	},
	offValue = function(handler, queue){
		return this.computeInstance[canOffValueSymbol](handler, queue);
	},
	getValue = function(){
		return this.computeInstance.get();
	},
	setValue = function(value){
		return this.computeInstance.set(value);
	},
	hasDependencies = function(){
		return this.computeInstance.hasDependencies;
	},
	getDependencies = function() {
		return this.computeInstance[canGetValueDependencies]();
	};


var COMPUTE = function (getterSetter, context, eventName, bindOnce) {

	function compute(val) {
		if(arguments.length) {
			return compute.computeInstance.set(val);
		}

		return compute.computeInstance.get();
	}

	// Create an internal `can.Compute`.
	compute.computeInstance = new Compute(getterSetter, context, eventName, bindOnce);

	compute.on = compute.bind = compute.addEventListener = addEventListener;
	compute.off = compute.unbind = compute.removeEventListener = removeEventListener;
	compute.isComputed = compute.computeInstance.isComputed;

	compute.clone = function(ctx) {
		if(typeof getterSetter === 'function') {
			context = ctx;
		}
		return COMPUTE(getterSetter, context, ctx, bindOnce);
	};

	// forward on and off to the computeInstance as this doesn't matter
	canReflect.set(compute, canOnValueSymbol, onValue);
	canReflect.set(compute, canOffValueSymbol, offValue);
	canReflect.set(compute, canGetValue, getValue);
	canReflect.set(compute, canSetValue, setValue);
	canReflect.set(compute, isValueLike, true);
	canReflect.set(compute, isMapLike, false);
	canReflect.set(compute, isListLike, false);
	canReflect.set(compute, isFunctionLike, false);
	canReflect.set(compute, canValueHasDependencies, hasDependencies);
	canReflect.set(compute, canGetValueDependencies, getDependencies);
	return compute;
};

// ## Helpers

// ### truthy
// Wraps a compute with another compute that only changes when
// the wrapped compute's `truthiness` changes.
COMPUTE.truthy = function (compute) {
	return COMPUTE(function () {
		var res = compute();
		return !!res;
	});
};

// ### async
// A simple helper that makes an async compute a bit easier.
COMPUTE.async = function(initialValue, asyncComputer, context){
	return COMPUTE(initialValue, {
		fn: asyncComputer,
		context: context
	});
};

// ### compatability
// Setting methods that should not be around in 3.0.
COMPUTE.temporarilyBind = Compute.temporarilyBind;

module.exports = namespace.compute = COMPUTE;
