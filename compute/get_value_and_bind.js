// # can/compute/get_value_and_bind
//
// This module:
//
// Exports a function that calls an arbitrary function and binds to any observables that
// function reads. When any of those observables change, a callback function is called.
//
// And ...
//
// Adds two main methods to can:
//
// - can.__observe - All other observes call this method to be visible to computed functions.
// - can.__notObserve - Returns a function that can not be observed.
steal("can/util", function(){
	
	// ## getValueAndBind
	// Calls `func` with "this" as `context` and binds to any observables that
	// `func` reads. When any of those observables change, `onchanged` is called.  
	// `oldObservedInfo` is A map of observable / event pairs this function used to be listening to.  
	// Returns the `newInfo` set of listeners and the value `func` returned.
	function getValueAndBind( func, context, oldObservedInfo, onchanged ) {
		// Call the function, get the value as well as the observed objects and events
		var newObservedInfo = getValueAndObserved(func, context),
			newObserveSet = newObservedInfo.observed,
			oldObserved = oldObservedInfo.observed;
		
		// If the names of what we've bound to have changed,
		// bind on what's new and unbind on what's old.
		if(newObservedInfo.names !== oldObservedInfo.names) {
			bindNewSet(oldObserved, newObserveSet, onchanged);
			unbindOldSet(oldObserved, onchanged);
		}
		
		// Set ready after all previous events have fired.
		can.batch.afterPreviousEvents(function(){
			newObservedInfo.ready = true;
		});
		
		return newObservedInfo;
	}
	// ### getValueAndObserved
	// Reads a function and returns its observedInfo object.
	var getValueAndObserved = function (func, self) {
		
		// Add this function call's observedInfo to the stack,
		// runs the function, pops off the observedInfo, and returns it.
		
		observedInfoStack.push({names: "", observed: {}});
		var value = func.call(self);

		var stackItem = observedInfoStack.pop();
		stackItem.value = value;
		return stackItem;
	};

	// ### bindNewSet
	// Binds to all observables in `newObserveSet` that are not in
	// `oldObserved` set.
	var bindNewSet = function(oldObserved, newObserveSet, onchanged){
		for(var name in newObserveSet ) {
			bindOrPreventUnbinding(oldObserved, newObserveSet, name, onchanged);
		}
	};

	// ### bindOrPreventUnbinding
	// Binds on a particular observable if it is not in `oldObserved`.
	// If it is in `oldObserved` deletes it so it is not unbound.
	var bindOrPreventUnbinding = function(oldObserved, newObserveSet, name, onchanged){
		if( oldObserved[name] ) {
			delete oldObserved[name];
		} else {
			var obEv = newObserveSet[name];
			obEv.obj.bind(obEv.event, onchanged);
		}
	};

	// ### unbindOldSet
	// Unbinds everything in `oldObserved`.
	var unbindOldSet = function(oldObserved, onchanged){
		for (var name in oldObserved) {
			var obEv = oldObserved[name];
			obEv.obj.unbind(obEv.event, onchanged);
		}
	};
	
	

	// ### observedInfoStack
	//
	// This is the stack of all `observedInfo` objects that are the result of
	// recursive `getValueAndBind` calls.  
	// `getValueAndBind` can indirectly call itself anytime a compute reads another 
	// compute.
	//
	// An `observedInfo` entry looks like:
	//
	//     {
	//       observed: { 
	//         "map1|first": {obj: map, event: "first"},
	//         "map1|last" : {obj: map, event: "last"}
	//       },
	//       names: "map1|firstmap1|last"
	//     }
	//
	// Where:
	// - `observed` is a map of `"cid|event"` to the observable and event.
	//   We use keys like `"cid|event"` to quickly identify if we have already observed this observable.
	// - `names` is all the keys so we can quickly tell if two observedInfo objects are the same.
	var observedInfoStack = [];
	
	// ## can.__observe
	// Indicates that an observable is being read.  
	// Updates the top of the stack with the observable being read.
	can.__observe = can.__reading = function (obj, event) {
		if (observedInfoStack.length) {
			var name = obj._cid + '|' + event,
				top = observedInfoStack[observedInfoStack.length-1];
			
			top.names += name;
			top.observed[name] = {
				obj: obj,
				event: event + ""
			};
		}
	};
	// ### can.__isRecordingObserves
	// Returns if some function is in the process of recording observes.
	can.__isRecordingObserves = function(){
		return observedInfoStack.length;
	};
	
	// ### can.__notObserve
	// Protects a function from being observed.
	can.__notObserve = function(fn){
		return function(){
			var previousReads = can.__clearObserved();
			var res = fn.apply(this, arguments);
			can.__setObserved(previousReads);
			return res;
		};
	};
	
	// ### can.__clearObserved
	// Whipes out all previous `can.__observe` calls for the current
	// `getValueAndBind`.
	can.__clearObserved = can.__clearReading = function () {
		if (observedInfoStack.length) {
			var ret = observedInfoStack[observedInfoStack.length-1];
			observedInfoStack[observedInfoStack.length-1] = {names: "", observed: {}};
			return ret;
		}
	};

	// ### can.__setObserved
	// Restores an observedInfo object, overwriting anything that
	// might have come before.
	can.__setObserved = can.__setReading = function (o) {
		if (observedInfoStack.length) {
			observedInfoStack[observedInfoStack.length-1] = o;
		}
	};

	// ### can.__addObserved
	// Merges an observedInfo object into the current 
	// `getValueAndBind`'s observedInfo object.
	can.__addObserved = can.__addReading = function(o){
		if (observedInfoStack.length) {
			var last = observedInfoStack[observedInfoStack.length-1];
			can.simpleExtend(last.observed, o.observed);
			last.names += o.names;
		}
	};

	return getValueAndBind;

});
