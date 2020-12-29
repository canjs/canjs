"use strict";
var canReflect = require("can-reflect");

var Compute = function(newVal) {
	if (arguments.length) {
		return canReflect.setValue(this, newVal);
	} else {
		return canReflect.getValue(this);
	}
};

var translationHelpers = new WeakMap();

module.exports = function(observable) {
	var compute = Compute.bind(observable);
	compute.on = compute.bind = compute.addEventListener = function(
		event,
		handler
	) {
		var translationHandler = translationHelpers.get(handler);
		if (!translationHandler) {
			translationHandler = function(newVal, oldVal) {
				handler.call(compute, { type: "change" }, newVal, oldVal);
			};
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				Object.defineProperty(translationHandler, "name", {
					value:
						"translationHandler(" +
						event +
						")::" +
						canReflect.getName(observable) +
						".onValue(" +
						canReflect.getName(handler) +
						")"
				});
			}
			//!steal-remove-end
			translationHelpers.set(handler, translationHandler);
		}
		canReflect.onValue(observable, translationHandler);
	};
	compute.off = compute.unbind = compute.removeEventListener = function(
		event,
		handler
	) {
		canReflect.offValue(observable, translationHelpers.get(handler));
	};

	canReflect.assignSymbols(compute, {
		"can.getValue": function() {
			return canReflect.getValue(observable);
		},
		"can.setValue": function(newVal) {
			return canReflect.setValue(observable, newVal);
		},
		"can.onValue": function(handler, queue) {
			return canReflect.onValue(observable, handler, queue);
		},
		"can.offValue": function(handler, queue) {
			return canReflect.offValue(observable, handler, queue);
		},
		"can.valueHasDependencies": function() {
			return canReflect.valueHasDependencies(observable);
		},
		"can.getPriority": function() {
			return canReflect.getPriority(observable);
		},
		"can.setPriority": function(newPriority) {
			canReflect.setPriority(observable, newPriority);
		},
		"can.isValueLike": true,
		"can.isFunctionLike": false
	});
	compute.isComputed = true;
	return compute;
};
