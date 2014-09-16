/* jshint maxdepth:7*/

// # can.compute
// 
// `can.compute` allows creation of observable values
// from the result of a funciton. Any time an observable
// value that the function depends on changes, the
// function automatically updates. This enables creating
// observable data that relies on other sources, potentially
// multiple different ones. For instance, a `can.compute` is
// able to:
// - Combine a first and last name into a full name and update when either changes
// - Calculate the absolute value of an observable number, updating any time the observable number does
// - Specify complicated behavior for getting and setting a value, as well as how to handle changes

steal('can/util', 'can/compute/proto_compute.js', 'can/util/bind', 'can/util/batch', /*'can/compute/proto_compute.js',*/ function (can, bind) {

	// ## Reading Helpers
	//
	// The following methods are used to call a function that relies on
	// observable data and to track the observable events which should 
	// be listened to when changes occur.
	// To do this, [`can.__reading(observable, event)`](#can-__reading) is called to
	// "broadcast" the corresponding event on each read.
	// 
	// ### Observed
	//
	// An "Observed" is an object of observable objects and events that
	// a function relies on. These objects and events must be listened to
	// in order to determine when to check a function for updates.
	// This looks like the following:
	//
	//     { 
	//       "map1|first": {obj: map, event: "first"},
	//       "map1|last" : {obj: map, event: "last"}
	//     }
	// 
	// Each object-event pair is mapped so no duplicates will be listed.

	// ## Creating a can.compute
	//
	// A `can.compute` can be created by
	// - [Specifying the getterSeter function](#specifying-gettersetter-function)
	// - [Observing a property of an object](#observing-a-property-of-an-object)
	// - [Specifying an initial value and a setter function](#specifying-an-initial-value-and-a-setter)
	// - [Specifying an initial value and how to read, update, and listen to changes](#specifying-an-initial-value-and-a-settings-object)
	// - [Simply specifying an initial value](#specifying-only-a-value)
	var methods = {};

	can.each(['bind', 'unbind', 'clone'], function(name) {
		methods[name] = function() {
			this._computeInstance.bind.apply(this._computeInstance, arguments);
			return this;
		}
	});

	can.compute = function (getterSetter, context, eventName, bindOnce) {
		var c = new can.Compute(getterSetter, context, eventName, bindOnce);

		var computed = c.toFunction();
		computed._computeInstance = c;

		//TODO: toFunction for c, toInstance for computed
		can.simpleExtend(computed, methods);
		computed.isComputed = true;

		return computed;
	};

	// A list of temporarily bound computes
	var computes, unbindComputes = function () {
			for (var i = 0, len = computes.length; i < len; i++) {
				computes[i].unbind('change', k);
			}
			computes = null;
	};

	// Binds computes for a moment to retain their value and prevent caching
	can.compute.temporarilyBind = function (compute) {
		compute.bind('change', k);
		if (!computes) {
			computes = [];
			setTimeout(unbindComputes, 10);
		}
		computes.push(compute);
	};

	// Whether a compute is truthy
	can.compute.truthy = function (compute) {
		return can.compute(function () {
			var res = compute();
			if (typeof res === 'function') {
				res = res();
			}
			return !!res;
		});
	};

	can.compute.async = function(initialValue, asyncComputer, context){
		return can.compute(initialValue, {
			fn: asyncComputer,
			context: context
		});
	};
	// {map: new can.Map({first: "Justin"})}, ["map","first"]
	can.compute.read = function (parent, reads, options) {
		options = options || {};
		// `cur` is the current value.
		var cur = parent,
			type,
			// `prev` is the object we are reading from.
			prev,
			// `foundObs` did we find an observable.
			foundObs;
		for (var i = 0, readLength = reads.length; i < readLength; i++) {
			// Update what we are reading from.
			prev = cur;
			// Read from the compute. We can't read a property yet.
			if (prev && prev.isComputed) {
				if (options.foundObservable) {
					options.foundObservable(prev, i);
				}
				prev = cur = prev();
			}
			// Look to read a property from something.
			if (isObserve(prev)) {
				if (!foundObs && options.foundObservable) {
					options.foundObservable(prev, i);
				}
				foundObs = 1;
				// is it a method on the prototype?
				if (typeof prev[reads[i]] === 'function' && prev.constructor.prototype[reads[i]] === prev[reads[i]]) {
					// call that method
					if (options.returnObserveMethods) {
						cur = cur[reads[i]];
					} else if (reads[i] === 'constructor' && prev instanceof can.Construct) {
						cur = prev[reads[i]];
					} else {
						cur = prev[reads[i]].apply(prev, options.args || []);
					}
				} else {
					// use attr to get that value
					cur = cur.attr(reads[i]);
				}
			} else {
				// just do the dot operator
				cur = prev[reads[i]];
			}
			type = typeof cur;
			// If it's a compute, get the compute's value
			// unless we are at the end of the 
			if (cur && cur.isComputed && (!options.isArgument && i < readLength - 1)) {
				if (!foundObs && options.foundObservable) {
					options.foundObservable(prev, i + 1);
				}
				cur = cur();
			}
			// If it's an anonymous function, execute as requested
			else if (i < reads.length - 1 && type === 'function' && options.executeAnonymousFunctions && !(can.Construct && cur.prototype instanceof can.Construct)) {
				cur = cur();
			}
			// if there are properties left to read, and we don't have an object, early exit
			if (i < reads.length - 1 && (cur === null || type !== 'function' && type !== 'object')) {
				if (options.earlyExit) {
					options.earlyExit(prev, i, cur);
				}
				// return undefined so we know this isn't the right value
				return {
					value: undefined,
					parent: prev
				};
			}
		}
		// handle an ending function
		// unless it is a can.Construct-derived constructor
		if (typeof cur === 'function' && !(can.Construct && cur.prototype instanceof can.Construct) && !(can.route && cur === can.route)) {
			if (options.isArgument) {
				if (!cur.isComputed && options.proxyMethods !== false) {
					cur = can.proxy(cur, prev);
				}
			} else {
				if (cur.isComputed && !foundObs && options.foundObservable) {
					options.foundObservable(cur, i);
				}
				cur = cur.call(prev);
			}
		}
		// if we don't have a value, exit early.
		if (cur === undefined) {
			if (options.earlyExit) {
				options.earlyExit(prev, i - 1);
			}
		}
		return {
			value: cur,
			parent: prev
		};
	};

	return can.compute;
});
