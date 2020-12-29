"use strict";
var canKey = require("can-key");
var canReflect = require("can-reflect");
var keyObservable = require("can-simple-observable/key/key");
var namespace = require("can-namespace");
var Observation = require("can-observation");
var SimpleObservable = require("can-simple-observable");
var SettableObservable = require("can-simple-observable/settable/settable");

module.exports = namespace.value = {
	bind: function(object, keyPath) {
		return keyObservable(object, keyPath);
	},

	from: function(object, keyPath) {
		var observationFunction = function() {
			return canKey.get(object, keyPath);
		};

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			var objectName = canReflect.getName(object);
			Object.defineProperty(observationFunction, "name", {
				value: "ValueFrom<" + objectName + "." + keyPath + ">"
			});
		}
		//!steal-remove-end

		return new Observation(observationFunction);
	},

	returnedBy: function(getter, context, initialValue) {
		if(getter.length === 1) {
			return new SettableObservable(getter, context, initialValue);
		} else {
			return new Observation(getter, context);
		}
	},

	to: function(object, keyPath) {
		var observable = keyObservable(object, keyPath);

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			canReflect.assignSymbols(observable.onDependencyChange, {
				"can.getChangesDependencyRecord": function getChangesDependencyRecord() {
					// can-simple-observable/key/ creates an observation that walks along
					// the keyPath. In doing so, it implicitly registers the objects and
					// keys along the path as mutators of the observation; this means
					// getDependencyDataOf(...an object and key along the path) returns
					// whatIChange.derive.valueDependencies = [observable], which is not
					// true! The observable does not derive its value from the objects
					// along the keyPath. By implementing getChangesDependencyRecord and
					// returning undefined, calls to can.getWhatIChange() for any objects
					// along the keyPath will not include the observable.
				}
			});
		}
		//!steal-remove-end

		var symbolsToAssign = {
			// Remove the getValue symbol so the observable is only a setter
			"can.getValue": null
		};

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			symbolsToAssign["can.getValueDependencies"] = function getValueDependencies() {
				// Normally, getDependencyDataOf(observable) would include
				// whatChangesMe.derive.keyDependencies, and it would contain
				// the object and anything along keyPath. This symbol returns
				// undefined because this observable does not derive its value
				// from the object or anything along the keyPath, it only
				// mutates the last object in the keyPath.
			};
		}
		//!steal-remove-end

		return canReflect.assignSymbols(observable, symbolsToAssign);
	},

	with: function(initialValue) {
		return new SimpleObservable(initialValue);
	}
};
