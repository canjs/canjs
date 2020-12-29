steal("can/util","can/compute","can/compute/get_value_and_bind.js",function(can,compute, ObservedInfo){
	// The goal of this is to create a high-performance compute that represents a key value from can.view.Scope.
	// If the key value is something like {{name}} and the context is a can.Map, a faster
	// binding path will be used where new rebindings don't need to be looked for with every change of 
	// the observable property.
	// However, if the property changes to a compute, then the slower `can.compute.read` method of
	// observing values will be used.
	
	
	var isFastPath = function(computeData){
		return computeData.reads &&
					// a single property read
					computeData.reads.length === 1 &&
					// on a map
					computeData.root instanceof can.Map &&
					// that isn't calling a function
					!can.isFunction(computeData.root[computeData.reads[0].key]);
	};
	
	var scopeReader = function(scope, key, options, computeData, newVal){
		if (arguments.length > 4) {
			var root = computeData.root || computeData.setRoot;
			if(root) {
				if(root.isComputed) {
					root(newVal);
				} else if(computeData.reads.length) {
					var last = computeData.reads.length - 1;
					var obj = computeData.reads.length ? can.compute.read(root, computeData.reads.slice(0, last)).value
						: root;
					can.compute.set(obj, computeData.reads[last].key, newVal, options);
				}
			} else {
				// WARN ... you can't set nothing
			}
			// **Compute getter**
		} else {
			// If computeData has found the value for the key in the past in an observable then go directly to
			// the observable (computeData.root) that the value was found in the last time and return the new value.  This
			// is a huge performance gain for the fact that we aren't having to check the entire scope each time.
			if (computeData.root) {
				return can.compute.read(computeData.root, computeData.reads, options)
					.value;
			}
			// If the key has not already been located in a observable then we need to search the scope for the
			// key.  Once we find the key then we need to return it's value and if it is found in an observable
			// then we need to store the observable so the next time this compute is called it can grab the value
			// directly from the observable.
			var data = scope.read(key, options);
			computeData.scope = data.scope;
			computeData.initialValue = data.value;
			computeData.reads = data.reads;
			computeData.root = data.rootObserve;
			computeData.setRoot = data.setRoot;
			return data.value;
		}
	};
	
	return function(scope, key, options){
		options = options || {
			args: []
		};
		// the object we are returning
		var computeData = {},
			// a function that can be passed to getValueAndBind, or used as a setter
			scopeRead = function (newVal) {
				if(arguments.length) {
					return scopeReader(scope, key, options, computeData, newVal);
				} else {
					return scopeReader(scope, key, options, computeData);
				}
			},
			compute = can.compute(undefined,{
				on: function() {
					// setup the observing
					readInfo.getValueAndBind();
					
					if( isFastPath(computeData) ) {
						// When the one dependency changes, we can simply get its newVal and
						// save it.  If it's a function, we need to start binding the old way.
						readInfo.dependencyChange = function(ev, newVal){
							if(typeof newVal !== "function") {
								this.newVal = newVal;
							} else {
								// restore
								readInfo.dependencyChange = ObservedInfo.prototype.dependencyChange;
								readInfo.getValueAndBind = ObservedInfo.prototype.getValueAndBind;
							}
							return ObservedInfo.prototype.dependencyChange.call(this, ev);
						};
						readInfo.getValueAndBind = function(){
							this.value = this.newVal;
						};
					}
					// TODO deal with this right
					compute.computeInstance.value = readInfo.value;
					compute.computeInstance.hasDependencies = !can.isEmptyObject(readInfo.newObserved);
				},
				off: function(){
					readInfo.dependencyChange = ObservedInfo.prototype.dependencyChange;
					readInfo.getValueAndBind = ObservedInfo.prototype.getValueAndBind;
					readInfo.teardown();
				},
				set: scopeRead,
				get: scopeRead,
				// a hack until we clean up can.compute for 3.0
				__selfUpdater: true
			}),
			
			// the observables read by the last calling of `scopeRead`
			readInfo = new ObservedInfo(scopeRead, null, compute.computeInstance);
		
		computeData.compute = compute;
		return computeData;
		
	};
});
