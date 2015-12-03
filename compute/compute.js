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
steal('can/util', 'can/util/bind', 'can/util/batch', 'can/compute/proto_compute.js', function (can, bind) {

	// The `can.compute` generator function.

	can.compute = function (getterSetter, context, eventName, bindOnce) {
		// Create an internal `can.Compute`.
		var internalCompute = new can.Compute(getterSetter, context, eventName, bindOnce);
		// The "compute" function that calls compute instance's get or set function. 
		var bind = internalCompute.bind;
		var unbind = internalCompute.unbind;
		var compute = function(val) {
			if(arguments.length) {
				return internalCompute.set(val);
			}

			return internalCompute.get();
		};
		var cid = can.cid(compute, 'compute');
		var handlerKey = '__handler' + cid;

		compute.bind = function(ev, handler) {
			var computeHandler = handler && handler[handlerKey];
			if(handler && !computeHandler) {
				computeHandler = handler[handlerKey] = function() {
					handler.apply(compute, arguments);
				};
			}

			return bind.call(internalCompute, ev, computeHandler);
		};
		compute.unbind = function(ev, handler) {
			var computeHandler = handler && handler[handlerKey];
			if(computeHandler) {
				delete handler[handlerKey];
				return internalCompute.unbind(ev, computeHandler);
			}
			return unbind.apply(internalCompute, arguments);
		};
		compute.isComputed = internalCompute.isComputed;
		compute.clone = function(ctx) {
			if(typeof getterSetter === 'function') {
				context = ctx;
			}
			return can.compute(getterSetter, context, ctx, bindOnce);
		};

		compute.computeInstance = internalCompute;

		return compute;
	};
	
	// ## Helpers
	
	// ### truthy
	// Wraps a compute with another compute that only changes when 
	// the wrapped compute's `truthiness` changes.
	can.compute.truthy = function (compute) {
		return can.compute(function () {
			var res = compute();
			if (typeof res === 'function') {
				res = res();
			}
			return !!res;
		});
	};
	
	// ### async
	// A simple helper that makes an async compute a bit easier.
	can.compute.async = function(initialValue, asyncComputer, context){
		return can.compute(initialValue, {
			fn: asyncComputer,
			context: context
		});
	};

	// ### compatability
	// Setting methods that should not be around in 3.0.
	can.compute.read = can.Compute.read;
	can.compute.set = can.Compute.set;
	can.compute.temporarilyBind = can.Compute.temporarilyBind;

	return can.compute;
});
