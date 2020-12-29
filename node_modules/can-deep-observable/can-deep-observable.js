const ObservableArray = require("can-observable-array");
const ObservableObject = require("can-observable-object");
const namespace = require("can-namespace");
const canReflect = require("can-reflect");
const type = require("can-type");

class DeepObservableObject extends ObservableObject {
	static get propertyDefaults() {
		return type.maybeConvert(DeepObservable);
	}
}

class DeepObservableArray extends ObservableArray {
	static get items() {
		return type.maybeConvert(DeepObservable);
	}
}

function isPlainArray(array) {
	return Array.isArray(array) && array.constructor === Array;
}

function DeepObservable() {}

canReflect.assignSymbols(DeepObservable, {
	"can.new": function(value) {
		if(isPlainArray(value)) {
			return new DeepObservableArray(value);
		}
		else if(canReflect.isPlainObject(value)) {
			return new DeepObservableObject(value);
		} else {
			return value;
		}
	}
});

module.exports = namespace.DeepObservable = type.maybeConvert(DeepObservable);
