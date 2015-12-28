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
	
	function ObservedInfo(func, context, compute){
		this.newObserved = {};
		this.oldObserved = null;
		this.func = func;
		this.context = context;
		this.compute = compute;
		this.onDependencyChange = can.proxy(this.onDependencyChange, this);
		this.depth = null;
		this.childDepths = {};
		///this.count = 0;
		this.ignore = 0;
		this.inBatch = false;
		this.ready = false;
		compute.observedInfo = this;
		this.setReady = can.proxy(this._setReady, this);
	}
	
	can.simpleExtend(ObservedInfo.prototype,{
		_setReady: function(){
			this.ready = true;
		},
		getDepth: function(){
			if(this.depth !== null) {
				return this.depth;
			} else {
				return (this.depth = this._getDepth());
			}
		},
		_getDepth: function(){
			var max = 0,
				childDepths = this.childDepths;
			for(var cid in childDepths) {
				if(childDepths[cid] > max) {
					max = childDepths[cid];
				}
			}
			return max+1;
		},
		addEdge: function(objEv){
			objEv.obj.bind(objEv.event, this.onDependencyChange);
			if(objEv.obj.observedInfo) {
				this.childDepths[objEv.obj._cid] = objEv.obj.observedInfo.getDepth();
				this.depth = null;
			}
		},
		removeEdge: function(objEv){
			objEv.obj.unbind(objEv.event, this.onDependencyChange);
			if(objEv.obj.observedInfo) {
				delete this.childDepths[objEv.obj._cid];
				this.depth = null;
			}
		},
		onDependencyChange: function(ev){
			if(this.bound && this.ready) {
				if(ev.batchNum !== undefined) {
					// Only need to register once per batchNum
					if(ev.batchNum !== this.batchNum) {
						ObservedInfo.registerUpdate(this);
						this.batchNum = ev.batchNum;
					}
				} else {
					this.updateCompute(ev.batchNum);
				}
			}
		},
		updateCompute: function(batchNum){
			// Keep the old value.
			var oldValue = this.value;
			// Get the new value and register this event handler to any new observables.
			this.getValueAndBind();
			// Update the compute with the new value.
			this.compute.updater(this.value, oldValue, batchNum);
			
		},
		// ## getValueAndBind
		// Calls `func` with "this" as `context` and binds to any observables that
		// `func` reads. When any of those observables change, `onchanged` is called.  
		// `oldObservedInfo` is A map of observable / event pairs this function used to be listening to.  
		// Returns the `newInfo` set of listeners and the value `func` returned.
		getValueAndBind: function() {
			this.bound = true;
			this.oldObserved = this.newObserved || {};
			this.ignore = 0;
			this.newObserved = {};
			this.ready = false;
			
			// Add this function call's observedInfo to the stack,
			// runs the function, pops off the observedInfo, and returns it.
			
			observedInfoStack.push(this);
			this.value = this.func.call(this.context);
			observedInfoStack.pop();
			this.updateBindings();
			can.batch.afterPreviousEvents(this.setReady);
		},
		// ### updateBindings
		// Unbinds everything in `oldObserved`.
		updateBindings: function(){
			var newObserved = this.newObserved,
				oldObserved = this.oldObserved,
				name,
				obEv;
			
			for (name in newObserved) {
				obEv = newObserved[name];
				if(!oldObserved[name]) {
					this.addEdge(obEv);
				} else {
					oldObserved[name] = null;
				}
			}
			for (name in oldObserved) {
				obEv = oldObserved[name];
				if(obEv) {
					this.removeEdge(obEv);
				}
			}
		},
		teardown: function(){
			// track this because events can be in the queue.
			this.bound = false;
			for (var name in this.newObserved) {
				var ob = this.newObserved[name];
				this.removeEdge(ob);
			}
			this.newObserved = {};
		}
	});
	

	
	var updateOrder = [],
		curDepth = Infinity,
		maxDepth = 0;
		
	// could get a registerUpdate from a 5 while a 1 is going on because the 5 listens to the 1
	ObservedInfo.registerUpdate = function(observeInfo, batchNum){
		var depth = observeInfo.getDepth()-1;
		curDepth = Math.min(depth, curDepth);
		maxDepth = Math.max(maxDepth, depth);
		var objs = updateOrder[depth];
		if(!objs) {
			objs = updateOrder[depth] = [];
		}
		objs.push(observeInfo);
	};
	ObservedInfo.batchEnd = function(batchNum){
		var cur;
		while( curDepth <= maxDepth ) {
			var last = updateOrder[curDepth];
			if(last && (cur = last.pop())) {
				cur.updateCompute(batchNum);
			} else {
				curDepth++;
			}
		}
		updateOrder = [];
		curDepth = Infinity;
		maxDepth = 0;
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
	can.__observe = function (obj, event) {
		var top = observedInfoStack[observedInfoStack.length-1];
		if (top) {
			var evStr = event + "",
				name = obj._cid + '|' + evStr;
			if(top.traps) {
				top.traps.push({obj: obj, event: evStr, name: name});
			}
			else if(!top.ignore && !top.newObserved[name]) {
				top.newObserved[name] = {
					obj: obj,
					event: evStr
				};
			}
			
		}
	};
	
	can.__reading = can.__observe;
	
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
		// a bit more optimized so we don't have to repeat everything in can.__observe
		var top = observedInfoStack[observedInfoStack.length-1];
		if (top) {
			for(var i =0, len = observes.length; i < len; i++) {
				var trap = observes[i],
					name = trap.name;
				
				if(!top.newObserved[name]) {
					top.newObserved[name] = trap;
				}
			}
		}
	};
	
	// ### can.__isRecordingObserves
	// Returns if some function is in the process of recording observes.
	can.__isRecordingObserves = function(){
		var len = observedInfoStack.length;
		return len && (observedInfoStack[len-1].ignore === 0);
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
	
	can.batch._onDispatchedEvents = ObservedInfo.batchEnd;
	
	return ObservedInfo;

});
