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
steal("can/util", function(can){
	
	// ## getValueAndBind
	// Calls `func` with "this" as `context` and binds to any observables that
	// `func` reads. When any of those observables change, `onchanged` is called.  
	// `oldObservedInfo` is A map of observable / event pairs this function used to be listening to.  
	// Returns the `newInfo` set of listeners and the value `func` returned.
	function getValueAndBind( func, context, oldObservedInfo, onchanged ) {
		
		var oldObserved = oldObservedInfo.newObserved || {},
			// Call the function, get the value as well as the observed objects and events
			newObservedInfo = getValueAndObserved(func, context, oldObserved, onchanged);
		
		// If the names of what we've bound to have changed,
		// bind on what's new and unbind on what's old.
		
		unbindOldSet(oldObserved, onchanged);
		
		
		// Set ready after all previous events have fired.
		can.batch.afterPreviousEvents(function(){
			newObservedInfo.ready = true;
		});
		
		return newObservedInfo;
	}
	// ### getValueAndObserved
	// Reads a function and returns its observedInfo object.
	var getValueAndObserved = function (func, self, oldObserved, onchanged) {
		
		// Add this function call's observedInfo to the stack,
		// runs the function, pops off the observedInfo, and returns it.
		
		observedInfoStack.push({names: "", newObserved: {}, oldObserved: oldObserved, onchanged: onchanged, ignore: 0});
		var value = func.call(self);

		var stackItem = observedInfoStack.pop();
		stackItem.value = value;
		return stackItem;
	};

	// ### unbindOldSet
	// Unbinds everything in `oldObserved`.
	var unbindOldSet = function(oldObserved, onchanged){
		for (var name in oldObserved) {
			var obEv = oldObserved[name];
			if(obEv) {
				obEv.obj.unbind(obEv.event, onchanged);
			}
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
	var observe = can.__observe = can.__reading = function (obj, event) {
		if (observedInfoStack.length) {
			var evStr = event + "",
				name = obj._cid + '|' + evStr,
				top = observedInfoStack[observedInfoStack.length-1];
			
			if(top.traps) {
				top.traps.push([obj, event]);
			} 
			else if(!top.ignore && !top.newObserved[name]) {
				top.newObserved[name] = {
					obj: obj,
					event: evStr
				};
				
				if(!(name in top.oldObserved)) {
					obj.bind(evStr, top.onchanged);
				}
				top.oldObserved[name] = null;
			}
			
		}
	};
	
	can.__trapObserves = function(){
		if (observedInfoStack.length) {
			var top = observedInfoStack[observedInfoStack.length-1];
			var traps = top.traps = [];
			return function(){
				top.traps = null;
				return traps;
			};
		} else {
			return function(){return [];};
		}
	};
	can.__observes = function(observes){
		for(var i =0, len = observes.length; i < len; i++) {
			observe(observes[i][0], observes[i][1]);
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
			if (observedInfoStack.length) {
				var top = observedInfoStack[observedInfoStack.length-1];
				top.ignore++;
				var res = fn.apply(this, arguments);
				top.ignore--;
				return res;
			} else {
				return fn.apply(this, arguments);
			}
		};
	};
	
	getValueAndBind.unbindReadInfo = function(readInfo, onchanged){
		for (var name in readInfo.newObserved) {
			var ob = readInfo.newObserved[name];
			ob.obj.unbind(ob.event, onchanged);
		}
	};

	return getValueAndBind;

});
